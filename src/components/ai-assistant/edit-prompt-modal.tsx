'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Pencil, Info } from 'lucide-react'
import { getCustomGenre } from '@/lib/custom-genres-storage'

interface EditPromptModalProps {
  open: boolean
  onClose: () => void
  genreId: string
  onSave: (genreName: string, sunoPrompt: string) => void
}

export function EditPromptModal({ open, genreId, onClose, onSave }: EditPromptModalProps) {
  const [genreName, setGenreName] = useState('')
  const [sunoPrompt, setSunoPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Load existing genre data
  useEffect(() => {
    if (open && genreId) {
      const genre = getCustomGenre(genreId)
      if (genre) {
        setGenreName(genre.display_name)
        setSunoPrompt(genre.sunoPrompt)
      }
    }
  }, [open, genreId])

  const handleSave = () => {
    if (!genreName.trim() || !sunoPrompt.trim()) return

    setIsLoading(true)
    onSave(genreName.trim(), sunoPrompt.trim())
    setIsLoading(false)
    onClose()
  }

  const handleClose = () => {
    onClose()
    // Reset after animation
    setTimeout(() => {
      setGenreName('')
      setSunoPrompt('')
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Pencil className="w-5 h-5 text-blue-600" />
            </div>
            <DialogTitle>Rediger sjanger</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Genre Name */}
          <div className="space-y-2">
            <Label htmlFor="genre-name">Sjangernavn</Label>
            <Input
              id="genre-name"
              value={genreName}
              onChange={(e) => setGenreName(e.target.value)}
              placeholder="F.eks: '80s Synth Pop'"
              maxLength={30}
            />
          </div>

          {/* Suno Prompt */}
          <div className="space-y-2">
            <Label htmlFor="suno-prompt">Suno Prompt</Label>
            <Textarea
              id="suno-prompt"
              value={sunoPrompt}
              onChange={(e) => setSunoPrompt(e.target.value)}
              placeholder="F.eks: 80s synth-pop, synthesizers, nostalgic energetic, female vocals"
              rows={5}
              className="font-mono text-sm"
            />
            <div className="flex items-start gap-2 text-xs text-text-secondary">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                Suno-prompts bør være på engelsk, komma-separert, og inneholde: stil, instrumenter, stemning, og valgfrie detaljer (vokal, tempo, etc.)
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Avbryt
          </Button>
          <Button
            onClick={handleSave}
            disabled={!genreName.trim() || !sunoPrompt.trim() || isLoading}
          >
            Lagre endringer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
