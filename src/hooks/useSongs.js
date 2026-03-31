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

const TRASH_RETENTION_MS = 30 * 24 * 60 * 60 * 1000

function getDefaultSongs() {
  return DEFAULT_SONGS.map(normalizeSong)
}

function getCacheKeys() {
  return [CACHE_KEY, STORAGE_KEY, ...LEGACY_STORAGE_KEYS]
}

function getPublicSongs(items) {
  return items.map(normalizeSong).filter((song) => !song.deletedAt)
}

function readCachedSongs() {
  if (typeof window === 'undefined') {
    return getDefaultSongs()
  }

  for (const key of getCacheKeys()) {
    try {
      const stored = window.localStorage.getItem(key)
      if (stored) {
        return getPublicSongs(JSON.parse(stored))
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
    const normalized = JSON.stringify(getPublicSongs(items))
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

async function purgeExpiredTrash(supabase, user, isAdmin) {
  if (!supabase || !user || !isAdmin) return

  const cutoff = new Date(Date.now() - TRASH_RETENTION_MS).toISOString()
  await supabase.from('songs').delete().eq('user_id', user.id).lte('deleted_at', cutoff)
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

      if (isAdmin && user) {
        await purgeExpiredTrash(supabase, user, isAdmin)
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
      deletedAt: null,
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

    const { data, error: deleteError } = await supabase
      .from('songs')
      .update({
        deleted_at: new Date().toISOString(),
        favorite: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single()

    setSaving(false)

    if (deleteError) {
      setError(deleteError.message)
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

  const restoreSong = async (id) => {
    if (!supabase || !user || !isAdmin) return false

    setSaving(true)
    setError('')

    const { data, error: restoreError } = await supabase
      .from('songs')
      .update({
        deleted_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single()

    setSaving(false)

    if (restoreError) {
      setError(restoreError.message)
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

  const permanentlyDeleteSong = async (id) => {
    if (!supabase || !user || !isAdmin) return false

    setSaving(true)
    setError('')

    const { error: deleteError } = await supabase.from('songs').delete().eq('id', id).eq('user_id', user.id)

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
    if (!existingSong || existingSong.deletedAt) return null

    setSaving(true)
    setError('')

    const mergedSong = normalizeSong({
      ...existingSong,
      ...updated,
      id,
      favorite: existingSong.favorite,
      addedAt: existingSong.addedAt,
      deletedAt: existingSong.deletedAt,
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
      .eq('user_id', user.id)
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
    if (!existingSong || existingSong.deletedAt) return false

    setSaving(true)
    setError('')

    const { data, error: favoriteError } = await supabase
      .from('songs')
      .update({
        favorite: !existingSong.favorite,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
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

  return {
    songs,
    loaded,
    error,
    saving,
    addSong,
    deleteSong,
    permanentlyDeleteSong,
    restoreSong,
    updateSong,
    toggleFavorite,
  }
}
