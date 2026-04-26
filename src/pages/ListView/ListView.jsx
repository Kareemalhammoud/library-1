import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBooks } from '@/utils/api'
import { isAdminUser } from '@/utils'

const CAMPUS_OPTIONS = ['All Campuses', 'Beirut', 'Byblos']
const LANG_OPTIONS = ['All Languages', 'English', 'French']
const AVAIL_OPTIONS = ['All', 'Available', 'Unavailable']
const PAGE_SIZE = 12
const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'title-asc', label: 'Title: A to Z' },
  { value: 'title-desc', label: 'Title: Z to A' },
  { value: 'year-desc', label: 'Newest first' },
  { value: 'year-asc', label: 'Oldest first' },
]

const PLACEHOLDER_COVER = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
  <rect width="300" height="450" fill="#f5f2ed"/>
  <rect x="16" y="16" width="268" height="418" rx="18" fill="none" stroke="#d9d3cb" stroke-width="2"/>
  <text x="150" y="180" font-family="Arial, sans-serif" font-size="34" font-weight="700" text-anchor="middle" fill="#2f2f2f">NO</text>
  <text x="150" y="235" font-family="Arial, sans-serif" font-size="34" font-weight="700" text-anchor="middle" fill="#2f2f2f">COVER</text>
  <text x="150" y="290" font-family="Arial, sans-serif" font-size="34" font-weight="700" text-anchor="middle" fill="#2f2f2f">PAGE</text>
</svg>
`)}`

function sanitizeImage(url) {
  if (!url || typeof url !== 'string') return PLACEHOLDER_COVER
  if (url.startsWith('blob:')) return PLACEHOLDER_COVER
  return url
}

function normalizeBook(book) {
  const rawLanguage = book.language || ''
  const normalizedLanguage =
    rawLanguage === 'FR' || rawLanguage === 'French'
      ? 'French'
      : rawLanguage === 'EN' || rawLanguage === 'English'
        ? 'English'
        : rawLanguage

  return {
    id: book.id,
    title: book.title || '',
    author: book.author || '',
    genre: book.genre || book.category || 'General',
    language: normalizedLanguage || 'English',
    campus: book.campus || 'Beirut',
    copies: Number(book.available_copies ?? book.availableCopies ?? book.copies ?? 0),
    year: book.year ? Number(book.year) : 2024,
    rating: book.rating ? Number(book.rating) : 0,
    cover: sanitizeImage(book.cover || book.image),
    badge: '',
  }
}

