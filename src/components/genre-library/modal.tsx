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
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Search, PenLine } from 'lucide-react'
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

  // State for adding genre with custom name
  const [addingGenre, setAddingGenre] = useState<LibraryGenre | null>(null)
  const [customName, setCustomName] = useState('')

  // State for custom prompt creation
  const [showCustomPrompt, setShowCustomPrompt] = useState(false)
  const [customPromptName, setCustomPromptName] = useState('')
  const [customPromptText, setCustomPromptText] = useState('')

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
    // Show naming form instead of adding directly
    setAddingGenre(genre)
    setCustomName(genre.display_name)
  }

  const handleConfirmAdd = () => {
    if (!addingGenre || !customName.trim()) return

    const genreWithCustomName: LibraryGenre = {
      ...addingGenre,
      id: `custom-${Date.now()}`, // New ID so it's treated as custom
      name: customName.trim(),
      display_name: customName.trim(),
      isCustom: true
    }

    const added = library.addStandardGenre(genreWithCustomName)
    if (added) {
      onGenreAdded?.(genreWithCustomName)
    }

    // Reset form
    setAddingGenre(null)
    setCustomName('')
  }

  const handleCancelAdd = () => {
    setAddingGenre(null)
    setCustomName('')
  }

  const handleCreateCustomPrompt = () => {
    if (!customPromptName.trim() || !customPromptText.trim()) return

    const customGenre: LibraryGenre = {
      id: `custom-${Date.now()}`,
      name: customPromptName.trim(),
      display_name: customPromptName.trim(),
      sunoPrompt: customPromptText.trim(),
      isCustom: true,
      createdAt: new Date().toISOString()
    }

    const added = library.addStandardGenre(customGenre)
    if (added) {
      onGenreAdded?.(customGenre)
    }

    // Reset form
    setShowCustomPrompt(false)
    setCustomPromptName('')
    setCustomPromptText('')
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose()
      // Reset all state when closing
      library.setSearchQuery('')
      setConfirmDeleteId(null)
      setAddingGenre(null)
      setCustomName('')
      setShowCustomPrompt(false)
      setCustomPromptName('')
      setCustomPromptText('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[rgba(90,140,255,0.1)]">
          <DialogTitle className="text-2xl font-bold">Sjanger-bibliotek</DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(130,170,240,0.45)]" />
            <Input
              placeholder="Sok etter sjanger eller stil..."
              value={library.searchQuery}
              onChange={(e) => library.setSearchQuery(e.target.value)}
              className="pl-10 text-white placeholder:text-[rgba(130,170,240,0.25)]"
            />
          </div>
        </div>

        {/* Naming Form - shown when adding a genre */}
        {addingGenre && (
          <div className="px-6 py-4 bg-orange-50 border-y border-orange-200">
            <p className="text-sm font-medium text-[rgba(180,200,240,0.5)] mb-2">
              Gi sjangeren et navn:
            </p>
            <div className="flex gap-2">
              <Input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Sjangernavn..."
                className="flex-1 text-white placeholder:text-[rgba(130,170,240,0.25)]"
                autoFocus
              />
              <Button onClick={handleConfirmAdd} className="bg-primary hover:bg-primary/90">
                Legg til
              </Button>
              <Button variant="outline" onClick={handleCancelAdd}>
                Avbryt
              </Button>
            </div>
            <p className="text-xs text-[rgba(180,200,240,0.5)] mt-2">
              Prompt: {addingGenre.sunoPrompt}
            </p>
          </div>
        )}

        {/* Custom Prompt Creation Form */}
        {showCustomPrompt && (
          <div className="px-6 py-4 bg-purple-50 border-y border-purple-200">
            <p className="text-sm font-medium text-[rgba(180,200,240,0.5)] mb-2">
              Lag din egen sjanger:
            </p>
            <div className="space-y-3">
              <Input
                value={customPromptName}
                onChange={(e) => setCustomPromptName(e.target.value)}
                placeholder="Sjangernavn (f.eks. Min Rock)"
                className="text-white placeholder:text-[rgba(130,170,240,0.25)]"
                autoFocus
              />
              <Textarea
                value={customPromptText}
                onChange={(e) => setCustomPromptText(e.target.value)}
                placeholder="Beskriv stilen for Suno AI (f.eks. rock, electric guitar, energetic, 120 bpm)"
                className="text-white placeholder:text-[rgba(130,170,240,0.25)] min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateCustomPrompt}
                  className="bg-primary hover:bg-primary/90"
                  disabled={!customPromptName.trim() || !customPromptText.trim()}
                >
                  Opprett sjanger
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowCustomPrompt(false)
                  setCustomPromptName('')
                  setCustomPromptText('')
                }}>
                  Avbryt
                </Button>
              </div>
            </div>
          </div>
        )}

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
                <div className="text-center py-12 text-[rgba(180,200,240,0.5)]">
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
                <div className="text-center py-12 text-[rgba(180,200,240,0.5)]">
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
              {/* Custom Prompt Button */}
              {!showCustomPrompt && (
                <button
                  onClick={() => setShowCustomPrompt(true)}
                  className="w-full p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2 text-purple-600"
                >
                  <PenLine className="w-5 h-5" />
                  <span className="font-medium">Egendefinert prompt</span>
                </button>
              )}

              {filteredStandard.length === 0 ? (
                <div className="text-center py-12 text-[rgba(180,200,240,0.5)]">
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
