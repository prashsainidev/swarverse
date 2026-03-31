import { useEffect, useMemo, useRef, useState } from 'react'
import { DIFFICULTIES, FILTERS, PAGE_SIZE, RECENT_LIMIT, SHELF_META } from '../constants'
import { getTrashDaysLeft, isSongDeleted, isTrashVisible, sortByDeleted, sortByLibrary, sortByRecent } from '../utils'

export function useSongLibraryView(songs, saving) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [diffFilter, setDiffFilter] = useState('all')
  const [artistFilter, setArtistFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [activeShelf, setActiveShelf] = useState('recent')
  const [page, setPage] = useState(1)
  const searchAreaRef = useRef(null)

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

  const statusHint = saving
    ? 'Syncing changes...'
    : hasActiveFilters
      ? 'Viewing: Filtered results'
      : `Viewing: ${currentMeta.title}`

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

  return {
    filters: {
      search,
      typeFilter,
      diffFilter,
      artistFilter,
      showFilters,
      activeShelf,
      page,
    },
    setSearch,
    setTypeFilter,
    setDiffFilter,
    setArtistFilter,
    setShowFilters,
    setActiveShelf,
    setPage,
    searchAreaRef,
    filterOptions: {
      filters: FILTERS,
      difficulties: DIFFICULTIES,
      allArtists,
    },
    derived: {
      activeSongs,
      trashSongs,
      pagedSongs,
      currentMeta,
      statusHint,
      hasActiveFilters,
      totalPages,
      currentPage,
      isHomeView: !hasActiveFilters && activeShelf === 'recent' && currentPage === 1,
      isTrashShelf: !hasActiveFilters && activeShelf === 'trash',
    },
    helpers: {
      clearFilters,
      goHome,
      getTrashDaysLeft,
    },
  }
}
