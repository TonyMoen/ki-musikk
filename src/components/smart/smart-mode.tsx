'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useErrorToast } from '@/hooks/use-error-toast'
import {
  useGeneratingSongStore,
  MAX_CONCURRENT_SONGS,
} from '@/stores/generating-song-store'
import { useCreditsStore } from '@/stores/credits-store'
import { SmartInput } from './smart-input'
import { SmartReview } from './smart-review'
import type { QuickPick } from './hurtigvalg-chips'
import type {
  SmartGenerateData,
  SmartGenerateRequest,
  SmartGenerateResponse,
  Occasion,
} from '@/types/smart'

/**
 * Frontend-only mapping from quickPick chip → existing API params.
 * Bursdag/Russ map to the backend's `occasion` field; the genre-style chips
 * (Festmusikk/Country/Rock) ride along as a quickPick payload field that the
 * backend currently ignores — captured for future genre-bias support.
 */
const QUICK_PICK_OCCASION: Partial<Record<QuickPick, Occasion>> = {
  Bursdag: 'bursdag',
  Russ: 'russ',
}

const STAGE_VELGER = 'Velger sjanger…'
const STAGE_SKRIVER = 'Skriver tekst…'

const PENDING_SONG_KEY = 'kimusikk_pending_song'

interface SmartModeProps {
  /**
   * Triggered when the user clicks "Bytt til Tilpass" on the review screen.
   * Parent should switch the wizard mode to 'tilpass' — Smart will have
   * already written the wizard-format data to localStorage at Step 2.
   */
  onHandoffToTilpass: () => void
}

type Stage = 'input' | 'review'

/**
 * Smart-modus orchestrator. Owns the local state for the input + review stages
 * and wires up the API calls. Reuses the existing wizard's localStorage key
 * for both auth-gate persistence and the Smart→Tilpass handoff so the wizard
 * automatically restores state on next mount.
 */
