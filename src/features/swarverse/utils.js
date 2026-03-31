import { THEME_KEY } from './constants'

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

