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
  isAdmin,
  isTrashShelf,
  onPageChange,
  onClearFilters,
  onEditSong,
  onDeleteSong,
  onToggleFavorite,
  onRestoreSong,
  onPermanentDelete,
  getTrashDaysLeft,
}) {
  if (pagedSongs.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>
          <BrandLogo className={styles.brandImage} />
        </span>
        <p>
          {hasActiveFilters
            ? 'No songs match these filters right now.'
            : activeShelf === 'favorites'
              ? 'No favorites yet.'
              : activeShelf === 'trash'
                ? 'Trash is empty.'
                : 'There are no songs to show in this section yet.'}
        </p>
        {hasActiveFilters && (
          <button className={styles.resetFilters} onClick={onClearFilters}>
            Back to default view
          </button>
        )}
      </div>
    )
  }

  return (
    <section className={styles.contentSection}>
      <div className={styles.sectionHead}>
        <div>
          <p className={styles.sectionEyebrow}>{currentMeta.eyebrow}</p>
          <h2 className={styles.sectionTitle}>{currentMeta.title}</h2>
        </div>
        <p className={styles.sectionNote}>{currentMeta.note}</p>
      </div>

      <div className={styles.grid}>
        {pagedSongs.map((song) => (
          <SongCard
            key={song.id}
            song={song}
            onEdit={onEditSong}
            onDelete={onDeleteSong}
            onToggleFavorite={onToggleFavorite}
            onRestore={onRestoreSong}
            onPermanentDelete={onPermanentDelete}
            canManage={isAdmin}
            isTrash={isTrashShelf}
            trashDaysLeft={isTrashShelf ? getTrashDaysLeft(song) : 0}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageButton} onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button className={styles.pageButton} onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      )}
    </section>
  )
}