export function SmartMode({ onHandoffToTilpass }: SmartModeProps) {
  const [stage, setStage] = useState<Stage>('input')

  // Input stage state
  const [concept, setConcept] = useState('')
  const [quickPick, setQuickPick] = useState<QuickPick | null>(null)
  const [generationStage, setGenerationStage] = useState<string | null>(null)
  const stageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Review stage state (populated by /api/songs/smart-generate)
  const [lyrics, setLyrics] = useState('')
  const [title, setTitle] = useState('')
  const [genreData, setGenreData] = useState<{
    id: string
    name: string
    displayName: string
    sunoPrompt: string
  } | null>(null)

  // Loading flags
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  const router = useRouter()
  const { toast } = useToast()
  const { showError } = useErrorToast()
  const { addGeneratingSong, canAddMoreSongs } = useGeneratingSongStore()

  // ---------- Stage cycler (UX progress) ----------

  // Cycles "Velger sjanger…" → "Skriver tekst…" while smart-generate runs.
  // Backend doesn't stream — fallback timer is the spec's prescribed mechanism.
  const startStageTimer = () => {
    setGenerationStage(STAGE_VELGER)
    stageTimerRef.current = setTimeout(() => {
      setGenerationStage(STAGE_SKRIVER)
    }, 4000)
  }

  const stopStageTimer = () => {
    if (stageTimerRef.current) {
      clearTimeout(stageTimerRef.current)
      stageTimerRef.current = null
    }
    setGenerationStage(null)
  }

  useEffect(() => {
    return () => {
      if (stageTimerRef.current) clearTimeout(stageTimerRef.current)
    }
  }, [])

  // ---------- API: smart-generate ----------

  const callSmartGenerate = async (): Promise<SmartGenerateData | null> => {
    const payload: SmartGenerateRequest = {
      concept,
      ...(quickPick ? { quickPick } : {}),
      ...(quickPick && QUICK_PICK_OCCASION[quickPick]
        ? { occasion: QUICK_PICK_OCCASION[quickPick] }
        : {}),
    }
    const response = await fetch('/api/songs/smart-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = (await response.json()) as SmartGenerateResponse
    if (!response.ok || !json.data) {
      throw new Error(json.error?.message || 'Kunne ikke generere tekst')
    }
    return json.data
  }

  const handleSubmitInput = async () => {
    setIsGenerating(true)
    startStageTimer()
    try {
      const data = await callSmartGenerate()
      if (!data) return
      setLyrics(data.lyrics)
      setTitle(data.title)
      setGenreData({
        id: data.genreId,
        name: data.genreName,
        displayName: data.genreDisplayName,
        sunoPrompt: data.genreSunoPrompt,
      })
      setStage('review')
    } catch (err) {
      showError(err, { context: 'smart-generate' })
    } finally {
      stopStageTimer()
      setIsGenerating(false)
    }
  }

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    startStageTimer()
    try {
      const data = await callSmartGenerate()
      if (!data) return
      setLyrics(data.lyrics)
      setTitle(data.title)
      setGenreData({
        id: data.genreId,
        name: data.genreName,
        displayName: data.genreDisplayName,
        sunoPrompt: data.genreSunoPrompt,
      })
    } catch (err) {
      showError(err, { context: 'smart-regenerate' })
    } finally {
      stopStageTimer()
      setIsRegenerating(false)
    }
  }

  // ---------- localStorage: write Smart state in wizard format ----------

  /**
   * Write Smart's data into the wizard's localStorage key so that on next
   * wizard mount the user lands at the requested step with everything filled.
   * Used for both the auth-gate detour AND the explicit Bytt-til-Tilpass switch.
   */
  const saveAsWizardPending = (currentStep: 2 | 3) => {
    if (!genreData) return
    try {
      const dataToSave = {
        genre: { id: genreData.id, name: genreData.name },
        concept,
        lyrics,
        isCustomTextMode: false,
        generatedTitle: title,
        originalLyrics: lyrics,
        currentStep,
        styleText: '', // Let wizard's Step 2 fall back to genre default
        songTitle: title,
        savedAt: Date.now(),
      }
      localStorage.setItem(PENDING_SONG_KEY, JSON.stringify(dataToSave))
    } catch (e) {
      console.warn('Smart: could not save wizard pending data:', e)
    }
  }

  // ---------- Handoff: switch to Tilpass ----------

  const handleSwitchToTilpass = () => {
    saveAsWizardPending(2) // Land on Step 2 (Stil & Sjanger)
    onHandoffToTilpass()
  }

  // ---------- Confirm: auth-gate + song generation ----------

  const handleConfirm = async () => {
    if (!genreData) return

    // Auth check (mirrors wizard-container.handleGenerateSong)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // Save Smart state so the user lands at wizard Step 3 ready to generate
      saveAsWizardPending(3)
      router.push('/auth/logg-inn')
      return
    }

    if (!canAddMoreSongs()) {
      toast({
        variant: 'destructive',
        title: `Maks ${MAX_CONCURRENT_SONGS} sanger samtidig`,
        description: 'Vent til en sang er ferdig før du starter en ny',
      })
      return
    }

    if (lyrics.trim().length === 0) {
      toast({
        variant: 'destructive',
        title: 'Ingen tekst',
        description: 'Sangteksten kan ikke være tom',
      })
      return
    }

    setIsConfirming(true)
    try {
      const response = await fetch('/api/songs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Min sang',
          genre: genreData.name,
          concept,
          lyrics,
          optimizedLyrics: null,
          phoneticEnabled: false,
          vocalGender: null,
        }),
      })

      const data = await response.json()
      if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Kunne ikke starte generering')
      }

      addGeneratingSong({
        id: data.data.songId,
        title: title || 'Min sang',
        genre: genreData.name,
        startedAt: new Date(),
      })

      if (data.data.balanceAfter !== undefined) {
        useCreditsStore.getState().setBalance(data.data.balanceAfter)
      }

      // Clear any wizard pending state (we generated successfully)
      try {
        localStorage.removeItem(PENDING_SONG_KEY)
      } catch (e) {
        // ignore
      }

      toast({
        title: 'Sangen din lages',
        description: 'Vent et øyeblikk — du finner den under Mine sanger',
      })

      // Reset Smart state so user can start a new song
      handleReset()
    } catch (error) {
      showError(error, {
        context: 'smart-confirm',
        onRetry: handleConfirm,
      })
    } finally {
      setIsConfirming(false)
    }
  }

  // ---------- Reset back to input stage ----------

  const handleReset = () => {
    setStage('input')
    setLyrics('')
    setTitle('')
    setGenreData(null)
    setConcept('')
    setQuickPick(null)
  }

  // ---------- Render ----------

  if (stage === 'input' || !genreData) {
    return (
      <SmartInput
        concept={concept}
        onConceptChange={setConcept}
        quickPick={quickPick}
        onQuickPickChange={setQuickPick}
        onSubmit={handleSubmitInput}
        isGenerating={isGenerating}
        generationStage={generationStage}
      />
    )
  }

  return (
    <SmartReview
      lyrics={lyrics}
      onLyricsChange={setLyrics}
      title={title}
      genreDisplayName={genreData.displayName}
      genreSunoPrompt={genreData.sunoPrompt}
      onReset={handleReset}
      onRegenerate={handleRegenerate}
      onSwitchToTilpass={handleSwitchToTilpass}
      onConfirm={handleConfirm}
      isRegenerating={isRegenerating}
      isConfirming={isConfirming}
    />
  )
}
