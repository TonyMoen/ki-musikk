# Story 4.4: Implement Song Deletion with Confirmation

Status: ready-for-dev

## Story

As a **user**,
I want to delete songs I no longer need,
so that my library stays organized.

## Acceptance Criteria

1. **Given** I am viewing a song in the player modal
   **When** I tap "Slett" (Delete) button with trash icon
   **Then** A confirmation dialog appears: "Slett '{song-title}'? Dette kan ikke angres."

2. **And** Dialog displays two options: "Avbryt" (secondary button) and "Slett" (destructive red button)

3. **When** I click "Avbryt" (Cancel)
   **Then** Dialog closes and no deletion occurs

4. **When** I confirm deletion by clicking "Slett"
   **Then** Song record is permanently deleted from database

5. **And** Audio file is removed from Supabase Storage bucket

6. **And** Song disappears from my library immediately (optimistic UI update)

7. **And** I see success toast: "Sangen ble slettet" (Song was deleted)

8. **And** If deletion fails, I see error toast: "Kunne ikke slette sangen. Prøv igjen." (Could not delete song. Try again.)

9. **And** Modal closes after successful deletion

## Tasks / Subtasks

- [ ] Task 1: Create Delete API Endpoint (AC: #4, #5, #8)
  - [ ] Create `/src/app/api/songs/[id]/route.ts` DELETE handler (or add to existing)
  - [ ] Verify user owns the song via RLS/auth check
  - [ ] Delete song record from `song` table (permanent hard delete)
  - [ ] Delete audio file from Supabase Storage bucket `songs`
  - [ ] Use database transaction to ensure atomic deletion (record + file)
  - [ ] Handle errors: song not found (404), unauthorized (401), storage error (500)
  - [ ] Return success response with deleted song ID

- [ ] Task 2: Create Confirmation Dialog Component (AC: #1, #2, #3)
  - [ ] Create reusable deletion confirmation dialog (or use shadcn AlertDialog)
  - [ ] Norwegian text: "Slett '{song-title}'? Dette kan ikke angres."
  - [ ] "Avbryt" button (secondary/outline variant) closes dialog
  - [ ] "Slett" button (destructive variant - red) triggers deletion
  - [ ] Trap focus in dialog for accessibility
  - [ ] ESC key closes dialog without action

- [ ] Task 3: Integrate Delete Button in Song Player (AC: #1)
  - [ ] Add delete button to song player modal action buttons row
  - [ ] Use Lucide `Trash2` icon with "Slett" label
  - [ ] Style as destructive variant (red/danger styling)
  - [ ] Position alongside Download, Share buttons
  - [ ] Clicking opens confirmation dialog

- [ ] Task 4: Implement Delete Flow with UI Updates (AC: #4, #6, #7, #8, #9)
  - [ ] Call DELETE API when user confirms
  - [ ] Show loading state on confirm button during deletion
  - [ ] On success: Show toast "Sangen ble slettet"
  - [ ] On success: Close confirmation dialog
  - [ ] On success: Close song player modal
  - [ ] On success: Remove song from library list (optimistic update or refetch)
  - [ ] On error: Show toast "Kunne ikke slette sangen. Prøv igjen."
  - [ ] On error: Keep dialog open, allow retry

- [ ] Task 5: Testing and Validation
  - [ ] Test delete button opens confirmation dialog
  - [ ] Test cancel button closes dialog without deleting
  - [ ] Test confirm deletes song from database
  - [ ] Test audio file removed from Supabase Storage
  - [ ] Test song disappears from library list
  - [ ] Test success toast appears in Norwegian
  - [ ] Test error handling: network failure, storage error
  - [ ] Test RLS: users cannot delete other users' songs
  - [ ] Test keyboard accessibility: ESC closes, Enter on Slett confirms
  - [ ] Build and lint pass with no errors

## Dev Notes

### Requirements Context

**From Epic 4 (Song Library & Management):**
- Story 4.4 enables users to delete unwanted songs to keep library organized
- 14-day auto-deletion also occurs (background job) - manual delete is immediate
- Deletion is PERMANENT - no soft delete, no undo, no recovery
- Confirmation dialog prevents accidental deletions
- FR24 (delete songs from track list) covered by this story

**From PRD (Functional Requirements):**
- FR24: Users can delete songs from their track list
- FR27: System auto-deletes after 14 days (separate from manual delete)
- Deletion should be immediate and provide clear feedback

**From Architecture:**
- Hard DELETE from database (no soft delete pattern)
- Remove audio file from Supabase Storage `songs` bucket
- Use database transaction for atomic operation (record + file)
- RLS ensures users can only delete their own songs

### Learnings from Previous Story

**From Story 4-3-implement-song-download-functionality (Status: review)**

- **Supabase Storage Pattern:**
  - Songs stored in `songs` bucket in Supabase Storage
  - Audio URL stored in `song.audio_url` column
  - Need to extract storage path from audio_url for deletion
  - Use `supabase.storage.from('songs').remove([path])` to delete file

- **API Route Pattern:**
  - File location: `/src/app/api/songs/[id]/route.ts`
  - Use `createServerComponentClient` for auth-protected operations
  - Return JSON with appropriate status codes (200, 401, 404, 500)

- **Norwegian UI Patterns:**
  - Button text: "Slett" (Delete)
  - Confirmation: "Slett '{song-title}'? Dette kan ikke angres."
  - Success toast: "Sangen ble slettet"
  - Error toast: "Kunne ikke slette sangen. Prøv igjen."

- **Component Integration:**
  - Song player modal has action buttons row (Download already added)
  - Toast system implemented via useToast hook
  - Lucide icons used throughout (Trash2 for delete)

- **Files Created/Modified in 4.3:**
  - `src/app/api/songs/[id]/download/route.ts` - Download endpoint
  - `src/lib/utils/download.ts` - Download utilities
  - `src/components/song-player-card.tsx` - Download button added

[Source: docs/sprint-artifacts/4-3-implement-song-download-functionality.md#Dev-Agent-Record]

### Project Structure Notes

**Files to Create:**
- None new - extend existing API route and component

**Files to Modify:**
- `/src/app/api/songs/[id]/route.ts` - Add DELETE handler (create if doesn't exist)
- `/src/components/song-player-card.tsx` - Add delete button and confirmation dialog
- `/src/app/songs/songs-page-client.tsx` - Handle song removal from list after deletion

**Files to Reference:**
- `/src/lib/supabase/server.ts` - Server-side Supabase client
- `/src/components/ui/alert-dialog.tsx` - shadcn AlertDialog (if installed)
- `/src/components/ui/button.tsx` - Button component with destructive variant
- `/src/hooks/use-toast.ts` - Toast notification hook

### Technical Implementation Notes

**Delete API Endpoint:**

```typescript
// /src/app/api/songs/[id]/route.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerComponentClient({ cookies })

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch song to get audio_url for storage deletion
  const { data: song, error: fetchError } = await supabase
    .from('song')
    .select('id, title, audio_url, user_id')
    .eq('id', params.id)
    .single()

  if (fetchError || !song) {
    return NextResponse.json({ error: 'Song not found' }, { status: 404 })
  }

  // RLS should handle this, but double-check ownership
  if (song.user_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Extract storage path from audio_url
  const storagePath = extractStoragePath(song.audio_url)

  // Delete from Supabase Storage
  if (storagePath) {
    const { error: storageError } = await supabase
      .storage
      .from('songs')
      .remove([storagePath])

    if (storageError) {
      console.error('Storage deletion error:', storageError)
      // Continue with database deletion even if storage fails
    }
  }

  // Delete from database (permanent hard delete)
  const { error: deleteError } = await supabase
    .from('song')
    .delete()
    .eq('id', params.id)

  if (deleteError) {
    return NextResponse.json({ error: 'Failed to delete song' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    deletedId: params.id,
    message: 'Song deleted successfully'
  })
}

function extractStoragePath(audioUrl: string | null): string | null {
  if (!audioUrl) return null
  // Extract path from Supabase Storage URL
  // Format: https://{project}.supabase.co/storage/v1/object/public/songs/{path}
  const match = audioUrl.match(/\/songs\/(.+)$/)
  return match ? match[1] : null
}
```

**Confirmation Dialog Component:**

```typescript
// In song-player-card.tsx or separate component
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const [isDeleting, setIsDeleting] = useState(false)
const [showDeleteDialog, setShowDeleteDialog] = useState(false)

const handleDelete = async () => {
  setIsDeleting(true)
  try {
    const response = await fetch(`/api/songs/${song.id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error('Delete failed')
    }

    toast({ title: 'Sangen ble slettet' })
    setShowDeleteDialog(false)
    onClose?.() // Close player modal
    onDelete?.(song.id) // Callback to remove from list
  } catch (error) {
    toast({
      title: 'Kunne ikke slette sangen. Prøv igjen.',
      variant: 'destructive'
    })
  } finally {
    setIsDeleting(false)
  }
}

<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
  <AlertDialogTrigger asChild>
    <Button variant="destructive" size="sm">
      <Trash2 className="h-4 w-4 mr-2" />
      Slett
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Slett sang</AlertDialogTitle>
      <AlertDialogDescription>
        Slett '{song.title}'? Dette kan ikke angres.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Avbryt</AlertDialogCancel>
      <AlertDialogAction
        onClick={handleDelete}
        disabled={isDeleting}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : null}
        Slett
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Library List Update (Optimistic or Refetch):**

```typescript
// In songs-page-client.tsx
const handleSongDelete = (deletedId: string) => {
  // Option A: Optimistic update
  setSongs(songs => songs.filter(s => s.id !== deletedId))

  // Option B: Refetch from server
  // router.refresh()
}
```

### Testing Strategy

**Manual Testing Checklist:**
- [ ] Delete button visible in song player action buttons
- [ ] Click delete → confirmation dialog appears
- [ ] Dialog shows correct song title
- [ ] Click "Avbryt" → dialog closes, no deletion
- [ ] Click "Slett" → loading spinner appears
- [ ] Song deleted from database
- [ ] Audio file deleted from Storage
- [ ] Success toast "Sangen ble slettet" appears
- [ ] Player modal closes
- [ ] Song removed from library list
- [ ] Try deleting another user's song → 401 error
- [ ] Try deleting non-existent song → 404 error
- [ ] Keyboard: ESC closes dialog, focus trapped

**Edge Cases:**
- Song with no audio_url (failed generation) → should still delete record
- Storage deletion fails → database deletion should still proceed
- Network failure during delete → error toast, allow retry
- Delete while audio is playing → stop playback first

### References

- [Epic 4 - Story 4.4](../epics/epic-4-song-library-management.md#story-44-implement-song-deletion-with-confirmation)
- [Story 4.3 - Download Functionality](4-3-implement-song-download-functionality.md)
- [Architecture - Database Patterns](../architecture.md#database-patterns)
- [Architecture - API Response Format](../architecture.md#api-response-format)
- [shadcn/ui AlertDialog](https://ui.shadcn.com/docs/components/alert-dialog)

## Change Log

**2025-11-26 - Story Created (drafted status)**
- Story drafted by create-story workflow (SM agent)
- Extracted from Epic 4: Song Library & Management
- Source: docs/epics/epic-4-song-library-management.md#story-44
- Prerequisites satisfied: Story 4.1 (done) provides song library, Story 4.3 (review) provides action buttons pattern
- Includes technical implementation notes for delete API, confirmation dialog, optimistic updates
- Norwegian UI text: "Slett", "Avbryt", "Sangen ble slettet", "Kunne ikke slette sangen. Prøv igjen."
- Next step: Run story-context workflow to generate technical context XML, then mark ready for development

## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/stories/4-4-implement-song-deletion-with-confirmation.context.xml`

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
