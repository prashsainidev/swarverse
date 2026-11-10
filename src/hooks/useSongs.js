'use client'

import { useEffect, useState } from 'react'
import { DEFAULT_SONGS } from '../lib/songs/defaultSongs'
import { normalizeSong } from '../lib/songs/song-utils'

const FAVORITES_KEY = 'swarverse_favorite_ids'

function getInitialSongs() {
  return DEFAULT_SONGS.map(normalizeSong)
}

function readFavoriteIds() {
  if (typeof window === 'undefined') return new Set()
  try {
    const stored = window.localStorage.getItem(FAVORITES_KEY)
    if (stored) {
      return new Set(JSON.parse(stored))
    }
  } catch {
    // Ignore parse errors
  }
  return new Set()
}

function saveFavoriteIds(idsSet) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...idsSet]))
  } catch {
    // Ignore storage errors
  }
}

export function useSongs() {
  const [songs, setSongs] = useState(() => getInitialSongs())

  useEffect(() => {
    // Sync with saved favorites on client mount
    const favSet = readFavoriteIds()
    if (favSet.size > 0) {
      setSongs((current) =>
        current.map((song) => ({
          ...song,
          favorite: favSet.has(song.id),
        }))
      )
    }
  }, [])

  const toggleFavorite = (id) => {
    setSongs((current) => {
      const next = current.map((song) => {
        if (song.id === id) {
          return { ...song, favorite: !song.favorite }
        }
        return song
      })

      const newFavSet = new Set(next.filter((s) => s.favorite).map((s) => s.id))
      saveFavoriteIds(newFavSet)

      return next
    })
    return true
  }

  return {
    songs,
    loaded: true,
    error: '',
    saving: false,
    toggleFavorite,
  }
}
