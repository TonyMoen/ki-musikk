/**
 * Download Utilities for Musikkfabrikken
 *
 * Client-side utilities for downloading songs from the API.
 * Handles filename sanitization, download triggering, and error handling.
 */

/**
 * Sanitize song title for use as filename
 * Handles Norwegian characters and special characters
 */
export function sanitizeFilename(title: string): string {
  return title
    .toLowerCase()
    .replace(/[æ]/g, 'ae')
    .replace(/[ø]/g, 'o')
    .replace(/[å]/g, 'a')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50) || 'sang'
}

/**
 * Download a song by ID
 *
 * Fetches a signed download URL from the API and triggers browser download.
 *
 * @param songId - The ID of the song to download
 * @param songTitle - The title of the song (used for fallback filename)
 * @returns Promise<boolean> - true if download initiated successfully
 */
export async function downloadSong(songId: string, songTitle: string): Promise<boolean> {
  try {
    // Fetch download URL from API
    const response = await fetch(`/api/songs/${songId}/download`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error('Download API error:', errorData?.error || response.statusText)
      return false
    }

    const result = await response.json()
    const { downloadUrl, filename } = result.data || {}

    if (!downloadUrl) {
      console.error('No download URL returned from API')
      return false
    }

    // For Supabase signed URLs with download parameter, we can use direct navigation
    // For external URLs (like Suno), we need to fetch and create a blob
    if (downloadUrl.includes('supabase') && downloadUrl.includes('download=')) {
      // Direct download via anchor tag - Supabase handles the download header
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || `${sanitizeFilename(songTitle)}-musikkfabrikken.mp3`
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      // For external URLs, fetch as blob and trigger download
      const audioResponse = await fetch(downloadUrl)
      if (!audioResponse.ok) {
        throw new Error('Failed to fetch audio file')
      }

      const blob = await audioResponse.blob()
      const blobUrl = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename || `${sanitizeFilename(songTitle)}-musikkfabrikken.mp3`
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up blob URL after a short delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
    }

    return true
  } catch (error) {
    console.error('Download error:', error)
    return false
  }
}
