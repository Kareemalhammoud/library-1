import './ListView.css'
import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GENRES } from '@/data/bookData'
import { getCampus, getAvailability } from '@/utils/bookUtils'
import { useBooks } from '@/context/BooksContext'

const CAMPUS_OPTIONS = ['All Campuses', 'Beirut', 'Byblos']
const LANG_OPTIONS   = ['All Languages', 'English', 'French']
const AVAIL_OPTIONS  = ['All', 'Available', 'Unavailable']
const PAGE_SIZE = 12
const SORT_OPTIONS = [
  { value: 'default',    label: 'Default'      },
  { value: 'title-asc',  label: 'Title: A → Z' },
  { value: 'title-desc', label: 'Title: Z → A' },
  { value: 'year-desc',  label: 'Newest first' },
  { value: 'year-asc',   label: 'Oldest first' },
  { value: 'rating',     label: 'Top rated'    },
]

export default function ListView() {
  const navigate = useNavigate()
  const { books } = useBooks()

  const [search,   setSearch]   = useState('')
  const [genre,    setGenre]    = useState('All')
  const [language, setLanguage] = useState('All Languages')
  const [campus,   setCampus]   = useState('All Campuses')
  const [avail,    setAvail]    = useState('All')
  const [sort,     setSort]     = useState('default')
  const [page,     setPage]     = useState(1)
  const [loading,  setLoading]  = useState(false)

  useEffect(() => { setPage(1) }, [search, genre, language, campus, avail, sort])

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [search, genre, language, campus, avail, sort, page])

  const activeFilters = [
    genre    !== 'All'           && { key: 'genre',    label: genre },
    language !== 'All Languages' && { key: 'language', label: language },
    campus   !== 'All Campuses'  && { key: 'campus',   label: campus },
    avail    !== 'All'           && { key: 'avail',    label: avail },
  ].filter(Boolean)

  function removeFilter(key) {
    if (key === 'genre')    setGenre('All')
    if (key === 'language') setLanguage('All Languages')
    if (key === 'campus')   setCampus('All Campuses')
    if (key === 'avail')    setAvail('All')
  }

  function clearAll() {
    setGenre('All')
    setLanguage('All Languages')
    setCampus('All Campuses')
    setAvail('All')
    setSearch('')
    setSort('default')
    setPage(1)
  }

  const filtered = useMemo(() => {
    const result = books.filter(book => {
      const bookCampus = getCampus(book.id)
      const bookAvail  = getAvailability(book.id)
      const bookLang   = book.language === 'FR' ? 'French' : 'English'

      if (search && !book.title.toLowerCase().includes(search.toLowerCase()) &&
                    !book.author.toLowerCase().includes(search.toLowerCase())) return false
      if (genre    !== 'All'           && book.genre !== genre)                           return false
      if (language !== 'All Languages' && bookLang   !== language)                        return false
      if (campus   !== 'All Campuses'  && bookCampus !== 'both' && bookCampus !== campus) return false
      if (avail    === 'Available'     && !bookAvail)                                     return false
      if (avail    === 'Unavailable'   && bookAvail)                                      return false
      return true
    })

    const sorted = [...result]
    switch (sort) {
      case 'title-asc':  sorted.sort((a, b) => a.title.localeCompare(b.title)); break
      case 'title-desc': sorted.sort((a, b) => b.title.localeCompare(a.title)); break
      case 'year-desc':  sorted.sort((a, b) => b.year   - a.year);              break
      case 'year-asc':   sorted.sort((a, b) => a.year   - b.year);              break
      case 'rating':     sorted.sort((a, b) => b.rating - a.rating);            break
      default: break
    }
    return sorted
  }, [books, search, genre, language, campus, avail, sort])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="lv-page min-h-screen bg-[#f8f7f4] pb-20">

      {/* ── Page header ── */}
      <header className="lv-header bg-[#f8f7f4] border-b border-[#e5e2dc] px-8 pt-10 pb-6">
        <div className="max-w-[1200px] mx-auto flex items-end justify-between">
          <div>
            <p className="lv-eyebrow text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[#aaa] mb-1">
              Riyad Nassar Library
            </p>
            <h1 className="lv-heading text-[2rem] font-extrabold text-[#1a1a1a] tracking-tight m-0">
              Browse the Collection
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[0.85rem] text-[#aaa] m-0 pb-1" aria-live="polite" aria-atomic="true">
              <span className="lv-count-num text-[1.1rem] font-bold text-[#555]">{filtered.length}</span> books
            </p>
            <button
              className="px-5 py-[0.6rem] rounded-lg border-0 bg-[#1a4a3a] text-white text-[0.85rem] font-semibold cursor-pointer transition-colors hover:bg-[#2d7a4f] whitespace-nowrap"
              onClick={() => navigate('/books/add')}
              aria-label="Add a new book"
            >
              + Add Book
            </button>
          </div>
        </div>
      </header>

      {/* ── Filter + sort bar ── */}
      <search className="lv-filter-bar block bg-white border-b border-[#e5e2dc] px-8 py-4 sticky top-0 z-10" aria-label="Filter and sort books">
        <div className="max-w-[1200px] mx-auto flex gap-3 items-center flex-wrap">

          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[#aaa] pointer-events-none" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <input
              className="lv-search-input w-full py-[0.55rem] pr-3 pl-9 border border-[#e0ddd8] rounded-lg text-[0.85rem] bg-[#f8f7f4] text-[#1a1a1a] outline-none transition-colors focus:border-[#1a1a1a] focus:bg-white box-border"
              type="search"
              placeholder="Search title or author…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search by title or author"
            />
          </div>

          <label className="flex flex-col gap-[0.2rem]">
            <span className="lv-select-label-text text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[#bbb] pl-[0.1rem]">Genre</span>
            <select className="lv-select" value={genre} onChange={e => setGenre(e.target.value)}>
              <option value="All">All Genres</option>
              {GENRES.filter(g => g !== 'All').map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>

          <label className="flex flex-col gap-[0.2rem]">
            <span className="lv-select-label-text text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[#bbb] pl-[0.1rem]">Language</span>
            <select className="lv-select" value={language} onChange={e => setLanguage(e.target.value)}>
              {LANG_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>

          <label className="flex flex-col gap-[0.2rem]">
            <span className="lv-select-label-text text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[#bbb] pl-[0.1rem]">Campus</span>
            <select className="lv-select" value={campus} onChange={e => setCampus(e.target.value)}>
              {CAMPUS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label className="flex flex-col gap-[0.2rem]">
            <span className="lv-select-label-text text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[#bbb] pl-[0.1rem]">Availability</span>
            <select className="lv-select" value={avail} onChange={e => setAvail(e.target.value)}>
              {AVAIL_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>

          <label className="lv-sort-label flex flex-col gap-[0.2rem] pl-3 border-l border-[#e5e2dc] ml-1">
            <span className="lv-select-label-text text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[#bbb] pl-[0.1rem]">Sort by</span>
            <select className="lv-select" value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort books">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>

        </div>

        {(activeFilters.length > 0 || search) && (
          <div className="max-w-[1200px] mx-auto mt-3 flex gap-2 items-center flex-wrap" role="group" aria-label="Active filters">
            {search && (
              <span className="lv-chip inline-flex items-center gap-[0.35rem] py-[0.3rem] pl-3 pr-[0.6rem] bg-[#1a1a1a] text-white rounded-full text-[0.75rem] font-medium">
                "{search}"
                <button className="bg-transparent border-0 text-white cursor-pointer text-base leading-none p-0 opacity-70 hover:opacity-100 transition-opacity" onClick={() => setSearch('')} aria-label="Remove search filter">×</button>
              </span>
            )}
            {activeFilters.map(f => (
              <span key={f.key} className="lv-chip inline-flex items-center gap-[0.35rem] py-[0.3rem] pl-3 pr-[0.6rem] bg-[#1a1a1a] text-white rounded-full text-[0.75rem] font-medium">
                {f.label}
                <button className="bg-transparent border-0 text-white cursor-pointer text-base leading-none p-0 opacity-70 hover:opacity-100 transition-opacity" onClick={() => removeFilter(f.key)} aria-label={`Remove ${f.label} filter`}>×</button>
              </span>
            ))}
            <button className="lv-clear-all bg-transparent border border-[#1a4a3a] text-[#1a4a3a] rounded-full px-3 py-[0.3rem] text-[0.75rem] cursor-pointer transition-all hover:border-[#1a1a1a] hover:text-[#1a1a1a]" onClick={clearAll}>Clear all</button>
          </div>
        )}
      </search>

      {/* ── Book grid ── */}
      <main className="max-w-[1200px] mx-auto mt-10 px-8">
        {filtered.length === 0 ? (
          <section className="text-center py-24 px-8 flex flex-col items-center gap-3" aria-label="No results">
            <p className="lv-empty-title text-[1.2rem] font-bold text-[#1a1a1a] m-0">No books found</p>
            <p className="lv-empty-body text-[0.9rem] text-[#999] m-0">Try adjusting your filters or search term.</p>
            <button className="mt-2 px-6 py-[0.65rem] bg-[#1a4a3a] text-white border-0 rounded-lg text-[0.85rem] font-semibold cursor-pointer transition-colors hover:bg-[#2d7a4f]" onClick={clearAll}>Clear filters</button>
            <button className="px-5 py-[0.6rem] rounded-lg border-0 bg-[#1a4a3a] text-white text-[0.85rem] font-semibold cursor-pointer transition-colors hover:bg-[#2d7a4f] whitespace-nowrap" onClick={() => navigate('/books/add')}>+ Add Book</button>
          </section>
        ) : (
          <>
            {loading ? (
              <ul className="list-none p-0 m-0 grid gap-x-6 gap-y-8 lv-grid" aria-label="Loading books">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <li key={i}>
                    <div className="lv-skeleton-cover" />
                    <div className="lv-skeleton-line" />
                    <div className="lv-skeleton-line-short" />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="list-none p-0 m-0 grid gap-x-6 gap-y-8 lv-grid" aria-label={`${filtered.length} books found`}>
                {paginated.map(book => {
                  const isAvailable = getAvailability(book.id)
                  const bookCampus  = getCampus(book.id)
                  return (
                    <li key={book.id}>
                      <a
                        className="no-underline text-inherit flex flex-col gap-3 group"
                        href={`/books/${book.id}`}
                        onClick={e => { e.preventDefault(); navigate(`/books/${book.id}`) }}
                        aria-label={`${book.title} by ${book.author}, ${isAvailable ? 'available' : 'unavailable'}`}
                      >
                        <div className="lv-cover-wrap relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-[#e5e2dc] shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all duration-200 group-hover:-translate-y-[5px] group-hover:shadow-[0_12px_28px_rgba(0,0,0,0.15)]">
                          <img src={book.cover} alt={`Cover of ${book.title}`} className="w-full h-full object-cover block" onError={e => { e.currentTarget.style.display = 'none' }} />
                          <span className="lv-avail-dot" data-available={isAvailable} aria-hidden="true" />
                          {book.badge && (
                            <span className="absolute top-2 left-2 bg-[#1a1a1a] text-white text-[0.62rem] font-bold uppercase tracking-[0.06em] py-[0.2rem] px-[0.45rem] rounded-[4px]">{book.badge}</span>
                          )}
                        </div>
                        <div className="flex flex-col gap-[0.2rem]">
                          <span className="text-[0.68rem] font-bold uppercase tracking-[0.08em]" style={{ color: book.genreColor }}>{book.genre}</span>
                          <h2 className="lv-card-title text-[0.88rem] font-bold text-[#1a1a1a] m-0 leading-[1.3] line-clamp-2">{book.title}</h2>
                          <p className="lv-card-author text-[0.78rem] text-[#888] m-0">{book.author}</p>
                          <div className="flex justify-between items-center mt-[0.4rem] gap-2">
                            <span className="lv-card-campus text-[0.7rem] text-[#aaa] whitespace-nowrap overflow-hidden text-ellipsis">
                              {bookCampus === 'both' ? '📍 Beirut · Byblos' : `📍 ${bookCampus}`}
                            </span>
                            <span className="lv-card-avail text-[0.7rem] font-semibold whitespace-nowrap" data-available={isAvailable} aria-hidden="true">
                              {isAvailable ? 'Available' : 'Borrowed'}
                            </span>
                          </div>
                        </div>
                      </a>
                    </li>
                  )
                })}
              </ul>
            )}

            {totalPages > 1 && (
              <nav className="flex justify-center items-center gap-4 mt-12" aria-label="Pagination">
                <button className="lv-page-btn px-5 py-2 border border-[#e0ddd8] rounded-lg bg-white text-[#333] text-[0.85rem] font-semibold cursor-pointer transition-all hover:enabled:border-[#1a4a3a] hover:enabled:text-[#1a4a3a] disabled:opacity-35 disabled:cursor-not-allowed" onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }} disabled={page === 1} aria-label="Previous page">← Prev</button>
                <span className="lv-page-info text-[0.85rem] text-[#888] min-w-[60px] text-center">{page} / {totalPages}</span>
                <button className="lv-page-btn px-5 py-2 border border-[#e0ddd8] rounded-lg bg-white text-[#333] text-[0.85rem] font-semibold cursor-pointer transition-all hover:enabled:border-[#1a4a3a] hover:enabled:text-[#1a4a3a] disabled:opacity-35 disabled:cursor-not-allowed" onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }} disabled={page === totalPages} aria-label="Next page">Next →</button>
              </nav>
            )}
          </>
        )}
      </main>
    </div>
  )
}