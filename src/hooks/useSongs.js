'use client'

import { useEffect, useState } from 'react'
import { DEFAULT_SONGS } from '../lib/songs/defaultSongs'
import {
  CACHE_KEY,
  LEGACY_STORAGE_KEYS,
  STORAGE_KEY,
  createSongId,
  mapDbSong,
  normalizeSong,
  toDbSong,
} from '../lib/songs/song-utils'

function getDefaultSongs() {
  return DEFAULT_SONGS.map(normalizeSong)
}

function getCacheKeys() {
  return [CACHE_KEY, STORAGE_KEY, ...LEGACY_STORAGE_KEYS]
}

function readCachedSongs() {
  if (typeof window === 'undefined') {
    return getDefaultSongs()
  }

  for (const key of getCacheKeys()) {
    try {
      const stored = window.localStorage.getItem(key)
      if (stored) {
        return JSON.parse(stored).map(normalizeSong)
      }
    } catch {
      // Ignore malformed cache and keep looking.
    }
  }

  return getDefaultSongs()
}

function writeCachedSongs(items) {
  if (typeof window === 'undefined') return

  try {
    const normalized = JSON.stringify(items.map(normalizeSong))
    window.localStorage.setItem(CACHE_KEY, normalized)
    window.localStorage.setItem(STORAGE_KEY, normalized)
    LEGACY_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key))
  } catch {
    // Ignore cache write failures.
  }
}

function clearLocalSeed() {
  if (typeof window === 'undefined') return

  try {
    getCacheKeys().forEach((key) => window.localStorage.removeItem(key))
  } catch {
    // Ignore local cleanup errors after the initial migration attempt.
  }
}

export function useSongs({ supabase, user, isAdmin }) {
  const [songs, setSongs] = useState(() => getDefaultSongs())
  const [loaded, setLoaded] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true

    const loadSongs = async () => {
      const cachedSongs = readCachedSongs()

      if (active) {
        setSongs(cachedSongs)
        writeCachedSongs(cachedSongs)
        setError('')
        setLoaded(true)
      }

      if (!supabase) {
        return
      }

      const { data, error: fetchError } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        if (active) {
          setError(fetchError.message)
          setLoaded(true)
        }
        return
      }

      let rows = data || []

      if (rows.length === 0 && isAdmin && user) {
        const payload = cachedSongs.map((item) => toDbSong(item, user.id))
        const { data: seededRows, error: seedError } = await supabase.from('songs').insert(payload).select('*')

        if (seedError) {
          if (active) {
            setError(seedError.message)
            setLoaded(true)
          }
          return
        }

        rows = seededRows || []
        clearLocalSeed()
      } else if (rows.length > 0 && isAdmin) {
        clearLocalSeed()
      }

      const nextSongs = rows.length > 0 ? rows.map(mapDbSong) : []

      if (active) {
        setSongs(nextSongs)
        writeCachedSongs(nextSongs)
        setError('')
        setLoaded(true)
      }
    }

    loadSongs()

    return () => {
      active = false
    }
  }, [supabase, user, isAdmin])

  const addSong = async (item) => {
    if (!supabase || !user || !isAdmin) return null

    setSaving(true)
    setError('')

    const nextSong = normalizeSong({
      ...item,
      id: createSongId(),
      favorite: false,
      addedAt: new Date().toISOString(),
    })

    const { data, error: insertError } = await supabase
      .from('songs')
      .insert(toDbSong(nextSong, user.id))
      .select('*')
      .single()

    setSaving(false)

    if (insertError) {
      setError(insertError.message)
      return null
    }

    const mappedSong = mapDbSong(data)
    setSongs((currentSongs) => {
      const nextSongs = [mappedSong, ...currentSongs]
      writeCachedSongs(nextSongs)
      return nextSongs
    })
    return mappedSong
  }

  const deleteSong = async (id) => {
    if (!supabase || !user || !isAdmin) return false

    setSaving(true)
    setError('')

    const { error: deleteError } = await supabase.from('songs').delete().eq('id', id)

    setSaving(false)

    if (deleteError) {
      setError(deleteError.message)
      return false
    }

    setSongs((currentSongs) => {
      const nextSongs = currentSongs.filter((song) => song.id !== id)
      writeCachedSongs(nextSongs)
      return nextSongs
    })
    return true
  }

  const updateSong = async (id, updated) => {
    if (!supabase || !user || !isAdmin) return null

    const existingSong = songs.find((song) => song.id === id)
    if (!existingSong) return null

    setSaving(true)
    setError('')

    const mergedSong = normalizeSong({
      ...existingSong,
      ...updated,
      id,
      favorite: existingSong.favorite,
      addedAt: existingSong.addedAt,
    })

    const payload = {
      title: mergedSong.title,
      artist: mergedSong.artist || '',
      link: mergedSong.link,
      type: mergedSong.type,
      difficulty: mergedSong.difficulty,
      tags: mergedSong.tags,
      updated_at: new Date().toISOString(),
    }

    const { data, error: updateError } = await supabase
      .from('songs')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single()

    setSaving(false)

    if (updateError) {
      setError(updateError.message)
      return null
    }

    const mappedSong = mapDbSong(data)
    setSongs((currentSongs) => {
      const nextSongs = currentSongs.map((song) => (song.id === id ? mappedSong : song))
      writeCachedSongs(nextSongs)
      return nextSongs
    })
    return mappedSong
  }

  const toggleFavorite = async (id) => {
    if (!supabase || !user || !isAdmin) return false

    const existingSong = songs.find((song) => song.id === id)
    if (!existingSong) return false

    setSaving(true)
    setError('')

    const { data, error: favoriteError } = await supabase
      .from('songs')
      .update({
        favorite: !existingSong.favorite,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    setSaving(false)

    if (favoriteError) {
      setError(favoriteError.message)
      return false
    }

    const mappedSong = mapDbSong(data)
    setSongs((currentSongs) => {
      const nextSongs = currentSongs.map((song) => (song.id === id ? mappedSong : song))
      writeCachedSongs(nextSongs)
      return nextSongs
    })
    return true
  }

  return { songs, loaded, error, saving, addSong, deleteSong, updateSong, toggleFavorite }
}
