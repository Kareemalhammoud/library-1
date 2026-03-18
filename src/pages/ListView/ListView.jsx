import styles from './ListView.module.css'
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { GENRES } from '@/data/bookData'
import { getCampus, getAvailability } from '@/utils/bookUtils'
import { useBooks } from '@/context/BooksContext'

const CAMPUS_OPTIONS = ['All Campuses', 'Beirut', 'Byblos']
const LANG_OPTIONS   = ['All Languages', 'English', 'French']
const AVAIL_OPTIONS  = ['All', 'Available', 'Unavailable']

export default function ListView() {
  const navigate = useNavigate()
  const { books } = useBooks()

  const [search,   setSearch]   = useState('')
  const [genre,    setGenre]    = useState('All')
  const [language, setLanguage] = useState('All Languages')
  const [campus,   setCampus]   = useState('All Campuses')
  const [avail,    setAvail]    = useState('All')

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
  }

  const filtered = useMemo(() => {
    return books.filter(book => {
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
  }, [books, search, genre, language, campus, avail])

  return (
    <div className={styles.page}>

      {/* ── Page header ── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerText}>
            <p className={styles.eyebrow}>Riyad Nassar Library</p>
            <h1 className={styles.heading}>Browse the Collection</h1>
          </div>
          <div className={styles.headerRight}>
            <p
              className={styles.count}
              aria-live="polite"
              aria-atomic="true"
            >
              <span className={styles.countNum}>{filtered.length}</span> books
            </p>
            <button
              className={styles.addBtn}
              onClick={() => navigate('/books/add')}
              aria-label="Add a new book"
            >
              + Add Book
            </button>
          </div>
        </div>
      </header>

      {/* ── Filter bar ── */}
      <search className={styles.filterBar} aria-label="Filter books">
        <div className={styles.filterBarInner}>

          {/* Search */}
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <input
              className={styles.searchInput}
              type="search"
              placeholder="Search title or author…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search by title or author"
            />
          </div>

          {/* Genre */}
          <label className={styles.selectLabel}>
            <span className={styles.selectLabelText}>Genre</span>
            <select
              className={styles.select}
              value={genre}
              onChange={e => setGenre(e.target.value)}
            >
              <option value="All">All Genres</option>
              {GENRES.filter(g => g !== 'All').map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </label>

          {/* Language */}
          <label className={styles.selectLabel}>
            <span className={styles.selectLabelText}>Language</span>
            <select
              className={styles.select}
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              {LANG_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>

          {/* Campus */}
          <label className={styles.selectLabel}>
            <span className={styles.selectLabelText}>Campus</span>
            <select
              className={styles.select}
              value={campus}
              onChange={e => setCampus(e.target.value)}
            >
              {CAMPUS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          {/* Availability */}
          <label className={styles.selectLabel}>
            <span className={styles.selectLabelText}>Availability</span>
            <select
              className={styles.select}
              value={avail}
              onChange={e => setAvail(e.target.value)}
            >
              {AVAIL_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>

        </div>

        {/* Active filter chips */}
        {(activeFilters.length > 0 || search) && (
          <div
            className={styles.chips}
            role="group"
            aria-label="Active filters"
          >
            {search && (
              <span className={styles.chip}>
                "{search}"
                <button
                  className={styles.chipRemove}
                  onClick={() => setSearch('')}
                  aria-label="Remove search filter"
                >×</button>
              </span>
            )}
            {activeFilters.map(f => (
              <span key={f.key} className={styles.chip}>
                {f.label}
                <button
                  className={styles.chipRemove}
                  onClick={() => removeFilter(f.key)}
                  aria-label={`Remove ${f.label} filter`}
                >×</button>
              </span>
            ))}
            <button className={styles.clearAll} onClick={clearAll}>
              Clear all
            </button>
          </div>
        )}
      </search>

      {/* ── Grid ── */}
      <main className={styles.main}>
        {filtered.length === 0 ? (
          <section className={styles.empty} aria-label="No results">
            <p className={styles.emptyTitle}>No books found</p>
            <p className={styles.emptyBody}>Try adjusting your filters or search term.</p>
            <button className={styles.emptyBtn} onClick={clearAll} aria-label="Clear all filters">
              Clear filters
            </button>
            <button className={styles.addBtn} onClick={() => navigate('/books/add')} aria-label="Add a new book">
              + Add Book
            </button>
          </section>
        ) : (
          <ul className={styles.grid} aria-label={`${filtered.length} books found`}>
            {filtered.map(book => {
              const isAvailable = getAvailability(book.id)
              const bookCampus  = getCampus(book.id)
              return (
                <li key={book.id}>
                  <a
                    className={styles.card}
                    href={`/books/${book.id}`}
                    onClick={e => { e.preventDefault(); navigate(`/books/${book.id}`) }}
                    aria-label={`${book.title} by ${book.author}, ${isAvailable ? 'available' : 'unavailable'}`}
                  >
                    <div className={styles.coverWrap} data-color={book.color}>
                      <img
                        src={book.cover}
                        alt={`Cover of ${book.title}`}
                        className={styles.coverImg}
                        onError={e => { e.currentTarget.style.display = 'none' }}
                      />
                      <span
                        className={styles.availDot}
                        data-available={isAvailable}
                        aria-hidden="true"
                      />
                      {book.badge && (
                        <span className={styles.badge} aria-label={book.badge}>
                          {book.badge}
                        </span>
                      )}
                    </div>

                    <div className={styles.cardBody}>
                      <span className={styles.cardGenre} style={{ color: book.genreColor }}>
                        {book.genre}
                      </span>
                      <h2 className={styles.cardTitle}>{book.title}</h2>
                      <p className={styles.cardAuthor}>{book.author}</p>

                      <div className={styles.cardFooter}>
                        <span className={styles.cardCampus}>
                          {bookCampus === 'both' ? '📍 Beirut · Byblos' : `📍 ${bookCampus}`}
                        </span>
                        <span
                          className={styles.cardAvail}
                          data-available={isAvailable}
                          aria-hidden="true"
                        >
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
      </main>
    </div>
  )
}