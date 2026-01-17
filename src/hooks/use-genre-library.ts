'use client'

import { useState, useEffect, useCallback } from 'react'
import { LibraryGenre } from '@/lib/standard-genres'
import {
  getCustomGenres,
  saveCustomGenre,
  deleteCustomGenre,
  type CustomGenreData
} from '@/lib/custom-genres-storage'

const STORAGE_KEY_ARCHIVED = 'musikkfabrikken_archived_genres'

export interface ArchivedGenre extends LibraryGenre {
  archivedAt: string
}

/**
 * Hook for managing the genre library with active, archived, and standard genres.
 * Integrates with existing custom-genres-storage for compatibility.
 */
export function useGenreLibrary() {
  const [activeGenres, setActiveGenres] = useState<LibraryGenre[]>([])
  const [archivedGenres, setArchivedGenres] = useState<ArchivedGenre[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)

  // Load genres from localStorage on mount
  useEffect(() => {
    const loadGenres = () => {
      try {
        // Load active (custom) genres from existing storage
        const customGenres = getCustomGenres()
        const activeFromStorage: LibraryGenre[] = customGenres.map(cg => ({
          id: cg.id,
          name: cg.name,
          display_name: cg.display_name,
          sunoPrompt: cg.sunoPrompt,
          isCustom: true,
          createdAt: cg.createdAt
        }))
        setActiveGenres(activeFromStorage)

        // Load archived genres
        const archivedStr = localStorage.getItem(STORAGE_KEY_ARCHIVED)
        if (archivedStr) {
          const archived = JSON.parse(archivedStr) as ArchivedGenre[]
          setArchivedGenres(archived)
        }

        setIsLoaded(true)
      } catch (error) {
        console.error('Failed to load genres from localStorage:', error)
        setIsLoaded(true)
      }
    }

    loadGenres()
  }, [])

  // Persist archived genres whenever they change
  useEffect(() => {
    if (!isLoaded) return

    try {
      localStorage.setItem(STORAGE_KEY_ARCHIVED, JSON.stringify(archivedGenres))
    } catch (error) {
      console.error('Failed to save archived genres:', error)
    }
  }, [archivedGenres, isLoaded])

  /**
   * Archive a genre - moves it from active to archived
   */
  const archiveGenre = useCallback((genre: LibraryGenre) => {
    const archivedGenre: ArchivedGenre = {
      ...genre,
      archivedAt: new Date().toISOString()
    }

    // Add to archived list
    setArchivedGenres(prev => [...prev, archivedGenre])

    // Remove from active list
    setActiveGenres(prev => prev.filter(g => g.id !== genre.id))

    // If it's a custom genre, also remove from custom-genres-storage
    if (genre.isCustom || genre.id.startsWith('custom-')) {
      try {
        deleteCustomGenre(genre.id)
      } catch (error) {
        console.error('Failed to delete custom genre from storage:', error)
      }
    }
  }, [])

  /**
   * Restore a genre from archived to active
   */
  const restoreGenre = useCallback((genreId: string) => {
    const genre = archivedGenres.find(g => g.id === genreId)
    if (!genre) return null

    // Remove archivedAt and restore to active
    const { archivedAt, ...restoredGenre } = genre

    // Add back to active list
    setActiveGenres(prev => [...prev, restoredGenre])

    // Remove from archived list
    setArchivedGenres(prev => prev.filter(g => g.id !== genreId))

    // If it was a custom genre, re-save to custom-genres-storage
    if (restoredGenre.isCustom || restoredGenre.id.startsWith('custom-')) {
      try {
        const customData: CustomGenreData = {
          id: restoredGenre.id,
          name: restoredGenre.name,
          display_name: restoredGenre.display_name,
          sunoPrompt: restoredGenre.sunoPrompt,
          createdAt: restoredGenre.createdAt || new Date().toISOString()
        }
        saveCustomGenre(customData)
      } catch (error) {
        console.error('Failed to restore custom genre to storage:', error)
      }
    }

    return restoredGenre
  }, [archivedGenres])

  /**
   * Permanently delete an archived genre
   */
  const permanentDelete = useCallback((genreId: string): boolean => {
    const genre = archivedGenres.find(g => g.id === genreId)
    if (!genre) return false

    // Remove from archived list
    setArchivedGenres(prev => prev.filter(g => g.id !== genreId))
    return true
  }, [archivedGenres])

  /**
   * Add a standard genre template to active genres
   */
  const addStandardGenre = useCallback((genre: LibraryGenre) => {
    // Check if already in active genres
    if (activeGenres.some(g => g.id === genre.id)) {
      return false
    }

    // Check if it's in archived - if so, restore it instead
    const archivedVersion = archivedGenres.find(g => g.id === genre.id)
    if (archivedVersion) {
      restoreGenre(genre.id)
      return true
    }

    // Add to active genres with createdAt timestamp
    const newGenre: LibraryGenre = {
      ...genre,
      createdAt: new Date().toISOString()
    }

    setActiveGenres(prev => [...prev, newGenre])

    // For standard genres, also save to custom-genres-storage so they persist
    try {
      const customData: CustomGenreData = {
        id: newGenre.id,
        name: newGenre.name,
        display_name: newGenre.display_name,
        sunoPrompt: newGenre.sunoPrompt,
        createdAt: newGenre.createdAt || new Date().toISOString()
      }
      saveCustomGenre(customData)
    } catch (error) {
      console.error('Failed to save standard genre to storage:', error)
    }

    return true
  }, [activeGenres, archivedGenres, restoreGenre])

  /**
   * Add a custom genre (from AI assistant or other sources)
   */
  const addCustomGenre = useCallback((genre: LibraryGenre) => {
    if (activeGenres.some(g => g.id === genre.id)) {
      return false
    }

    const newGenre: LibraryGenre = {
      ...genre,
      isCustom: true,
      createdAt: new Date().toISOString()
    }

    setActiveGenres(prev => [...prev, newGenre])
    return true
  }, [activeGenres])

  /**
   * Filter genres by search query
   */
  const filterGenres = useCallback((genres: LibraryGenre[], query: string): LibraryGenre[] => {
    if (!query.trim()) return genres

    const lowerQuery = query.toLowerCase()
    return genres.filter(
      genre =>
        genre.name.toLowerCase().includes(lowerQuery) ||
        genre.display_name.toLowerCase().includes(lowerQuery) ||
        genre.sunoPrompt.toLowerCase().includes(lowerQuery)
    )
  }, [])

  /**
   * Check if a genre is already in active list
   */
  const isGenreActive = useCallback((genreId: string): boolean => {
    return activeGenres.some(g => g.id === genreId)
  }, [activeGenres])

  /**
   * Reload active genres from storage (for syncing with external changes)
   */
  const reloadActiveGenres = useCallback(() => {
    const customGenres = getCustomGenres()
    const activeFromStorage: LibraryGenre[] = customGenres.map(cg => ({
      id: cg.id,
      name: cg.name,
      display_name: cg.display_name,
      sunoPrompt: cg.sunoPrompt,
      isCustom: true,
      createdAt: cg.createdAt
    }))
    setActiveGenres(activeFromStorage)
  }, [])

  return {
    activeGenres,
    archivedGenres,
    searchQuery,
    setSearchQuery,
    archiveGenre,
    restoreGenre,
    permanentDelete,
    addStandardGenre,
    addCustomGenre,
    filterGenres,
    isGenreActive,
    reloadActiveGenres,
    isLoaded,
    activeCount: activeGenres.length,
    archivedCount: archivedGenres.length
  }
}
