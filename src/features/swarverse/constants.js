export const FILTERS = ['all', 'chords', 'tabs', 'both']
export const DIFFICULTIES = ['all', 'beginner', 'intermediate', 'advanced']
export const THEME_KEY = 'swarverse-theme'
export const PAGE_SIZE = 9
export const RECENT_LIMIT = 6
export const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').trim().toLowerCase()

export const SHELF_META = {
  recent: {
    eyebrow: 'Default view',
    title: 'Recently added',
    note: 'Your latest additions show up here first.',
  },
  favorites: {
    eyebrow: 'Your picks',
    title: 'Favorites',
    note: 'Keep the songs you reach for most in one spot.',
  },
  library: {
    eyebrow: 'Full library',
    title: 'Library',
    note: 'The complete list, without everything landing on the homepage at once.',
  },
}


