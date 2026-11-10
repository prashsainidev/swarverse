'use client'

import { useEffect, useState } from 'react'
import { useSongs } from '../../hooks/useSongs'
import BrandLogo from '../../components/BrandLogo'
import HeroSection from './components/HeroSection'
import SearchPanel from './components/SearchPanel'
import ShelfTabs from './components/ShelfTabs'
import SongResultsSection from './components/SongResultsSection'
import { useSongLibraryView } from './hooks/useSongLibraryView'
import { getPreferredTheme } from './utils'
import styles from './SwarVersePage.module.css'

export default function SwarVersePage() {
  const [theme, setTheme] = useState('dark')
  const [showSplash, setShowSplash] = useState(true)

  const songStore = useSongs()
  const libraryView = useSongLibraryView(songStore.songs)
  const { filters, filterOptions, derived, helpers, searchAreaRef } = libraryView

  useEffect(() => {
    setTheme(getPreferredTheme())
    const timer = setTimeout(() => setShowSplash(false), 950)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem('swarverse-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  return (
    <div className={styles.root}>
      {showSplash && (
        <div className={styles.splashScreen} aria-hidden="true">
          <div className={styles.splashInner}>
            <span className={styles.splashLogo}>
              <BrandLogo className={styles.brandImage} priority />
            </span>
            <p className={styles.splashText}>SwarVerse</p>
          </div>
        </div>
      )}

      <HeroSection
        theme={theme}
        onGoHome={helpers.goHome}
        onToggleTheme={toggleTheme}
      />

      <SearchPanel
        searchAreaRef={searchAreaRef}
        search={filters.search}
        onSearchChange={libraryView.setSearch}
        onClearSearch={() => libraryView.setSearch('')}
        showFilters={filters.showFilters}
        onToggleFilters={() => libraryView.setShowFilters((current) => !current)}
        typeFilter={filters.typeFilter}
        diffFilter={filters.diffFilter}
        artistFilter={filters.artistFilter}
        onTypeChange={libraryView.setTypeFilter}
        onDifficultyChange={libraryView.setDiffFilter}
        onArtistChange={libraryView.setArtistFilter}
        filterOptions={filterOptions}
        onClearFilters={helpers.clearFilters}
        songsCount={derived.activeSongs.length}
        statusHint={derived.statusHint}
        isHomeView={derived.isHomeView}
        onGoHome={helpers.goHome}
      />

      {!derived.hasActiveFilters && (
        <ShelfTabs
          activeShelf={filters.activeShelf}
          onChange={libraryView.setActiveShelf}
        />
      )}

      <SongResultsSection
        pagedSongs={derived.pagedSongs}
        hasActiveFilters={derived.hasActiveFilters}
        activeShelf={filters.activeShelf}
        currentMeta={derived.currentMeta}
        totalPages={derived.totalPages}
        currentPage={derived.currentPage}
        onPageChange={libraryView.setPage}
        onClearFilters={helpers.clearFilters}
        onToggleFavorite={songStore.toggleFavorite}
      />
    </div>
  )
}
