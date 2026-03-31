import styles from './ShelfTabs.module.css'

export default function ShelfTabs({ activeShelf, isAdmin, onChange }) {
  return (
    <section className={styles.shelfTabs}>
      <button className={`${styles.shelfTab} ${activeShelf === 'recent' ? styles.shelfTabActive : ''}`} onClick={() => onChange('recent')}>
        Recent
      </button>
      <button className={`${styles.shelfTab} ${activeShelf === 'favorites' ? styles.shelfTabActive : ''}`} onClick={() => onChange('favorites')}>
        Favorites
      </button>
      <button className={`${styles.shelfTab} ${activeShelf === 'library' ? styles.shelfTabActive : ''}`} onClick={() => onChange('library')}>
        Library
      </button>
      {isAdmin && (
        <button className={`${styles.shelfTab} ${activeShelf === 'trash' ? styles.shelfTabActive : ''}`} onClick={() => onChange('trash')}>
          Trash
        </button>
      )}
    </section>
  )
}
