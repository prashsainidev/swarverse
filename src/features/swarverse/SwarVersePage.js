'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { getSupabaseBrowserClient } from '../../lib/supabase/client'
import { useSongs } from '../../hooks/useSongs'
import { ADMIN_EMAIL, DIFFICULTIES, FILTERS, PAGE_SIZE, RECENT_LIMIT, SHELF_META } from './constants'
import { getPreferredTheme, getTrashDaysLeft, isSongDeleted, isTrashVisible, sortByDeleted, sortByLibrary, sortByRecent } from './utils'
import AddSongModal from '../../components/AddSongModal'
import AdminLoginModal from '../../components/AdminLoginModal'
import BrandLogo from '../../components/BrandLogo'
import SongCard from '../../components/SongCard'
import styles from './SwarVersePage.module.css'

function ThemeIcon({ theme }) {
  if (theme === 'dark') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3v2.2M12 18.8V21M4.22 4.22l1.56 1.56M18.22 18.22l1.56 1.56M3 12h2.2M18.8 12H21M4.22 19.78l1.56-1.56M18.22 5.78l1.56-1.56M12 7.2a4.8 4.8 0 1 0 0 9.6a4.8 4.8 0 0 0 0-9.6Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.2 14.1A7.9 7.9 0 1 1 9.9 3.8a6.8 6.8 0 0 0 10.3 10.3Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16M7 12h10M10 18h4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function SwarVersePage() {
  const [isHydrated, setIsHydrated] = useState(false)
  const supabase = isHydrated ? getSupabaseBrowserClient() : null
  const [session, setSession] = useState(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const [authError, setAuthError] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [diffFilter, setDiffFilter] = useState('all')
  const [artistFilter, setArtistFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [activeShelf, setActiveShelf] = useState('recent')
  const [page, setPage] = useState(1)
  const [showSongModal, setShowSongModal] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [editSong, setEditSong] = useState(null)
  const [theme, setTheme] = useState('dark')
  const [showSplash, setShowSplash] = useState(true)
  const searchAreaRef = useRef(null)

  const user = session?.user || null
  const isAdmin = Boolean(user?.email && ADMIN_EMAIL && user.email.toLowerCase() === ADMIN_EMAIL)

  const {
    songs,
    loaded,
    error,
    saving,
    addSong,
    deleteSong,
    permanentlyDeleteSong,
    restoreSong,
    updateSong,
    toggleFavorite,
  } = useSongs({
    supabase,
    user,
    isAdmin,
  })

  useEffect(() => {
    setIsHydrated(true)
    setTheme(getPreferredTheme())
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem('swarverse-theme', theme)
  }, [theme])

  useEffect(() => {
    if (!supabase) {
      return undefined
    }

    let active = true

    const syncSession = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession()

      if (!active) return

      if (sessionError) {
        setAuthError(sessionError.message)
      }

      setSession(data.session || null)
    }

    syncSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null)
      setAuthError('')
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    if (!showFilters) return undefined

    const handleOutsideClick = (event) => {
      if (searchAreaRef.current && !searchAreaRef.current.contains(event.target)) {
        setShowFilters(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
    }
  }, [showFilters])

  useEffect(() => {
    setPage(1)
  }, [search, typeFilter, diffFilter, artistFilter, activeShelf])

  const activeSongs = useMemo(() => songs.filter((song) => !isSongDeleted(song)), [songs])
  const trashSongs = useMemo(() => sortByDeleted(songs.filter((song) => isTrashVisible(song))), [songs])

  const allArtists = useMemo(() => {
    const artistSet = new Set()
    activeSongs.forEach((song) => {
      if (song.artist?.trim()) {
        artistSet.add(song.artist.trim())
      }
    })
    return [...artistSet].sort((a, b) => a.localeCompare(b))
  }, [activeSongs])

  const librarySongs = useMemo(() => sortByLibrary(activeSongs), [activeSongs])
  const recentSongs = useMemo(() => sortByRecent(activeSongs).slice(0, RECENT_LIMIT), [activeSongs])
  const favoriteSongs = useMemo(() => sortByRecent(activeSongs.filter((song) => song.favorite)), [activeSongs])

  const filteredSongs = useMemo(
    () =>
      librarySongs.filter((song) => {
        const query = search.toLowerCase()
        const matchSearch =
          song.title.toLowerCase().includes(query) ||
          song.artist?.toLowerCase().includes(query) ||
          song.tags?.some((tag) => tag.toLowerCase().includes(query))
        const matchType = typeFilter === 'all' || song.type === typeFilter
        const matchDifficulty = diffFilter === 'all' || song.difficulty === diffFilter
        const matchArtist = artistFilter === 'all' || song.artist === artistFilter

        return matchSearch && matchType && matchDifficulty && matchArtist
      }),
    [artistFilter, diffFilter, librarySongs, search, typeFilter]
  )

  const hasActiveFilters =
    search.trim() !== '' || typeFilter !== 'all' || diffFilter !== 'all' || artistFilter !== 'all'

  const shelfSongs = useMemo(() => {
    if (activeShelf === 'favorites') return favoriteSongs
    if (activeShelf === 'library') return librarySongs
    if (activeShelf === 'trash') return trashSongs
    return recentSongs
  }, [activeShelf, favoriteSongs, librarySongs, recentSongs, trashSongs])

  const visibleSongs = hasActiveFilters ? filteredSongs : shelfSongs
  const totalPages = Math.max(1, Math.ceil(visibleSongs.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pagedSongs = visibleSongs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const currentMeta = hasActiveFilters
    ? {
        eyebrow: 'Matching songs',
        title: 'Filtered results',
        note: 'Only the songs that match your current search or filters are shown here.',
      }
    : SHELF_META[activeShelf]

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  const resetFilterState = () => {
    setSearch('')
    setTypeFilter('all')
    setDiffFilter('all')
    setArtistFilter('all')
    setShowFilters(false)
  }

  const clearFilters = () => {
    resetFilterState()
  }

  const goHome = () => {
    resetFilterState()
    setActiveShelf('recent')
    setPage(1)

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const openSongModal = (song = null) => {
    setEditSong(song)
    setShowSongModal(true)
  }

  const closeSongModal = () => {
    setShowSongModal(false)
    setEditSong(null)
  }

  const openAdminLogin = () => {
    setAuthError('')
    setAuthMessage('')
    setShowAdminLogin(true)
  }

  const closeAdminLogin = () => {
    if (authLoading) return
    setShowAdminLogin(false)
    setAuthError('')
    setPassword('')
  }

  const handleSave = async (data) => {
    if (!isAdmin) return false

    const savedSong = editSong ? await updateSong(editSong.id, data) : await addSong(data)
    if (!savedSong) return false

    setEditSong(null)
    return true
  }

  const handleDelete = async (id) => {
    if (!isAdmin) return false
    await deleteSong(id)
    return true
  }

  const handleRestore = async (id) => {
    if (!isAdmin) return false
    await restoreSong(id)
    return true
  }

  const handlePermanentDelete = async (id) => {
    if (!isAdmin) return false

    const confirmed = window.confirm('This will remove the song from Trash permanently. Continue?')
    if (!confirmed) return false

    await permanentlyDeleteSong(id)
    return true
  }

  const handleToggleFavorite = async (id) => {
    if (!isAdmin) return false
    await toggleFavorite(id)
    return true
  }

  const handleSignIn = async (event) => {
    event.preventDefault()

    if (!supabase || !loginEmail.trim() || !password.trim()) return

    setAuthLoading(true)
    setAuthError('')
    setAuthMessage('')

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password,
    })

    setAuthLoading(false)

    if (signInError) {
      setAuthError(signInError.message)
      return
    }

    setPassword('')

    if (!data.user || data.user.email?.toLowerCase() !== ADMIN_EMAIL) {
      setAuthMessage('Signed in, but this account is read-only here.')
      return
    }

    setShowAdminLogin(false)
    setAuthMessage('Signed in successfully.')
  }

  const handleSignOut = async () => {
    if (!supabase) return

    setAuthLoading(true)
    setAuthError('')
    const { error: signOutError } = await supabase.auth.signOut()
    setAuthLoading(false)

    if (signOutError) {
      setAuthError(signOutError.message)
      return
    }

    setSession(null)
    setLoginEmail('')
    setPassword('')
    setAuthMessage('')
  }

  const statusHint = saving
    ? 'Syncing changes...'
    : hasActiveFilters
      ? 'Viewing: Filtered results'
      : `Viewing: ${currentMeta.title}`
  const isHomeView = !hasActiveFilters && activeShelf === 'recent' && currentPage === 1
  const isTrashShelf = !hasActiveFilters && activeShelf === 'trash'

  if (!loaded) {
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
      <header className={styles.hero}>
        <div className={styles.heroTop}>
          <button type="button" className={styles.logoButton} onClick={goHome} aria-label="Go to home">
            <div className={styles.logoArea}>
              <span className={styles.logoIcon}>
                <BrandLogo className={styles.brandImage} priority />
              </span>
              <div>
                <p className={styles.eyebrow}>Personal song space</p>
                <h1 className={styles.logoText}>SwarVerse</h1>
              </div>
            </div>
          </button>

          <div className={styles.quickActions}>
            {isHydrated && !isAdmin && supabase && ADMIN_EMAIL && (
              <button className={styles.ghostButton} onClick={openAdminLogin}>
                Login
              </button>
            )}

            {isHydrated && isAdmin && (
              <>
                <button className={styles.ghostButton} onClick={handleSignOut} disabled={authLoading}>
                  {authLoading ? 'Signing out...' : 'Logout'}
                </button>
                <button className={styles.primaryButton} onClick={() => openSongModal()} disabled={saving || isTrashShelf}>
                  Add song
                </button>
              </>
            )}

            <button
              className={styles.iconButton}
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <ThemeIcon theme={theme} />
            </button>
          </div>
        </div>

        <div className={styles.heroBody}>
          <p className={styles.heroLine}>Keep the songs you come back to in one place.</p>
          <p className={styles.heroSubline}>Search fast, open what you need, and keep your favorites close.</p>
          {isAdmin && <p className={styles.accountNote}>Signed in as {user.email}</p>}
        </div>
      </header>

      {error && <div className={styles.notice}>{error}</div>}
      {!showAdminLogin && authMessage && <div className={`${styles.notice} ${styles.noticeSuccess}`}>{authMessage}</div>}
      {isHydrated && !supabase && <div className={styles.notice}>Supabase env values are missing, so live sync is currently off.</div>}

      <section className={styles.searchArea} ref={searchAreaRef}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>/</span>
          <input
            className={styles.searchInput}
            placeholder="Search songs, artists or tags"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className={styles.searchActions}>
            {search && (
              <button
                className={styles.clearSearch}
                onClick={() => setSearch('')}
                aria-label="Clear search"
                title="Clear search"
              >
                x
              </button>
            )}
            <button
              className={`${styles.filterToggle} ${showFilters ? styles.filterToggleActive : ''}`}
              onClick={() => setShowFilters((current) => !current)}
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
                {FILTERS.map((filter) => (
                  <button
                    key={filter}
                    className={`${styles.pill} ${typeFilter === filter ? styles.pillActive : ''}`}
                    onClick={() => setTypeFilter(filter)}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterBlock}>
              <span className={styles.filterHeading}>Difficulty</span>
              <div className={styles.pills}>
                {DIFFICULTIES.map((level) => (
                  <button
                    key={level}
                    className={`${styles.pill} ${diffFilter === level ? styles.pillActive : ''}`}
                    onClick={() => setDiffFilter(level)}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <label className={styles.selectWrap}>
              <span className={styles.filterHeading}>Artist</span>
              <select value={artistFilter} onChange={(event) => setArtistFilter(event.target.value)}>
                <option value="all">All artists</option>
                {allArtists.map((artist) => (
                  <option key={artist} value={artist}>
                    {artist}
                  </option>
                ))}
              </select>
            </label>

            <div className={styles.filterFooter}>
              <button className={styles.resetFilters} onClick={clearFilters}>
                Reset filters
              </button>
            </div>
          </div>
        )}

        <div className={styles.resultsRow}>
          <p className={styles.resultsMeta}>
            <strong>{activeSongs.length}</strong> {activeSongs.length === 1 ? 'song' : 'songs'} total
          </p>
          <div className={styles.resultsActions}>
            {!isHomeView && (
              <button className={styles.homeButton} onClick={goHome}>
                Home
              </button>
            )}
            <span className={styles.resultsHint}>{statusHint}</span>
          </div>
        </div>
      </section>

      {!hasActiveFilters && (
        <section className={styles.shelfTabs}>
          <button
            className={`${styles.shelfTab} ${activeShelf === 'recent' ? styles.shelfTabActive : ''}`}
            onClick={() => setActiveShelf('recent')}
          >
            Recent
          </button>
          <button
            className={`${styles.shelfTab} ${activeShelf === 'favorites' ? styles.shelfTabActive : ''}`}
            onClick={() => setActiveShelf('favorites')}
          >
            Favorites
          </button>
          <button
            className={`${styles.shelfTab} ${activeShelf === 'library' ? styles.shelfTabActive : ''}`}
            onClick={() => setActiveShelf('library')}
          >
            Library
          </button>
          {isAdmin && (
            <button
              className={`${styles.shelfTab} ${activeShelf === 'trash' ? styles.shelfTabActive : ''}`}
              onClick={() => setActiveShelf('trash')}
            >
              Trash
            </button>
          )}
        </section>
      )}

      {pagedSongs.length === 0 ? (
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
            <button className={styles.resetFilters} onClick={clearFilters}>
              Back to default view
            </button>
          )}
        </div>
      ) : (
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
                onEdit={openSongModal}
                onDelete={handleDelete}
                onToggleFavorite={handleToggleFavorite}
                onRestore={handleRestore}
                onPermanentDelete={handlePermanentDelete}
                canManage={isAdmin}
                isTrash={isTrashShelf}
                trashDaysLeft={isTrashShelf ? getTrashDaysLeft(song) : 0}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageButton}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className={styles.pageButton}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </section>
      )}

      {showSongModal && isAdmin && (
        <AddSongModal onClose={closeSongModal} onSave={handleSave} editSong={editSong} saving={saving} />
      )}

      {showAdminLogin && !isAdmin && (
        <AdminLoginModal
          authError={authError}
          authLoading={authLoading}
          authMessage={authMessage}
          email={loginEmail}
          password={password}
          onClose={closeAdminLogin}
          onSubmit={handleSignIn}
          onEmailChange={(event) => setLoginEmail(event.target.value)}
          onPasswordChange={(event) => setPassword(event.target.value)}
        />
      )}
    </div>
  )
}