export default function ListView() {
  const navigate = useNavigate()
  const admin = isAdminUser()

  const [books, setBooks] = useState([])
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('All')
  const [language, setLanguage] = useState('All Languages')
  const [campus, setCampus] = useState('All Campuses')
  const [avail, setAvail] = useState('All')
  const [sort, setSort] = useState('default')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await getBooks()
        setBooks(data.map(normalizeBook))
      } catch (err) {
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  const genres = useMemo(() => {
    return ['All', ...new Set(books.map((book) => book.genre).filter(Boolean))]
  }, [books])

  useEffect(() => {
    setPage(1)
  }, [search, genre, language, campus, avail, sort])

  const activeFilters = [
    genre !== 'All' && { key: 'genre', label: genre },
    language !== 'All Languages' && { key: 'language', label: language },
    campus !== 'All Campuses' && { key: 'campus', label: campus },
    avail !== 'All' && { key: 'avail', label: avail },
  ].filter(Boolean)

  function removeFilter(key) {
    if (key === 'genre') setGenre('All')
    if (key === 'language') setLanguage('All Languages')
    if (key === 'campus') setCampus('All Campuses')
    if (key === 'avail') setAvail('All')
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
    const result = books.filter((book) => {
      const bookCampus = book.campus === 'both' ? 'both' : book.campus || 'Beirut'
      const bookAvail = Number(book.copies) > 0
      const bookLang = book.language === 'French' ? 'French' : 'English'

      if (
        search &&
        !book.title.toLowerCase().includes(search.toLowerCase()) &&
        !book.author.toLowerCase().includes(search.toLowerCase())
      ) {
        return false
      }

      if (genre !== 'All' && book.genre !== genre) return false
      if (language !== 'All Languages' && bookLang !== language) return false
      if (campus !== 'All Campuses' && bookCampus !== 'both' && bookCampus !== campus) return false
      if (avail === 'Available' && !bookAvail) return false
      if (avail === 'Unavailable' && bookAvail) return false

      return true
    })

    const sorted = [...result]

    switch (sort) {
      case 'title-asc':
        sorted.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'title-desc':
        sorted.sort((a, b) => b.title.localeCompare(a.title))
        break
      case 'year-desc':
        sorted.sort((a, b) => (b.year || 0) - (a.year || 0))
        break
      case 'year-asc':
        sorted.sort((a, b) => (a.year || 0) - (b.year || 0))
        break
      default:
        break
    }

    return sorted
  }, [books, search, genre, language, campus, avail, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const selectStyle = {
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
  }

  const selectClass =
    'w-full appearance-none whitespace-nowrap rounded-[8px] border border-[#e0ddd8] bg-[#f8f7f4] bg-no-repeat py-[0.55rem] pl-3 pr-8 text-[0.82rem] text-[#333] outline-none transition-colors [background-position:right_0.6rem_center] focus:border-[#1a1a1a] dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-white dark:focus:border-[#5ecba1]'

  const totalActiveFilterCount = activeFilters.length + (search ? 1 : 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] pb-20 dark:bg-[#0f0f0f]">
        <div className="mx-auto max-w-[1200px] px-4 py-16 text-center text-[#555] dark:text-white">
          Loading books...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] pb-20 dark:bg-[#0f0f0f]">
        <div className="mx-auto max-w-[1200px] px-4 py-16 text-center text-red-600">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] pb-20 dark:bg-[#0f0f0f]">
      <header className="border-b border-[#e5e2dc] bg-[#f8f7f4] px-4 pb-5 pt-8 sm:px-6 md:px-8 md:pb-6 md:pt-10 dark:border-[#2a2a2a] dark:bg-[#0f0f0f]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[#aaa] dark:text-[#888]">
              Our Libraries
            </p>
            <h1 className="m-0 text-[1.6rem] font-extrabold tracking-tight text-[#1a1a1a] sm:text-[2rem] dark:text-white">
              Browse the Collection
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <p className="m-0 pb-1 text-[0.85rem] text-[#aaa]" aria-live="polite" aria-atomic="true">
              <span className="text-[1.1rem] font-bold text-[#555] dark:text-white">{filtered.length}</span> books
            </p>
            {admin && (
              <button
                className="whitespace-nowrap rounded-lg border-0 bg-[#1a4a3a] px-5 py-[0.6rem] text-[0.85rem] font-semibold text-white transition-colors hover:bg-[#2d7a4f]"
                onClick={() => navigate('/books/add')}
                aria-label="Add a new book"
              >
                + Add Book
              </button>
            )}
          </div>
        </div>
      </header>

      <section
        className="sticky top-0 z-10 block border-b border-[#e5e2dc] bg-[#f8f7f4] px-4 py-3 sm:px-6 md:px-8 md:py-4 dark:border-[#2a2a2a] dark:bg-[#0f0f0f]"
        aria-label="Filter and sort books"
      >
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-wrap items-end gap-2 sm:gap-3">
            <div className="relative min-w-0 flex-1" style={{ minWidth: '140px' }}>
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#aaa]"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
                <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input
                className="box-border w-full rounded-lg border border-[#e0ddd8] bg-[#f8f7f4] py-[0.55rem] pl-9 pr-3 text-[0.85rem] text-[#1a1a1a] outline-none transition-colors focus:border-[#1a1a1a] focus:bg-white dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-white dark:focus:border-[#5ecba1] dark:focus:bg-[#1a1a1a]"
                type="search"
                placeholder="Search title or author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search by title or author"
              />
            </div>

            <button
              className="flex items-center gap-1.5 rounded-lg border border-[#e0ddd8] bg-[#f8f7f4] px-3 py-[0.55rem] text-[0.82rem] font-semibold text-[#333] transition-colors md:hidden dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-white"
              onClick={() => setFiltersOpen((o) => !o)}
              aria-expanded={filtersOpen}
              aria-controls="filter-panel"
            >
              <svg className="h-4 w-4 text-[#888]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Filters
              {totalActiveFilterCount > 0 && (
                <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1a4a3a] text-[0.6rem] font-bold text-white">
                  {totalActiveFilterCount}
                </span>
              )}
            </button>

            <label className="flex flex-col gap-[0.2rem]">
              <span className="pl-[0.1rem] text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[#bbb] dark:text-[#888]">
                Sort by
              </span>
              <select
                className="appearance-none whitespace-nowrap rounded-[8px] border border-[#e0ddd8] bg-[#f8f7f4] bg-no-repeat py-[0.55rem] pl-3 pr-8 text-[0.82rem] text-[#333] outline-none transition-colors [background-position:right_0.6rem_center] focus:border-[#1a1a1a] dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-white dark:focus:border-[#5ecba1]"
                style={selectStyle}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort books"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div
            id="filter-panel"
            className={`mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 md:mt-0 md:flex md:flex-wrap md:items-center md:gap-3 ${
              filtersOpen ? '' : 'hidden md:flex'
            }`}
          >
            <label className="flex flex-col gap-[0.2rem]">
              <span className="pl-[0.1rem] text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[#bbb] dark:text-[#888]">
                Genre
              </span>
              <select className={selectClass} style={selectStyle} value={genre} onChange={(e) => setGenre(e.target.value)}>
                <option value="All">All Genres</option>
                {genres.filter((g) => g !== 'All').map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-[0.2rem]">
              <span className="pl-[0.1rem] text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[#bbb] dark:text-[#888]">
                Language
              </span>
              <select className={selectClass} style={selectStyle} value={language} onChange={(e) => setLanguage(e.target.value)}>
                {LANG_OPTIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-[0.2rem]">
              <span className="pl-[0.1rem] text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[#bbb] dark:text-[#888]">
                Campus
              </span>
              <select className={selectClass} style={selectStyle} value={campus} onChange={(e) => setCampus(e.target.value)}>
                {CAMPUS_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-[0.2rem]">
              <span className="pl-[0.1rem] text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[#bbb] dark:text-[#888]">
                Availability
              </span>
              <select className={selectClass} style={selectStyle} value={avail} onChange={(e) => setAvail(e.target.value)}>
                {AVAIL_OPTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {(activeFilters.length > 0 || search) && (
            <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Active filters">
              {search && (
                <span className="inline-flex items-center gap-[0.35rem] rounded-full bg-[#1a1a1a] py-[0.3rem] pl-3 pr-[0.6rem] text-[0.75rem] font-medium text-white dark:bg-[#333]">
                  &ldquo;{search}&rdquo;
                  <button
                    className="border-0 bg-transparent p-0 text-base leading-none text-white opacity-70 transition-opacity hover:opacity-100"
                    onClick={() => setSearch('')}
                    aria-label="Remove search filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {activeFilters.map((f) => (
                <span key={f.key} className="inline-flex items-center gap-[0.35rem] rounded-full bg-[#1a1a1a] py-[0.3rem] pl-3 pr-[0.6rem] text-[0.75rem] font-medium text-white dark:bg-[#333]">
                  {f.label}
                  <button
                    className="border-0 bg-transparent p-0 text-base leading-none text-white opacity-70 transition-opacity hover:opacity-100"
                    onClick={() => removeFilter(f.key)}
                    aria-label={`Remove ${f.label} filter`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                className="cursor-pointer rounded-full border border-[#1a4a3a] bg-transparent px-3 py-[0.3rem] text-[0.75rem] text-[#1a4a3a] transition-all hover:border-[#1a1a1a] hover:text-[#1a1a1a] dark:border-[#5ecba1] dark:text-[#5ecba1] dark:hover:border-white dark:hover:text-white"
                onClick={clearAll}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      <main className="mx-auto mt-8 max-w-[1200px] px-4 sm:px-6 md:mt-10 md:px-8">
        {filtered.length === 0 ? (
          <section className="flex flex-col items-center gap-3 px-4 py-16 text-center sm:py-24" aria-label="No results">
            <p className="m-0 text-[1.2rem] font-bold text-[#1a1a1a] dark:text-white">No books found</p>
            <p className="m-0 text-[0.9rem] text-[#999] dark:text-[#888]">Try adjusting your filters or search term.</p>
            <button
              className="mt-2 rounded-lg border-0 bg-[#1a4a3a] px-6 py-[0.65rem] text-[0.85rem] font-semibold text-white transition-colors hover:bg-[#2d7a4f]"
              onClick={clearAll}
            >
              Clear filters
            </button>
            {admin && (
              <button
                className="whitespace-nowrap rounded-lg border-0 bg-[#1a4a3a] px-5 py-[0.6rem] text-[0.85rem] font-semibold text-white transition-colors hover:bg-[#2d7a4f]"
                onClick={() => navigate('/books/add')}
              >
                + Add Book
              </button>
            )}
          </section>
        ) : (
          <>
            <ul
              className="m-0 grid list-none grid-cols-2 gap-x-4 gap-y-6 p-0 sm:grid-cols-3 md:grid-cols-4 lg:gap-x-6 lg:gap-y-8 xl:grid-cols-5"
              aria-label={`${filtered.length} books found`}
            >
              {paginated.map((book) => {
                const isAvailable = Number(book.copies) > 0
                const bookCampus = book.campus === 'both' ? 'Beirut / Byblos' : book.campus || 'Beirut'

                return (
                  <li key={book.id}>
                    <a
                      className="group flex flex-col gap-3 text-inherit no-underline"
                      href={`/books/${book.id}`}
                      onClick={(e) => {
                        e.preventDefault()
                        navigate(`/books/${book.id}`)
                      }}
                      aria-label={`${book.title} by ${book.author}, ${isAvailable ? 'available' : 'unavailable'}`}
                    >
                      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-[#e5e2dc] shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all duration-200 group-hover:-translate-y-[5px] group-hover:shadow-[0_12px_28px_rgba(0,0,0,0.15)] dark:bg-[#2e2e2e]">
                        <img
                          src={book.cover}
                          alt={`Cover of ${book.title}`}
                          className="block h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = PLACEHOLDER_COVER
                          }}
                        />
                        <span
                          className={`absolute bottom-[0.6rem] right-[0.6rem] h-[10px] w-[10px] rounded-full border-2 border-white ${isAvailable ? 'bg-[#2d7a4f]' : 'bg-[#c0392b]'}`}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex flex-col gap-[0.2rem]">
                        <span className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[#1a4a3a]">
                          {book.genre}
                        </span>
                        <h2 className="m-0 line-clamp-2 text-[0.85rem] font-bold leading-[1.3] text-[#1a1a1a] sm:text-[0.88rem] dark:text-white">
                          {book.title}
                        </h2>
                        <p className="m-0 text-[0.75rem] text-[#888] sm:text-[0.78rem] dark:text-[#888]">{book.author}</p>
                        <div className="mt-[0.4rem] flex items-center justify-between gap-1">
                          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[0.68rem] text-[#aaa] dark:text-[#888]">
                            {bookCampus}
                          </span>
                          <span className={`whitespace-nowrap text-[0.68rem] font-semibold ${isAvailable ? 'text-[#2d7a4f]' : 'text-[#c0392b]'}`}>
                            {isAvailable ? 'Available' : 'Borrowed'}
                          </span>
                        </div>
                      </div>
                    </a>
                  </li>
                )
              })}
            </ul>

            {totalPages > 1 && (
              <nav className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:mt-12 sm:gap-4" aria-label="Pagination">
                <button
                  className="cursor-pointer rounded-lg border border-[#e0ddd8] bg-white px-4 py-2 text-[0.82rem] font-semibold text-[#333] transition-all hover:enabled:border-[#1a4a3a] hover:enabled:text-[#1a4a3a] disabled:cursor-not-allowed disabled:opacity-35 sm:px-5 sm:text-[0.85rem] dark:border-[#333] dark:bg-[#242424] dark:text-[#888] dark:hover:enabled:border-[#5ecba1] dark:hover:enabled:text-[#5ecba1]"
                  onClick={() => {
                    setPage((p) => p - 1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  ← Prev
                </button>
                <span className="min-w-[60px] text-center text-[0.85rem] text-[#888] dark:text-[#888]">
                  {page} / {totalPages}
                </span>
                <button
                  className="cursor-pointer rounded-lg border border-[#e0ddd8] bg-white px-4 py-2 text-[0.82rem] font-semibold text-[#333] transition-all hover:enabled:border-[#1a4a3a] hover:enabled:text-[#1a4a3a] disabled:cursor-not-allowed disabled:opacity-35 sm:px-5 sm:text-[0.85rem] dark:border-[#333] dark:bg-[#242424] dark:text-[#888] dark:hover:enabled:border-[#5ecba1] dark:hover:enabled:text-[#5ecba1]"
                  onClick={() => {
                    setPage((p) => p + 1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  Next →
                </button>
              </nav>
            )}
          </>
        )}
      </main>
    </div>
  )
}
