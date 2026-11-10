import styles from './SearchPanel.module.css'
import { FilterIcon, SearchIcon } from './icons'

export default function SearchPanel({
  searchAreaRef,
  search,
  onSearchChange,
  onClearSearch,
  showFilters,
  onToggleFilters,
  typeFilter,
  diffFilter,
  artistFilter,
  onTypeChange,
  onDifficultyChange,
  onArtistChange,
  filterOptions,
  onClearFilters,
  songsCount,
  statusHint,
  isHomeView,
  onGoHome,
}) {
  const hasActiveCustomFilters = typeFilter !== 'all' || diffFilter !== 'all' || artistFilter !== 'all'

  return (
    <section className={styles.searchArea} ref={searchAreaRef}>
      {/* Sleek Command-Bar Search Input */}
      <div className={`${styles.searchWrap} ${search ? styles.searchWrapActive : ''}`}>
        <span className={styles.searchIcon}>
          <SearchIcon />
        </span>

        <input
          className={styles.searchInput}
          placeholder="Search by song name, artist, or tags (e.g. Arijit, romantic, hindi)..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />

        <div className={styles.searchActions}>
          {search && (
            <button className={styles.clearSearch} onClick={onClearSearch} aria-label="Clear search" title="Clear search">
              ✕
            </button>
          )}

          <button
            className={`${styles.filterToggle} ${showFilters || hasActiveCustomFilters ? styles.filterToggleActive : ''}`}
            onClick={onToggleFilters}
            aria-label="Toggle filters"
            title="Toggle filters"
          >
            <FilterIcon />
            <span className={styles.filterToggleLabel}>Filters</span>
            {hasActiveCustomFilters && <span className={styles.filterDot} />}
          </button>
        </div>
      </div>

      {/* Floating Glass Filter Dropdown Panel */}
      {showFilters && (
        <div className={styles.filterPanel}>
          <div className={styles.filterGrid}>
            {/* Filter by Type */}
            <div className={styles.filterBlock}>
              <span className={styles.filterHeading}>Arrangement Type</span>
              <div className={styles.pills}>
                {filterOptions.filters.map((filter) => (
                  <button
                    key={filter}
                    className={`${styles.pill} ${typeFilter === filter ? styles.pillActive : ''}`}
                    onClick={() => onTypeChange(filter)}
                  >
                    {filter === 'all' ? 'All Types' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Difficulty */}
            <div className={styles.filterBlock}>
              <span className={styles.filterHeading}>Skill Difficulty</span>
              <div className={styles.pills}>
                {filterOptions.difficulties.map((level) => (
                  <button
                    key={level}
                    className={`${styles.pill} ${diffFilter === level ? styles.pillActive : ''}`}
                    onClick={() => onDifficultyChange(level)}
                  >
                    {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Artist */}
            <div className={styles.filterBlock}>
              <label className={styles.selectWrap}>
                <span className={styles.filterHeading}>Artist Filter</span>
                <select className={styles.artistSelect} value={artistFilter} onChange={(event) => onArtistChange(event.target.value)}>
                  <option value="all">All Artists ({filterOptions.allArtists.length})</option>
                  {filterOptions.allArtists.map((artist) => (
                    <option key={artist} value={artist}>
                      {artist}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className={styles.filterFooter}>
            <button className={styles.resetFilters} onClick={onClearFilters}>
              Reset all filters
            </button>
          </div>
        </div>
      )}

      {/* Status Bar / Song Counter */}
      <div className={styles.statusBar}>
        <div className={styles.songCountPill}>
          <span className={styles.countNumber}>{songsCount}</span>
          <span className={styles.countText}>{songsCount === 1 ? 'track' : 'tracks in library'}</span>
        </div>

        {statusHint && <span className={styles.statusHint}>{statusHint}</span>}

        {!isHomeView && (
          <button className={styles.homeLinkBtn} onClick={onGoHome}>
            ← Back to all songs
          </button>
        )}
      </div>
    </section>
  )
}
