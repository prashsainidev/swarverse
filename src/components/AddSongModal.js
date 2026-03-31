'use client'
import { useEffect, useState } from 'react'
import styles from './AddSongModal.module.css'

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced']
const TYPES = ['chords', 'tabs', 'both']

const EMPTY_FORM = {
  title: '',
  artist: '',
  link: '',
  type: 'chords',
  difficulty: 'beginner',
  tags: '',
}

export default function AddSongModal({ onClose, onSave, editSong = null, saving = false }) {
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (editSong) {
      setForm({
        title: editSong.title,
        artist: editSong.artist,
        link: editSong.link,
        type: editSong.type,
        difficulty: editSong.difficulty,
        tags: editSong.tags?.join(', ') || '',
      })
      return
    }

    setForm(EMPTY_FORM)
  }, [editSong])

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.link.trim() || saving) return

    const tags = form.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
    const didSave = await onSave({ ...form, tags })

    if (didSave !== false) {
      onClose()
    }
  }

  const setField = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  return (
    <div className={styles.overlay} onClick={(event) => event.target === event.currentTarget && !saving && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.title}>{editSong ? 'Edit Song' : 'Add Song'}</span>
          <button className={styles.closeButton} onClick={onClose} disabled={saving}>
            Close
          </button>
        </div>

        <div className={styles.field}>
          <label>Song Title *</label>
          <input placeholder="e.g. Stairway to Heaven" value={form.title} onChange={setField('title')} disabled={saving} />
        </div>

        <div className={styles.field}>
          <label>Artist</label>
          <input placeholder="e.g. Led Zeppelin" value={form.artist} onChange={setField('artist')} disabled={saving} />
        </div>

        <div className={styles.field}>
          <label>Link (tab or chord URL) *</label>
          <input placeholder="https://..." value={form.link} onChange={setField('link')} disabled={saving} />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Type</label>
            <select value={form.type} onChange={setField('type')} disabled={saving}>
              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label>Difficulty</label>
            <select value={form.difficulty} onChange={setField('difficulty')} disabled={saving}>
              {DIFFICULTIES.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label>Tags (comma separated)</label>
          <input placeholder="e.g. rock, acoustic, fingerpicking" value={form.tags} onChange={setField('tags')} disabled={saving} />
        </div>

        <div className={styles.actions}>
          <button className={styles.secondaryButton} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className={styles.primaryButton} onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : editSong ? 'Save Changes' : 'Add to Vault'}
          </button>
        </div>
      </div>
    </div>
  )
}

