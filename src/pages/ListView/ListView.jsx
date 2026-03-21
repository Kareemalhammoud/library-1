import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GENRES } from '@/data/bookData'
import { getCampus, getAvailability } from '@/utils/bookUtils'
import { useBooks } from '@/context/BooksContext'

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
  { value: 'rating', label: 'Top rated' },
]

export default function ListView() {
  const navigate = useNavigate()
  const { books } = useBooks()

  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('All')
  const [language, setLanguage] = useState('All Languages')
  const [campus, setCampus] = useState('All Campuses')
  const [avail, setAvail] = useState('All')
  const [sort, setSort] = useState('default')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setPage(1)
  }, [search, genre, language, campus, avail, sort])

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [search, genre, language, campus, avail, sort, page])

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
      const bookCampus = getCampus(book.id)
      const bookAvail = getAvailability(book.id)
      const bookLang = book.language === 'FR' ? 'French' : 'English'

      if (
        search &&
        !book.title.toLowerCase().includes(search.toLowerCase()) &&
        !book.author.toLowerCase().includes(search.toLowerCase())
      ) return false
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
        sorted.sort((a, b) => b.year - a.year)
        break
      case 'year-asc':
        sorted.sort((a, b) => a.year - b.year)
        break
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating)
        break
      default:
        break
    }

    return sorted
  }, [books, search, genre, language, campus, avail, sort])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const selectStyle = {
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
  }
  const selectClass =
    'appearance-none whitespace-nowrap rounded-[8px] border border-[#e0ddd8] bg-[#f8f7f4] bg-no-repeat py-[0.55rem] pl-3 pr-8 text-[0.82rem] text-[#333] outline-none transition-colors [background-position:right_0.6rem_center] focus:border-[#1a1a1a] dark:border-[#333] dark:bg-[#2e2e2e] dark:text-white dark:focus:border-[#00AB8E]'

  return (
    <div className="min-h-screen bg-[#f8f7f4] pb-20 dark:bg-[#1a1a1a]">
      <header className="border-b border-[#e5e2dc] bg-[#f8f7f4] px-8 pb-6 pt-10 dark:border-[#333] dark:bg-[#1a1a1a]">
        <div className="mx-auto flex max-w-[1200px] items-end justify-between">
          <div>
            <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[#aaa] dark:text-[#888]">
              Riyad Nassar Library
            </p>
            <h1 className="m-0 text-[2rem] font-extrabold tracking-tight text-[#1a1a1a] dark:text-white">
              Browse the Collection
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="m-0 pb-1 text-[0.85rem] text-[#aaa]" aria-live="polite" aria-atomic="true">
              <span className="text-[1.1rem] font-bold text-[#555] dark:text-white">{filtered.length}</span> books
            </p>
            <button
              className="whitespace-nowrap rounded-lg border-0 bg-[#1a4a3a] px-5 py-[0.6rem] text-[0.85rem] font-semibold text-white transition-colors hover:bg-[#2d7a4f]"
              onClick={() => navigate('/books/add')}
              aria-label="Add a new book"
            >
              + Add Book
            </button>
          </div>
        </div>
      </header>

      <search
        className="sticky top-0 z-10 block border-b border-[#e5e2dc] bg-white px-8 py-4 dark:border-[#333] dark:bg-[#242424]"
        aria-label="Filter and sort books"
      >
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
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
              className="box-border w-full rounded-lg border border-[#e0ddd8] bg-[#f8f7f4] py-[0.55rem] pl-9 pr-3 text-[0.85rem] text-[#1a1a1a] outline-none transition-colors focus:border-[#1a1a1a] focus:bg-white dark:border-[#333] dark:bg-[#2e2e2e] dark:text-white dark:focus:border-[#00AB8E] dark:focus:bg-[#2e2e2e]"
              type="search"
              placeholder="Search title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search by title or author"
            />
          </div>

          <label className="flex flex-col gap-[0.2rem]">
            <span className="pl-[0.1rem] text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[#bbb] dark:text-[#888]">
              Genre
            </span>
            <select className={selectClass} style={selectStyle} value={genre} onChange={(e) => setGenre(e.target.value)}>
              <option value="All">All Genres</option>
              {GENRES.filter((g) => g !== 'All').map((g) => (
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

          <label className="ml-1 flex flex-col gap-[0.2rem] border-l border-[#e5e2dc] pl-3 dark:border-[#333]">
            <span className="pl-[0.1rem] text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[#bbb] dark:text-[#888]">
              Sort by
            </span>
            <select className={selectClass} style={selectStyle} value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort books">
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {(activeFilters.length > 0 || search) && (
          <div className="mx-auto mt-3 flex max-w-[1200px] flex-wrap items-center gap-2" role="group" aria-label="Active filters">
            {search && (
              <span className="inline-flex items-center gap-[0.35rem] rounded-full bg-[#1a1a1a] py-[0.3rem] pl-3 pr-[0.6rem] text-[0.75rem] font-medium text-white dark:bg-[#333]">
                "{search}"
                <button
                  className="border-0 bg-transparent p-0 text-base leading-none text-white opacity-70 transition-opacity hover:opacity-100"
                  onClick={() => setSearch('')}
                  aria-label="Remove search filter"
                >
                  x
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
                  x
                </button>
              </span>
            ))}
            <button
              className="cursor-pointer rounded-full border border-[#1a4a3a] bg-transparent px-3 py-[0.3rem] text-[0.75rem] text-[#1a4a3a] transition-all hover:border-[#1a1a1a] hover:text-[#1a1a1a] dark:border-[#00AB8E] dark:text-[#00AB8E] dark:hover:border-white dark:hover:text-white"
              onClick={clearAll}
            >
              Clear all
            </button>
          </div>
        )}
      </search>

      <main className="mx-auto mt-10 max-w-[1200px] px-8">
        {filtered.length === 0 ? (
          <section className="flex flex-col items-center gap-3 px-8 py-24 text-center" aria-label="No results">
            <p className="m-0 text-[1.2rem] font-bold text-[#1a1a1a] dark:text-white">No books found</p>
            <p className="m-0 text-[0.9rem] text-[#999] dark:text-[#888]">Try adjusting your filters or search term.</p>
            <button
              className="mt-2 rounded-lg border-0 bg-[#1a4a3a] px-6 py-[0.65rem] text-[0.85rem] font-semibold text-white transition-colors hover:bg-[#2d7a4f]"
              onClick={clearAll}
            >
              Clear filters
            </button>
            <button
              className="whitespace-nowrap rounded-lg border-0 bg-[#1a4a3a] px-5 py-[0.6rem] text-[0.85rem] font-semibold text-white transition-colors hover:bg-[#2d7a4f]"
              onClick={() => navigate('/books/add')}
            >
              + Add Book
            </button>
          </section>
        ) : (
          <>
            {loading ? (
              <ul className="m-0 grid list-none gap-x-6 gap-y-8 p-0 [grid-template-columns:repeat(auto-fill,minmax(180px,1fr))]" aria-label="Loading books">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <li key={i}>
                    <div className="aspect-[2/3] w-full animate-pulse rounded-[8px] bg-[#ece9e3] dark:bg-[#2e2e2e]" />
                    <div className="mt-[0.6rem] h-3 animate-pulse rounded-[4px] bg-[#ece9e3] dark:bg-[#2e2e2e]" />
                    <div className="mt-[0.4rem] h-[10px] w-[60%] animate-pulse rounded-[4px] bg-[#ece9e3] dark:bg-[#2e2e2e]" />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="m-0 grid list-none gap-x-6 gap-y-8 p-0 [grid-template-columns:repeat(auto-fill,minmax(180px,1fr))]" aria-label={`${filtered.length} books found`}>
                {paginated.map((book) => {
                  const isAvailable = getAvailability(book.id)
                  const bookCampus = getCampus(book.id)

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
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                          <span
                            className={`absolute bottom-[0.6rem] right-[0.6rem] h-[10px] w-[10px] rounded-full border-2 border-white ${isAvailable ? 'bg-[#2d7a4f]' : 'bg-[#c0392b]'}`}
                            aria-hidden="true"
                          />
                          {book.badge && (
                            <span className="absolute left-2 top-2 rounded-[4px] bg-[#1a1a1a] px-[0.45rem] py-[0.2rem] text-[0.62rem] font-bold uppercase tracking-[0.06em] text-white">
                              {book.badge}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-[0.2rem]">
                          <span className="text-[0.68rem] font-bold uppercase tracking-[0.08em]" style={{ color: book.genreColor }}>
                            {book.genre}
                          </span>
                          <h2 className="m-0 line-clamp-2 text-[0.88rem] font-bold leading-[1.3] text-[#1a1a1a] dark:text-white">
                            {book.title}
                          </h2>
                          <p className="m-0 text-[0.78rem] text-[#888] dark:text-[#888]">{book.author}</p>
                          <div className="mt-[0.4rem] flex items-center justify-between gap-2">
                            <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[0.7rem] text-[#aaa] dark:text-[#888]">
                              {bookCampus === 'both' ? 'Beirut / Byblos' : bookCampus}
                            </span>
                            <span className={`whitespace-nowrap text-[0.7rem] font-semibold ${isAvailable ? 'text-[#2d7a4f]' : 'text-[#c0392b]'}`}>
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
              <nav className="mt-12 flex items-center justify-center gap-4" aria-label="Pagination">
                <button
                  className="cursor-pointer rounded-lg border border-[#e0ddd8] bg-white px-5 py-2 text-[0.85rem] font-semibold text-[#333] transition-all hover:enabled:border-[#1a4a3a] hover:enabled:text-[#1a4a3a] disabled:cursor-not-allowed disabled:opacity-35 dark:border-[#333] dark:bg-[#242424] dark:text-[#888] dark:hover:enabled:border-[#00AB8E] dark:hover:enabled:text-[#00AB8E]"
                  onClick={() => {
                    setPage((p) => p - 1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  {'\u2190'} Prev
                </button>
                <span className="min-w-[60px] text-center text-[0.85rem] text-[#888] dark:text-[#888]">
                  {page} / {totalPages}
                </span>
                <button
                  className="cursor-pointer rounded-lg border border-[#e0ddd8] bg-white px-5 py-2 text-[0.85rem] font-semibold text-[#333] transition-all hover:enabled:border-[#1a4a3a] hover:enabled:text-[#1a4a3a] disabled:cursor-not-allowed disabled:opacity-35 dark:border-[#333] dark:bg-[#242424] dark:text-[#888] dark:hover:enabled:border-[#00AB8E] dark:hover:enabled:text-[#00AB8E]"
                  onClick={() => {
                    setPage((p) => p + 1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  Next {'\u2192'}
                </button>
              </nav>
            )}
          </>
        )}
      </main>
    </div>
  )
}
