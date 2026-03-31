import styles from './SearchPanel.module.css'
import { FilterIcon } from './icons'

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
  return (
    <section className={styles.searchArea} ref={searchAreaRef}>
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>/</span>
        <input
          className={styles.searchInput}
          placeholder="Search songs, artists or tags"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />

        <div className={styles.searchActions}>
          {search && (
            <button className={styles.clearSearch} onClick={onClearSearch} aria-label="Clear search" title="Clear search">
              x
            </button>
          )}
          <button
            className={`${styles.filterToggle} ${showFilters ? styles.filterToggleActive : ''}`}
            onClick={onToggleFilters}
            aria-label="Toggle filters"
            title="Toggle filters"
          >
            <FilterIcon />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className={styles.filterPanel}>
          <div className={styles.filterBlock}>
            <span className={styles.filterHeading}>Type</span>
            <div className={styles.pills}>
              {filterOptions.filters.map((filter) => (
                <button
                  key={filter}
                  className={`${styles.pill} ${typeFilter === filter ? styles.pillActive : ''}`}
                  onClick={() => onTypeChange(filter)}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterBlock}>
            <span className={styles.filterHeading}>Difficulty</span>
            <div className={styles.pills}>
              {filterOptions.difficulties.map((level) => (
                <button
                  key={level}
                  className={`${styles.pill} ${diffFilter === level ? styles.pillActive : ''}`}
                  onClick={() => onDifficultyChange(level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <label className={styles.selectWrap}>
            <span className={styles.filterHeading}>Artist</span>
            <select value={artistFilter} onChange={(event) => onArtistChange(event.target.value)}>
              <option value="all">All artists</option>
              {filterOptions.allArtists.map((artist) => (
                <option key={artist} value={artist}>
                  {artist}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.filterFooter}>
            <button className={styles.resetFilters} onClick={onClearFilters}>
              Reset filters
            </button>
          </div>
        </div>
      )}

      <div className={styles.resultsRow}>
        <p className={styles.resultsMeta}>
          <strong>{songsCount}</strong> {songsCount === 1 ? 'song' : 'songs'} total
        </p>
        <div className={styles.resultsActions}>
          {!isHomeView && (
            <button className={styles.homeButton} onClick={onGoHome}>
              Home
            </button>
          )}
          <span className={styles.resultsHint}>{statusHint}</span>
        </div>
      </div>
    </section>
  )
}
