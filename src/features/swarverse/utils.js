import { THEME_KEY, TRASH_RETENTION_DAYS } from './constants'

const DAY_MS = 24 * 60 * 60 * 1000
const TRASH_RETENTION_MS = TRASH_RETENTION_DAYS * DAY_MS

export function getPreferredTheme() {
  if (typeof window === 'undefined') return 'dark'

  const savedTheme = window.localStorage.getItem(THEME_KEY)
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function sortByRecent(items) {
  return [...items].sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
}

export function sortByLibrary(items) {
  return [...items].sort((a, b) => {
    const artistCompare = (a.artist || '').localeCompare(b.artist || '')
    if (artistCompare !== 0) return artistCompare
    return a.title.localeCompare(b.title)
  })
}

export function sortByDeleted(items) {
  return [...items].sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt))
}

export function isSongDeleted(song) {
  return Boolean(song.deletedAt)
}

export function isTrashVisible(song, now = Date.now()) {
  if (!song.deletedAt) return false
  return new Date(song.deletedAt).getTime() + TRASH_RETENTION_MS > now
}

export function getTrashDaysLeft(song, now = Date.now()) {
  if (!song.deletedAt) return 0
  const remainingMs = new Date(song.deletedAt).getTime() + TRASH_RETENTION_MS - now
  if (remainingMs <= 0) return 0
  return Math.max(1, Math.ceil(remainingMs / DAY_MS))
}
