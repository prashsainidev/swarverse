'use client'
import { ExternalLinkIcon, MusicNoteIcon } from '../features/swarverse/components/icons'
import styles from './SongCard.module.css'

const DIFFICULTY_MAP = {
  beginner: { label: 'Beginner', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.25)' },
  intermediate: { label: 'Intermediate', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.25)' },
  advanced: { label: 'Advanced', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.12)', border: 'rgba(244, 63, 94, 0.25)' },
}

const TYPE_LABEL = {
  chords: 'Chords',
  tabs: 'Tabs',
  both: 'Chords + Tabs',
}

function FavoriteStar({ active }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      className={active ? styles.favoriteIconActive : styles.favoriteIcon}
      aria-hidden="true"
    >
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87l1.18 6.88L12 17.77l-6.18 3.25L7 14.14L2 9.27l6.91-1.01L12 2z"
        fill={active ? '#fbbf24' : 'none'}
        stroke={active ? '#fbbf24' : 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function SongCard({ song, onToggleFavorite }) {
  const links = song.link ? song.link.split(',').map((l) => l.trim()).filter(Boolean) : []
  const firstLink = links[0] || '#'

  function getDomainMeta(url) {
    try {
      const hostname = new URL(url).hostname.toLowerCase()
      if (hostname.includes('ultimate-guitar')) return { name: 'Ultimate Guitar', styleClass: styles.linkUG }
      if (hostname.includes('wrytin')) return { name: 'Wrytin', styleClass: styles.linkWrytin }
      if (hostname.includes('indichords')) return { name: 'Indichords', styleClass: styles.linkIndichords }
      if (hostname.includes('guitartuna')) return { name: 'GuitarTuna', styleClass: styles.linkGuitarTuna }
      if (hostname.includes('chordify')) return { name: 'Chordify', styleClass: styles.linkChordify }
      return { name: hostname.replace('www.', ''), styleClass: styles.linkDefault }
    } catch {
      return { name: 'Chords Link', styleClass: styles.linkDefault }
    }
  }

  const diffConfig = DIFFICULTY_MAP[song.difficulty] || DIFFICULTY_MAP.beginner

  return (
    <article className={styles.card}>
      <div className={styles.glowAura} aria-hidden="true" />

      {/* Top Header Row */}
      <div className={styles.top}>
        <div className={styles.badges}>
          <span
            className={styles.difficultyBadge}
            style={{
              color: diffConfig.color,
              background: diffConfig.bg,
              borderColor: diffConfig.border,
            }}
          >
            <span className={styles.diffDot} style={{ background: diffConfig.color }} />
            {diffConfig.label}
          </span>

          <span className={styles.typeBadge}>
            {TYPE_LABEL[song.type] || song.type}
          </span>
        </div>

        {/* Favorite Action Button */}
        <button
          className={`${styles.favoriteBtn} ${song.favorite ? styles.favoriteActive : ''}`}
          onClick={() => onToggleFavorite(song.id)}
          title={song.favorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-label={song.favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <FavoriteStar active={song.favorite} />
        </button>
      </div>

      {/* Title & Artist */}
      <div className={styles.body}>
        <a href={firstLink} target="_blank" rel="noopener noreferrer" className={styles.titleLink}>
          <h3 className={styles.songTitle}>{song.title}</h3>
        </a>

        {song.artist && (
          <p className={styles.artist}>
            <MusicNoteIcon />
            <span>{song.artist}</span>
          </p>
        )}
      </div>

      {/* Tags Chips */}
      {song.tags?.length > 0 && (
        <div className={styles.tags}>
          {song.tags.map((tag) => (
            <span key={`${song.id}-${tag}`} className={styles.tag}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Link Group Launchers */}
      <div className={styles.linkGroup}>
        {links.map((linkUrl, idx) => {
          const meta = getDomainMeta(linkUrl)
          return (
            <a
              key={idx}
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.linkPill} ${meta.styleClass}`}
              title={`Play on ${meta.name}`}
            >
              <span>{links.length > 1 ? meta.name : `Open Chords`}</span>
              <ExternalLinkIcon />
            </a>
          )
        })}
      </div>
    </article>
  )
}
