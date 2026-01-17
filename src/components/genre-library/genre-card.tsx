'use client'

import { Button } from '@/components/ui/button'
import type { LibraryGenre } from '@/lib/standard-genres'
import type { ArchivedGenre } from '@/hooks/use-genre-library'
import { formatDistanceToNow } from 'date-fns'
import { nb } from 'date-fns/locale'

interface GenreCardAction {
  label: string
  onClick: () => void
  variant: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}

interface GenreCardProps {
  genre: LibraryGenre | ArchivedGenre
  actions: GenreCardAction[]
  showArchiveDate?: boolean
}

function isArchivedGenre(genre: LibraryGenre | ArchivedGenre): genre is ArchivedGenre {
  return 'archivedAt' in genre && genre.archivedAt !== undefined
}

export function GenreCard({ genre, actions, showArchiveDate }: GenreCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 truncate">{genre.display_name}</h4>
          {showArchiveDate && isArchivedGenre(genre) && (
            <p className="text-xs text-gray-500 mt-1">
              Arkivert {formatDistanceToNow(new Date(genre.archivedAt), {
                addSuffix: true,
                locale: nb
              })}
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {actions.map((action, i) => (
            <Button
              key={i}
              onClick={action.onClick}
              disabled={action.disabled}
              size="sm"
              variant={action.variant === 'danger' ? 'destructive' : 'outline'}
              className={
                action.variant === 'primary'
                  ? 'bg-primary hover:bg-primary/90 text-white border-primary'
                  : action.variant === 'secondary'
                  ? 'bg-transparent hover:bg-gray-100'
                  : ''
              }
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2">{genre.sunoPrompt}</p>
    </div>
  )
}
