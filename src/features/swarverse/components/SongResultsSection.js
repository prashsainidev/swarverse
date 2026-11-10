import BrandLogo from '../../../components/BrandLogo'
import SongCard from '../../../components/SongCard'
import styles from './SongResultsSection.module.css'

export default function SongResultsSection({
  pagedSongs,
  hasActiveFilters,
  activeShelf,
  currentMeta,
  totalPages,
  currentPage,
  onPageChange,
  onClearFilters,
  onToggleFavorite,
}) {
  if (pagedSongs.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIconWrap}>
          <BrandLogo className={styles.brandImage} />
        </div>
        <h3 className={styles.emptyTitle}>
          {hasActiveFilters
            ? 'No tracks found for this search'
            : activeShelf === 'favorites'
              ? 'No favorites yet'
              : 'No songs in this section'}
        </h3>
        <p className={styles.emptySubtitle}>
          {hasActiveFilters
            ? 'Try searching with a different artist name, keyword, or clear your filters.'
            : activeShelf === 'favorites'
              ? 'Click the star icon on any song to save it to your personal favorites.'
              : 'No songs to display.'}
        </p>
        {hasActiveFilters && (
          <button className={styles.resetFiltersBtn} onClick={onClearFilters}>
            Clear Filters & View All
          </button>
        )}
      </div>
    )
  }

  return (
    <section className={styles.contentSection}>
      <div className={styles.sectionHead}>
        <div>
          <span className={styles.sectionEyebrow}>{currentMeta.eyebrow}</span>
          <h2 className={styles.sectionTitle}>{currentMeta.title}</h2>
        </div>
        <p className={styles.sectionNote}>{currentMeta.note}</p>
      </div>

      <div className={styles.grid}>
        {pagedSongs.map((song) => (
          <SongCard
            key={song.id}
            song={song}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          <div className={styles.pageInfo}>
            <span>Page</span>
            <span className={styles.pageBadge}>{currentPage}</span>
            <span>of {totalPages}</span>
          </div>
          <button
            className={styles.pageButton}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </section>
  )
}
