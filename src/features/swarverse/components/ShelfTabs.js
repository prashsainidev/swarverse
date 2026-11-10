import styles from './ShelfTabs.module.css'
import { LibraryIcon, RecentIcon, StarIcon } from './icons'

export default function ShelfTabs({ activeShelf, onChange }) {
  return (
    <nav className={styles.shelfTabs} aria-label="Library shelves">
      <button
        className={`${styles.shelfTab} ${activeShelf === 'library' ? styles.shelfTabActive : ''}`}
        onClick={() => onChange('library')}
      >
        <LibraryIcon />
        <span>All Vault Songs</span>
      </button>

      <button
        className={`${styles.shelfTab} ${activeShelf === 'recent' ? styles.shelfTabActive : ''}`}
        onClick={() => onChange('recent')}
      >
        <RecentIcon />
        <span>Recently Added</span>
      </button>

      <button
        className={`${styles.shelfTab} ${activeShelf === 'favorites' ? styles.shelfTabActive : ''}`}
        onClick={() => onChange('favorites')}
      >
        <StarIcon filled={activeShelf === 'favorites'} />
        <span>Favorites</span>
      </button>
    </nav>
  )
}
