export const STORAGE_KEY = 'swarverse_songs'
export const CACHE_KEY = 'swarverse_public_cache'
export const LEGACY_STORAGE_KEYS = ['guitar_vault_songs', 'guitar_vault_public_cache']

export function normalizeSong(item = {}) {
  return {
    ...item,
    artist: item.artist || '',
    type: item.type || 'chords',
    difficulty: item.difficulty || 'beginner',
    tags: Array.isArray(item.tags) ? item.tags : [],
    favorite: Boolean(item.favorite),
    addedAt: item.addedAt || new Date().toISOString(),
  }
}

export function createSongId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function mapDbSong(row) {
  return normalizeSong({
    id: row.id,
    title: row.title,
    artist: row.artist || '',
    link: row.link,
    type: row.type,
    difficulty: row.difficulty,
    tags: Array.isArray(row.tags) ? row.tags : [],
    favorite: row.favorite,
    addedAt: row.created_at,
  })
}

export function toDbSong(item, userId) {
  const normalized = normalizeSong(item)

  return {
    id: normalized.id,
    user_id: userId,
    title: normalized.title,
    artist: normalized.artist,
    link: normalized.link,
    type: normalized.type,
    difficulty: normalized.difficulty,
    tags: normalized.tags,
    favorite: normalized.favorite,
    created_at: normalized.addedAt,
    updated_at: new Date().toISOString(),
  }
}
