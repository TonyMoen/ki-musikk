'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Star, Pencil, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getGenreSunoPrompt } from '@/lib/custom-genres-storage'

interface ExpandedGenreCardProps {
  genreId: string
  genreName: string
  sunoPrompt?: string
  onEdit: (newName: string, newPrompt: string) => void
  onClose?: () => void
}

export function ExpandedGenreCard({
  genreId,
  genreName,
  sunoPrompt: initialPrompt,
  onEdit,
  onClose
}: ExpandedGenreCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(genreName)
  const [editPrompt, setEditPrompt] = useState('')
  const [showFullPrompt, setShowFullPrompt] = useState(false)

  // Get the Suno prompt - either passed in or from storage
  const storedPrompt = getGenreSunoPrompt(genreId)
  const displayPrompt = initialPrompt || storedPrompt || 'Ingen prompt tilgjengelig'

  const handleStartEdit = () => {
    setEditName(genreName)
    setEditPrompt(displayPrompt)
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    if (editName.trim() && editPrompt.trim()) {
      onEdit(editName.trim(), editPrompt.trim())
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditName(genreName)
    setEditPrompt(displayPrompt)
  }

  // Truncate prompt for display
  const truncatedPrompt = displayPrompt.length > 120
    ? displayPrompt.substring(0, 120) + '...'
    : displayPrompt

  return (
    <div className={cn(
      "mt-3 p-4 rounded-lg border-2 border-primary bg-gradient-to-r from-orange-50 to-purple-50",
      "animate-in slide-in-from-top-2 duration-200"
    )}>
      {isEditing ? (
        // Edit Mode
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[rgba(180,200,240,0.5)]">Rediger sjanger</span>
            <button
              onClick={handleCancelEdit}
              className="p-1 hover:bg-[rgba(40,80,160,0.15)] rounded"
            >
              <X className="w-4 h-4 text-[rgba(180,200,240,0.5)]" />
            </button>
          </div>

          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Sjangernavn"
            className="text-white font-medium"
          />

          <Textarea
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            placeholder="Beskriv stilen for Suno AI..."
            className="text-white min-h-[80px] text-sm"
          />

          <div className="flex gap-2">
            <Button
              onClick={handleSaveEdit}
              className="bg-primary hover:bg-primary/90"
              disabled={!editName.trim() || !editPrompt.trim()}
            >
              <Check className="w-4 h-4 mr-1" />
              Lagre
            </Button>
            <Button variant="outline" onClick={handleCancelEdit}>
              Avbryt
            </Button>
          </div>
        </div>
      ) : (
        // Display Mode
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary fill-primary" />
              <h4 className="font-bold text-white text-lg">{genreName}</h4>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartEdit}
              className="text-primary border-primary hover:bg-primary/10"
            >
              <Pencil className="w-4 h-4 mr-1" />
              Rediger
            </Button>
          </div>

          <div className="bg-white/60 rounded-md p-3 border border-[rgba(90,140,255,0.1)]">
            <p className="text-sm text-[rgba(180,200,240,0.5)] font-medium mb-1">Suno prompt:</p>
            <p className="text-sm text-white">
              {showFullPrompt ? displayPrompt : truncatedPrompt}
            </p>
            {displayPrompt.length > 120 && (
              <button
                onClick={() => setShowFullPrompt(!showFullPrompt)}
                className="text-xs text-primary hover:underline mt-1"
              >
                {showFullPrompt ? 'Vis mindre' : 'Vis mer'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
