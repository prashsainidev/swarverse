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
