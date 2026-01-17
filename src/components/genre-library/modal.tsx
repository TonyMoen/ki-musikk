'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { GenreCard } from './genre-card'
import { useGenreLibrary } from '@/hooks/use-genre-library'
import { STANDARD_GENRES, type LibraryGenre } from '@/lib/standard-genres'

interface GenreLibraryModalProps {
  open: boolean
  onClose: () => void
  onGenreAdded?: (genre: LibraryGenre) => void
  onGenreArchived?: (genre: LibraryGenre) => void
  onGenreRestored?: (genre: LibraryGenre) => void
}

export function GenreLibraryModal({
  open,
  onClose,
  onGenreAdded,
  onGenreArchived,
  onGenreRestored
}: GenreLibraryModalProps) {
  const library = useGenreLibrary()
  const [activeTab, setActiveTab] = useState('active')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const filteredActive = library.filterGenres(library.activeGenres, library.searchQuery)
  const filteredArchived = library.filterGenres(library.archivedGenres, library.searchQuery)
  const filteredStandard = library.filterGenres(STANDARD_GENRES, library.searchQuery)

  const handleArchive = (genre: LibraryGenre) => {
    library.archiveGenre(genre)
    onGenreArchived?.(genre)
  }

  const handleRestore = (genreId: string) => {
    const restored = library.restoreGenre(genreId)
    if (restored) {
      onGenreRestored?.(restored)
    }
  }

  const handlePermanentDelete = (genreId: string) => {
    if (confirmDeleteId === genreId) {
      library.permanentDelete(genreId)
      setConfirmDeleteId(null)
    } else {
      setConfirmDeleteId(genreId)
      // Auto-reset after 3 seconds
      setTimeout(() => setConfirmDeleteId(null), 3000)
    }
  }

  const handleAddStandard = (genre: LibraryGenre) => {
    const added = library.addStandardGenre(genre)
    if (added) {
      onGenreAdded?.(genre)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose()
      // Reset state when closing
      library.setSearchQuery('')
      setConfirmDeleteId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
          <DialogTitle className="text-2xl font-bold">Sjanger-bibliotek</DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Sok etter sjanger eller stil..."
              value={library.searchQuery}
              onChange={(e) => library.setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mt-4 grid w-auto grid-cols-3">
            <TabsTrigger value="active">
              Aktive ({library.activeCount})
            </TabsTrigger>
            <TabsTrigger value="archived">
              Arkiverte ({library.archivedCount})
            </TabsTrigger>
            <TabsTrigger value="standard">
              Standard (8)
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-6 pb-6 mt-4">
            <TabsContent value="active" className="mt-0 space-y-3">
              {filteredActive.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {library.searchQuery
                    ? 'Ingen aktive sjangere matchet soket'
                    : 'Ingen aktive sjangere enna. Legg til fra Standard-fanen!'}
                </div>
              ) : (
                filteredActive.map((genre) => (
                  <GenreCard
                    key={genre.id}
                    genre={genre}
                    actions={[
                      {
                        label: 'Arkiver',
                        onClick: () => handleArchive(genre),
                        variant: 'secondary'
                      }
                    ]}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="archived" className="mt-0 space-y-3">
              {filteredArchived.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {library.searchQuery
                    ? 'Ingen arkiverte sjangere matchet soket'
                    : 'Ingen arkiverte sjangere'}
                </div>
              ) : (
                filteredArchived.map((genre) => (
                  <GenreCard
                    key={genre.id}
                    genre={genre}
                    showArchiveDate
                    actions={[
                      {
                        label: 'Gjenopprett',
                        onClick: () => handleRestore(genre.id),
                        variant: 'primary'
                      },
                      {
                        label: confirmDeleteId === genre.id ? 'Bekreft slett' : 'Slett permanent',
                        onClick: () => handlePermanentDelete(genre.id),
                        variant: 'danger'
                      }
                    ]}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="standard" className="mt-0 space-y-3">
              {filteredStandard.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Ingen standard sjangere matchet soket
                </div>
              ) : (
                filteredStandard.map((genre) => {
                  const isAlreadyAdded = library.isGenreActive(genre.id)
                  return (
                    <GenreCard
                      key={genre.id}
                      genre={genre}
                      actions={[
                        {
                          label: isAlreadyAdded ? 'Lagt til' : 'Legg til',
                          onClick: () => handleAddStandard(genre),
                          variant: 'primary',
                          disabled: isAlreadyAdded
                        }
                      ]}
                    />
                  )
                })
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
