'use client'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

interface DeleteSongDialogProps {
  songTitle: string | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting?: boolean
}

export function DeleteSongDialog({
  songTitle,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteSongDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="bg-[rgba(15,25,50,0.98)] border border-[rgba(90,140,255,0.12)]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Slett sang?</AlertDialogTitle>
          <AlertDialogDescription className="text-[rgba(180,200,240,0.5)]">
            Er du sikker på at du vil slette{songTitle ? ` «${songTitle}»` : ' denne sangen'}? Dette kan ikke angres.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isDeleting}
            className="border-[rgba(90,140,255,0.2)] text-[rgba(180,200,240,0.7)] hover:bg-[rgba(40,80,160,0.15)]"
          >
            Avbryt
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? 'Sletter...' : 'Slett'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
