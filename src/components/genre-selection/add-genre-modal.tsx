'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PenLine, Bot, Library, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

type ModalView = 'choice' | 'custom-prompt'

interface AddGenreModalProps {
  open: boolean
  onClose: () => void
  onSelectAIAssistant: () => void
  onSelectLibrary: () => void
  onCreateCustomGenre: (name: string, prompt: string) => void
}

export function AddGenreModal({
  open,
  onClose,
  onSelectAIAssistant,
  onSelectLibrary,
  onCreateCustomGenre
}: AddGenreModalProps) {
  const [view, setView] = useState<ModalView>('choice')
  const [customName, setCustomName] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose()
      // Reset state when closing
      setView('choice')
      setCustomName('')
      setCustomPrompt('')
    }
  }

  const handleSelectCustomPrompt = () => {
    setView('custom-prompt')
  }

  const handleSelectAI = () => {
    onClose()
    onSelectAIAssistant()
  }

  const handleSelectLib = () => {
    onClose()
    onSelectLibrary()
  }

  const handleCreateCustom = () => {
    if (customName.trim() && customPrompt.trim()) {
      onCreateCustomGenre(customName.trim(), customPrompt.trim())
      handleOpenChange(false)
    }
  }

  const handleBackToChoice = () => {
    setView('choice')
    setCustomName('')
    setCustomPrompt('')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {view === 'custom-prompt' && (
              <button
                onClick={handleBackToChoice}
                className="p-1 hover:bg-[rgba(40,80,160,0.15)] rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            {view === 'choice' ? 'Legg til sjanger' : 'Egendefinert prompt'}
          </DialogTitle>
        </DialogHeader>

        {view === 'choice' ? (
          // Choice View
          <div className="space-y-3 pt-2">
            <button
              onClick={handleSelectCustomPrompt}
              className={cn(
                "w-full p-4 rounded-lg border-2 border-[rgba(90,140,255,0.1)]",
                "hover:border-purple-400 hover:bg-purple-50 transition-all",
                "flex items-start gap-4 text-left"
              )}
            >
              <div className="p-2 rounded-full bg-purple-100">
                <PenLine className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Egendefinert prompt</h3>
                <p className="text-sm text-[rgba(180,200,240,0.5)] mt-0.5">
                  Skriv din egen stil og beskrivelse
                </p>
              </div>
            </button>

            <button
              onClick={handleSelectAI}
              className={cn(
                "w-full p-4 rounded-lg border-2 border-[rgba(90,140,255,0.1)]",
                "hover:border-orange-400 hover:bg-orange-50 transition-all",
                "flex items-start gap-4 text-left"
              )}
            >
              <div className="p-2 rounded-full bg-orange-100">
                <Bot className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-white">AI-assistent</h3>
                <p className="text-sm text-[rgba(180,200,240,0.5)] mt-0.5">
                  Fa hjelp til a lage en unik sjanger
                </p>
              </div>
            </button>

            <button
              onClick={handleSelectLib}
              className={cn(
                "w-full p-4 rounded-lg border-2 border-[rgba(90,140,255,0.1)]",
                "hover:border-blue-400 hover:bg-blue-50 transition-all",
                "flex items-start gap-4 text-left"
              )}
            >
              <div className="p-2 rounded-full bg-blue-100">
                <Library className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Bibliotek</h3>
                <p className="text-sm text-[rgba(180,200,240,0.5)] mt-0.5">
                  Velg fra ferdige maler og arkiv
                </p>
              </div>
            </button>
          </div>
        ) : (
          // Custom Prompt View
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-[rgba(180,200,240,0.5)] mb-1.5 block">
                Sjangernavn
              </label>
              <Input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="F.eks. Min Rock, Sommerviser..."
                className="text-white"
                autoFocus
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[rgba(180,200,240,0.5)] mb-1.5 block">
                Suno prompt
              </label>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Beskriv stilen for Suno AI, f.eks: rock, electric guitar, energetic drums, powerful vocals, 120 bpm"
                className="text-white min-h-[100px]"
              />
              <p className="text-xs text-[rgba(180,200,240,0.5)] mt-1.5">
                Tips: Beskriv instrumenter, tempo, stemning og stil
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleCreateCustom}
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={!customName.trim() || !customPrompt.trim()}
              >
                Opprett sjanger
              </Button>
              <Button variant="outline" onClick={handleBackToChoice}>
                Tilbake
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
