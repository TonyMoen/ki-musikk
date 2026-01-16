'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ChatContainer } from './chat-container'
import { InputContainer } from './input-container'
import { useAIAssistant } from '@/hooks/use-ai-assistant'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'

interface CustomGenre {
  id: string
  name: string
  display_name: string
  sunoPrompt: string
  createdAt: Date
  isCustom: true
}

interface AIAssistantModalProps {
  open: boolean
  onClose: () => void
  onSaveGenre: (genre: CustomGenre) => void
}

export function AIAssistantModal({ open, onClose, onSaveGenre }: AIAssistantModalProps) {
  const [genreName, setGenreName] = useState('')
  const [hasStarted, setHasStarted] = useState(false)

  const assistant = useAIAssistant((genre) => {
    onSaveGenre(genre)
    onClose()
    // Reset state for next use
    setGenreName('')
    setHasStarted(false)
  })

  // Auto-send first message when modal opens
  useEffect(() => {
    if (open && !hasStarted) {
      // Trigger first AI question by sending empty message
      setTimeout(() => {
        assistant.handleUserResponse('start')
        setHasStarted(true)
      }, 500)
    }
  }, [open, hasStarted, assistant])

  const handleClose = () => {
    onClose()
    // Reset state
    setGenreName('')
    setHasStarted(false)
    assistant.resetConversation()
  }

  const handleSave = () => {
    if (genreName.trim()) {
      assistant.saveGenre(genreName.trim())
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[460px] max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold">AI Sjanger-assistent</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <ChatContainer messages={assistant.messages} />

          {/* Loading indicator */}
          {assistant.isLoading && (
            <div className="px-6 pb-4 flex items-center gap-2 text-sm text-text-secondary">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI tenker...</span>
            </div>
          )}

          {/* Error message */}
          {assistant.error && (
            <div className="px-6 pb-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {assistant.error}
              </div>
            </div>
          )}

          <InputContainer
            placeholder={assistant.getCurrentPlaceholder()}
            value={assistant.isComplete ? genreName : undefined}
            onChange={assistant.isComplete ? setGenreName : undefined}
            onSubmit={
              assistant.isComplete
                ? handleSave
                : assistant.handleUserResponse
            }
            submitLabel={assistant.isComplete ? "Lagre sjanger" : "Send"}
            submitDisabled={
              assistant.isLoading ||
              (assistant.isComplete && !genreName.trim())
            }
          />
        </div>

        <div className="px-6 pb-6 border-t border-border pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full"
            disabled={assistant.isLoading}
          >
            Avbryt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
