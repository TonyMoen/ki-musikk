'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ChatContainer } from './chat-container'
import { InputContainer } from './input-container'
import { useAIAssistant } from '@/hooks/use-ai-assistant'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, Check } from 'lucide-react'

interface AIAssistantModalProps {
  open: boolean
  onClose: () => void
  onUsePrompt: (prompt: string) => void
}

export function AIAssistantModal({ open, onClose, onUsePrompt }: AIAssistantModalProps) {
  const [hasStarted, setHasStarted] = useState(false)

  const assistant = useAIAssistant()

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
    setHasStarted(false)
    assistant.resetConversation()
  }

  const handleUsePrompt = () => {
    if (assistant.generatedPrompt) {
      onUsePrompt(assistant.generatedPrompt)
      handleClose()
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

          {/* Show input only if not complete */}
          {!assistant.isComplete && (
            <InputContainer
              placeholder="Skriv ditt svar her..."
              onSubmit={assistant.handleUserResponse}
              submitLabel="Send"
              submitDisabled={assistant.isLoading}
            />
          )}

          {/* Show "Use this prompt" button when complete */}
          {assistant.isComplete && assistant.generatedPrompt && (
            <div className="px-6 py-4 border-t border-border bg-primary/5">
              <p className="text-sm text-text-secondary mb-3">Prompt klar til bruk:</p>
              <div className="p-3 bg-card rounded-lg border border-border mb-4">
                <p className="text-sm font-mono text-text-primary">{assistant.generatedPrompt}</p>
              </div>
              <Button
                onClick={handleUsePrompt}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Check className="mr-2 h-4 w-4" />
                Bruk denne
              </Button>
            </div>
          )}
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
