'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '../../lib/supabase/client'
import { useSongs } from '../../hooks/useSongs'
import AddSongModal from '../../components/AddSongModal'
import AdminLoginModal from '../../components/AdminLoginModal'
import BrandLogo from '../../components/BrandLogo'
import HeroSection from './components/HeroSection'
import SearchPanel from './components/SearchPanel'
import ShelfTabs from './components/ShelfTabs'
import SongResultsSection from './components/SongResultsSection'
import { useAdminSession } from './hooks/useAdminSession'
import { useSongLibraryView } from './hooks/useSongLibraryView'
import { getPreferredTheme } from './utils'
import styles from './SwarVersePage.module.css'

export default function SwarVersePage() {
  const [isHydrated, setIsHydrated] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [showSplash, setShowSplash] = useState(true)
  const [showSongModal, setShowSongModal] = useState(false)
  const [editSong, setEditSong] = useState(null)

  const supabase = isHydrated ? getSupabaseBrowserClient() : null
  const adminSession = useAdminSession(supabase)
  const { user, isAdmin } = adminSession

  const songStore = useSongs({
    supabase,
    user,
    isAdmin,
  })

  const libraryView = useSongLibraryView(songStore.songs, songStore.saving)
  const { filters, filterOptions, derived, helpers, searchAreaRef } = libraryView

  useEffect(() => {
    setIsHydrated(true)
    setTheme(getPreferredTheme())
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem('swarverse-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  const openSongModal = (song = null) => {
    setEditSong(song)
    setShowSongModal(true)
  }

  const closeSongModal = () => {
    setShowSongModal(false)
    setEditSong(null)
  }

  const handleSave = async (data) => {
    if (!isAdmin) return false

    const savedSong = editSong ? await songStore.updateSong(editSong.id, data) : await songStore.addSong(data)
    if (!savedSong) return false

    setEditSong(null)
    return true
  }

  const handleDelete = async (id) => {
    if (!isAdmin) return false
    return songStore.deleteSong(id)
  }

  const handleRestore = async (id) => {
    if (!isAdmin) return false
    return songStore.restoreSong(id)
  }

  const handlePermanentDelete = async (id) => {
    if (!isAdmin) return false

    const confirmed = window.confirm('This will remove the song from Trash permanently. Continue?')
    if (!confirmed) return false

    return songStore.permanentlyDeleteSong(id)
  }

  const handleToggleFavorite = async (id) => {
    if (!isAdmin) return false
    return songStore.toggleFavorite(id)
  }

  if (!songStore.loaded) {
    return (
      <div className={styles.loading}>
        <span className={styles.loadingIcon}>
          <BrandLogo className={styles.brandImage} priority />
        </span>
        <p>Loading your songs...</p>
      </div>
    )
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
        isHydrated={isHydrated}
        isAdmin={isAdmin}
        user={user}
        authLoading={adminSession.authLoading}
        saving={songStore.saving}
        isTrashShelf={derived.isTrashShelf}
        supabaseAvailable={Boolean(supabase)}
        onGoHome={helpers.goHome}
        onOpenAdminLogin={adminSession.openAdminLogin}
        onSignOut={adminSession.handleSignOut}
        onOpenSongModal={() => openSongModal()}
        onToggleTheme={toggleTheme}
      />

      {songStore.error && <div className={styles.notice}>{songStore.error}</div>}
      {!adminSession.showAdminLogin && adminSession.authMessage && (
        <div className={`${styles.notice} ${styles.noticeSuccess}`}>{adminSession.authMessage}</div>
      )}
      {isHydrated && !supabase && <div className={styles.notice}>Supabase env values are missing, so live sync is currently off.</div>}

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
        <ShelfTabs activeShelf={filters.activeShelf} isAdmin={isAdmin} onChange={libraryView.setActiveShelf} />
      )}

      <SongResultsSection
        pagedSongs={derived.pagedSongs}
        hasActiveFilters={derived.hasActiveFilters}
        activeShelf={filters.activeShelf}
        currentMeta={derived.currentMeta}
        totalPages={derived.totalPages}
        currentPage={derived.currentPage}
        isAdmin={isAdmin}
        isTrashShelf={derived.isTrashShelf}
        onPageChange={libraryView.setPage}
        onClearFilters={helpers.clearFilters}
        onEditSong={openSongModal}
        onDeleteSong={handleDelete}
        onToggleFavorite={handleToggleFavorite}
        onRestoreSong={handleRestore}
        onPermanentDelete={handlePermanentDelete}
        getTrashDaysLeft={helpers.getTrashDaysLeft}
      />

      {showSongModal && isAdmin && (
        <AddSongModal onClose={closeSongModal} onSave={handleSave} editSong={editSong} saving={songStore.saving} />
      )}

      {adminSession.showAdminLogin && !isAdmin && (
        <AdminLoginModal
          authError={adminSession.authError}
          authLoading={adminSession.authLoading}
          authMessage={adminSession.authMessage}
          email={adminSession.loginEmail}
          password={adminSession.password}
          onClose={adminSession.closeAdminLogin}
          onSubmit={adminSession.handleSignIn}
          onEmailChange={(event) => adminSession.setLoginEmail(event.target.value)}
          onPasswordChange={(event) => adminSession.setPassword(event.target.value)}
        />
      )}
    </div>
  )
}
