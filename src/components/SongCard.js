'use client'
import styles from './SongCard.module.css'

const DIFFICULTY_COLOR = {
  beginner: '#34d399',
  intermediate: '#a855f7',
  advanced: '#fb7185',
}

const TYPE_LABEL = {
  chords: 'Chords',
  tabs: 'Tabs',
  both: 'Chords + Tabs',
}

function FavoriteIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={active ? styles.favoriteIconActive : styles.favoriteIcon}>
      <path
        d="M12 3.7l2.55 5.16l5.7.83l-4.12 4.02l.97 5.67L12 16.68l-5.1 2.68l.97-5.67L3.75 9.7l5.7-.83L12 3.7Z"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function SongCard({
  song,
  onEdit,
  onDelete,
  onToggleFavorite,
  onRestore,
  onPermanentDelete,
  canManage = false,
  isTrash = false,
  trashDaysLeft = 0,
}) {
  const trashNote = isTrash
    ? `In trash. You can restore this for ${trashDaysLeft} more ${trashDaysLeft === 1 ? 'day' : 'days'}.`
    : ''

  return (
    <article className={`${styles.card} ${isTrash ? styles.cardTrash : ''}`}>
      <div className={styles.top}>
        <div className={styles.meta}>
          <span className={styles.type}>{TYPE_LABEL[song.type] || song.type}</span>
          <span className={styles.difficulty} style={{ color: DIFFICULTY_COLOR[song.difficulty] }}>
            {song.difficulty}
          </span>
        </div>

        {canManage && !isTrash && (
          <div className={styles.actions}>
            <button
              className={`${styles.iconButton} ${song.favorite ? styles.favoriteActive : ''}`}
              onClick={() => onToggleFavorite(song.id)}
              title={song.favorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-label={song.favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <FavoriteIcon active={song.favorite} />
            </button>
            <button className={styles.textButton} onClick={() => onEdit(song)} title="Edit song">
              Edit
            </button>
            <button className={`${styles.textButton} ${styles.deleteButton}`} onClick={() => onDelete(song.id)} title="Move song to trash">
              Delete
            </button>
          </div>
        )}

        {canManage && isTrash && (
          <div className={styles.actions}>
            <button className={`${styles.textButton} ${styles.restoreButton}`} onClick={() => onRestore(song.id)} title="Restore song">
              Restore
            </button>
            <button
              className={`${styles.textButton} ${styles.deleteButton}`}
              onClick={() => onPermanentDelete(song.id)}
              title="Delete forever"
            >
              Delete forever
            </button>
          </div>
        )}
      </div>

      <a href={song.link} target="_blank" rel="noopener noreferrer" className={styles.titleLink}>
        <h3 className={styles.songTitle}>{song.title}</h3>
      </a>

      {song.artist && <p className={styles.artist}>{song.artist}</p>}
      {isTrash && <p className={styles.trashNote}>{trashNote}</p>}

      {song.tags?.length > 0 && (
        <div className={styles.tags}>
          {song.tags.map((tag) => (
            <span key={`${song.id}-${tag}`} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <a href={song.link} target="_blank" rel="noopener noreferrer" className={styles.openLink}>
        Open Link
      </a>
    </article>
  )
}
