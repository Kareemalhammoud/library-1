import PropTypes from 'prop-types'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BOOKS, GENRES } from '@/data/bookData'
import { getAvailability, getCallNumber, getCampus, getCopies, getResourceType } from '@/utils/bookUtils'

const ADMIN_EMAIL = 'admin@lau.edu'

const CAMPUS_OPTIONS = ['All Campuses', 'Beirut', 'Byblos']
const LANG_OPTIONS = ['All Languages', 'English', 'French']
const AVAIL_OPTIONS = ['All', 'Available', 'On Loan']
const TYPE_OPTIONS = ['All Types', 'Book', 'E-Book', 'Journal', 'Thesis', 'Reference', 'Conference Paper']
const YEAR_OPTIONS = ['All Years', '2020-Present', '2010-2019', '2000-2009', '1990-1999', 'Before 1990']
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'title-asc', label: 'Title A-Z' },
  { value: 'title-desc', label: 'Title Z-A' },
  { value: 'author-asc', label: 'Author A-Z' },
  { value: 'year-desc', label: 'Newest First' },
  { value: 'year-asc', label: 'Oldest First' },
  { value: 'avail-desc', label: 'Availability' },
]

const fieldLabelClass =
  'text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-[#5a6b62] dark:text-[#8c9691]'
const selectClass =
  'w-full rounded-md border border-[#d0ddd8] bg-[#F2F5F3] px-3 py-2 text-[0.78rem] text-[#1C2B24] outline-none transition focus:border-[#006751] dark:border-[#333333] dark:bg-[#121212] dark:text-[#f5f7f6] dark:focus:border-[#5ecba1]'
const modalInputClass =
  'w-full rounded-md border border-[#d0ddd8] bg-white px-3 py-2 text-[0.82rem] text-[#1C2B24] outline-none transition focus:border-[#006751] focus:ring-2 focus:ring-[#006751]/10 dark:border-[#333333] dark:bg-[#121212] dark:text-[#f5f7f6] dark:focus:border-[#5ecba1] dark:focus:ring-[#5ecba1]/20'

function isAdmin() {
  try {
    const u = JSON.parse(localStorage.getItem('user'))
    return u?.email === ADMIN_EMAIL
  } catch {
    return false
  }
}

function tagClass(type) {
  const base =
    'inline-flex items-center rounded-[3px] px-2 py-[0.15rem] text-[0.56rem] font-semibold uppercase tracking-[0.05em]'

  if (type === 'resource') {
    return `${base} bg-[#edf4f0] text-[#006751] dark:bg-[#242424] dark:text-[#5ecba1]`
  }
  if (type === 'subject') {
    return `${base} bg-[#EDF3F0] text-[#006751] dark:bg-[#1f1f1f] dark:text-[#5ecba1]`
  }
  if (type === 'available') {
    return `${base} bg-[#e6f4ec] text-[#006751] dark:bg-[#143c2f] dark:text-[#5ecba1]`
  }
  return `${base} bg-[#fdf0ee] text-[#b5392b] dark:bg-[#3b1c1a] dark:text-[#ff9388]`
}

export default function Catalog() {
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('All')
  const [language, setLanguage] = useState('All Languages')
  const [campus, setCampus] = useState('All Campuses')
  const [avail, setAvail] = useState('All')
  const [resType, setResType] = useState('All Types')
  const [yearRange, setYearRange] = useState('All Years')
  const [sort, setSort] = useState('relevance')
  const [view, setView] = useState('grid')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [advTitle, setAdvTitle] = useState('')
  const [advAuthor, setAdvAuthor] = useState('')
  const [advSubject, setAdvSubject] = useState('')
  const [advFormat, setAdvFormat] = useState('All')
  const [advYear, setAdvYear] = useState('')
  const [editingBook, setEditingBook] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const admin = isAdmin()

  const EMPTY_BOOK = {
    title: '',
    author: '',
    genre: GENRES[0] || '',
    language: 'EN',
    year: new Date().getFullYear(),
    rating: 0,
    pages: 0,
    publisher: '',
    isbn: '',
    description: '',
    cover: '',
  }

  function handleSaveBook(bookData) {
    if (editingBook) {
      const idx = BOOKS.findIndex((b) => b.id === editingBook.id)
      if (idx !== -1) Object.assign(BOOKS[idx], bookData)
    } else {
      const maxId = BOOKS.reduce((max, b) => Math.max(max, b.id), 0)
      BOOKS.push({ ...bookData, id: maxId + 1, color: 'sage', genreColor: '#555', badge: 'New' })
    }
    setEditingBook(null)
    setShowAddModal(false)
    setSearch((s) => s + ' ')
    setTimeout(() => setSearch((s) => s.trimEnd()), 0)
  }

  const filtered = useMemo(() => {
    const results = BOOKS.filter((book) => {
      const bookCampus = getCampus(book.id)
      const bookLang = book.language === 'FR' ? 'French' : 'English'
      const bookAvail = getAvailability(book.id)
      const bookType = getResourceType(book.id)

      if (search) {
        const q = search.toLowerCase()
        if (
          !book.title.toLowerCase().includes(q) &&
          !book.author.toLowerCase().includes(q) &&
          !book.isbn.toLowerCase().includes(q) &&
          !book.genre.toLowerCase().includes(q) &&
          !book.publisher.toLowerCase().includes(q)
        ) {
          return false
        }
      }
      if (advTitle && !book.title.toLowerCase().includes(advTitle.toLowerCase())) return false
      if (advAuthor && !book.author.toLowerCase().includes(advAuthor.toLowerCase())) return false
      if (advSubject && !book.genre.toLowerCase().includes(advSubject.toLowerCase())) return false
      if (advFormat !== 'All') {
        const lang = advFormat === 'French' ? 'FR' : 'EN'
        if (book.language !== lang) return false
      }
      if (advYear && book.year !== Number(advYear)) return false
      if (genre !== 'All' && book.genre !== genre) return false
      if (language !== 'All Languages' && bookLang !== language) return false
      if (campus !== 'All Campuses' && bookCampus !== 'both' && bookCampus !== campus) return false
      if (resType !== 'All Types' && bookType !== resType) return false
      if (avail === 'Available' && !bookAvail) return false
      if (avail === 'On Loan' && bookAvail) return false
      if (yearRange !== 'All Years') {
        const y = book.year
        if (yearRange === '2020-Present' && y < 2020) return false
        if (yearRange === '2010-2019' && (y < 2010 || y > 2019)) return false
        if (yearRange === '2000-2009' && (y < 2000 || y > 2009)) return false
        if (yearRange === '1990-1999' && (y < 1990 || y > 1999)) return false
        if (yearRange === 'Before 1990' && y >= 1990) return false
      }
      return true
    })

    if (sort !== 'relevance') {
      const [field, dir] = sort.split('-')
      results.sort((a, b) => {
        let cmp = 0
        if (field === 'title') cmp = a.title.localeCompare(b.title)
        if (field === 'author') cmp = a.author.localeCompare(b.author)
        if (field === 'year') cmp = a.year - b.year
        if (field === 'avail') {
          const aa = getAvailability(a.id) ? 1 : 0
          const bb = getAvailability(b.id) ? 1 : 0
          cmp = aa - bb
        }
        return dir === 'desc' ? -cmp : cmp
      })
    }

    return results
  }, [search, genre, language, campus, avail, resType, yearRange, sort, advTitle, advAuthor, advSubject, advFormat, advYear])

  const activeCount = [genre !== 'All', language !== 'All Languages', campus !== 'All Campuses', avail !== 'All', resType !== 'All Types', yearRange !== 'All Years'].filter(Boolean).length
  const hasSearched = search || activeCount > 0 || advTitle || advAuthor || advSubject || advFormat !== 'All' || advYear

  function clearAll() {
    setGenre('All')
    setLanguage('All Languages')
    setCampus('All Campuses')
    setAvail('All')
    setResType('All Types')
    setYearRange('All Years')
    setSearch('')
    setSort('relevance')
    setAdvTitle('')
    setAdvAuthor('')
    setAdvSubject('')
    setAdvFormat('All')
    setAdvYear('')
  }

  return (
    <div className="min-h-screen bg-[#F2F5F3] dark:bg-[#121212]">
      <section className="bg-[linear-gradient(165deg,#0A2E22_0%,#061C14_100%)] px-5 py-10 text-center sm:px-6 md:px-8 md:py-14">
        <p className="mb-[0.65rem] text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-white/45">Riyad Nassar Library</p>
        <h1 className="mb-[0.55rem] text-[clamp(1.8rem,4vw,2.4rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-white">Library Catalog</h1>
        <p className="mx-auto mb-8 max-w-[500px] text-[0.88rem] leading-[1.6] text-white/60">
          Search books, journals, theses, and academic resources across the Beirut and Byblos collections.
        </p>
        <div className="mx-auto max-w-[600px]">
          <div className="group relative">
            <svg className="pointer-events-none absolute left-[1.1rem] top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#1a6644] transition" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
              <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              className="w-full rounded-[10px] border border-[#1a6644]/55 bg-white px-12 py-[0.85rem] text-[0.88rem] text-[#1C2B24] shadow-[0_2px_12px_rgba(28,43,36,0.12),0_1px_3px_rgba(28,43,36,0.06)] outline-none transition focus:border-[#1a6644] focus:ring-2 focus:ring-[#1a6644]/20"
              type="text"
              placeholder="Search by title, author, subject, ISBN, or keyword"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search the catalog"
            />
            {search && (
              <button
                className="absolute right-[0.65rem] top-1/2 -translate-y-1/2 px-2 py-1 text-[1.15rem] leading-none text-[#1a6644] transition hover:text-[#14533a]"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                type="button"
              >
                x
              </button>
            )}
          </div>
          <button className="mt-[0.85rem] inline-flex items-center gap-1 text-[0.72rem] font-medium tracking-[0.02em] text-white/50 transition hover:text-white/80" onClick={() => setShowAdvanced((v) => !v)}>
            {showAdvanced ? 'Hide advanced search' : 'Advanced search'}
            <svg className={`h-[14px] w-[14px] transition ${showAdvanced ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {showAdvanced && (
            <div className="mx-auto mt-[1.15rem] max-w-[600px] rounded-[10px] border border-white/10 bg-white/10 p-5 text-left backdrop-blur-[10px]">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-white/45">Title</span>
                  <input className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-[0.8rem] text-white outline-none transition placeholder:text-white/30 focus:border-white/35 focus:bg-white/15" type="text" placeholder="e.g. The Great Gatsby" value={advTitle} onChange={(e) => setAdvTitle(e.target.value)} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-white/45">Author</span>
                  <input className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-[0.8rem] text-white outline-none transition placeholder:text-white/30 focus:border-white/35 focus:bg-white/15" type="text" placeholder="e.g. Khalil Gibran" value={advAuthor} onChange={(e) => setAdvAuthor(e.target.value)} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-white/45">Subject</span>
                  <input className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-[0.8rem] text-white outline-none transition placeholder:text-white/30 focus:border-white/35 focus:bg-white/15" type="text" placeholder="e.g. Philosophy" value={advSubject} onChange={(e) => setAdvSubject(e.target.value)} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-white/45">Language</span>
                  <select className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-[0.8rem] text-white outline-none transition focus:border-white/35" value={advFormat} onChange={(e) => setAdvFormat(e.target.value)}>
                    <option value="All" className="text-[#1C2B24]">All Languages</option>
                    <option value="English" className="text-[#1C2B24]">English</option>
                    <option value="French" className="text-[#1C2B24]">French</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 md:col-span-2">
                  <span className="text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-white/45">Year</span>
                  <input className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-[0.8rem] text-white outline-none transition placeholder:text-white/30 focus:border-white/35 focus:bg-white/15" type="number" placeholder="e.g. 1925" value={advYear} onChange={(e) => setAdvYear(e.target.value)} />
                </label>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="sticky top-0 z-10 border-b border-[#d0ddd8] bg-white px-5 py-4 shadow-[0_1px_3px_rgba(28,43,36,0.04)] dark:border-[#2a2a2a] dark:bg-[#121212]">
        <div className="mx-auto flex max-w-[var(--container-max)] flex-col gap-3">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {[
              { label: 'Availability', value: avail, setValue: setAvail, options: AVAIL_OPTIONS },
              { label: 'Resource Type', value: resType, setValue: setResType, options: TYPE_OPTIONS },
              { label: 'Language', value: language, setValue: setLanguage, options: LANG_OPTIONS },
              { label: 'Subject', value: genre, setValue: setGenre, options: ['All Subjects', ...GENRES.filter((g) => g !== 'All')], mapValue: (option) => (option === 'All Subjects' ? 'All' : option) },
              { label: 'Campus', value: campus, setValue: setCampus, options: CAMPUS_OPTIONS },
              { label: 'Year', value: yearRange, setValue: setYearRange, options: YEAR_OPTIONS },
            ].map((filter) => (
              <label key={filter.label} className="flex min-w-0 flex-col gap-1">
                <span className={fieldLabelClass}>{filter.label}</span>
                <select className={selectClass} value={filter.value} onChange={(e) => filter.setValue(filter.mapValue ? filter.mapValue(e.target.value) : e.target.value)} aria-label={`Filter by ${filter.label.toLowerCase()}`}>
                  {filter.options.map((option) => {
                    const optionValue = filter.mapValue ? filter.mapValue(option) : option
                    return <option key={option} value={optionValue}>{option}</option>
                  })}
                </select>
              </label>
            ))}
          </div>
          {activeCount > 0 && (
            <div className="border-t border-[#EDF3F0] pt-2 dark:border-[#333333]">
              <button className="rounded-full border border-[#1a6644] px-3 py-1 text-[0.7rem] font-semibold text-[#1a6644] transition hover:bg-[#1a6644] hover:text-white dark:border-[#1a6644] dark:text-[#1a6644] dark:hover:bg-[#1a6644] dark:hover:text-white" onClick={clearAll}>
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      <main className="mx-auto max-w-[var(--container-max)] px-5 pb-16 pt-7 sm:px-6 md:px-8">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-[0.82rem] text-[#5a6b62] dark:text-[#8c9691]">
            <strong className="text-[#1C2B24] dark:text-[#f5f7f6]">{filtered.length}</strong> {filtered.length === 1 ? 'record' : 'records'} found
            {admin && <button className="ml-3 rounded-md bg-[#1a6644] px-3 py-[0.3rem] text-[0.7rem] font-semibold text-white transition hover:bg-[#14533a] dark:bg-[#1a6644] dark:text-white dark:hover:bg-[#14533a]" onClick={() => { setEditingBook(null); setShowAddModal(true) }}>+ Add Book</button>}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-[0.72rem] text-[#5a6b62] dark:text-[#8c9691]" htmlFor="sort-select">Sort by</label>
            <select id="sort-select" className="rounded-md border border-[#d0ddd8] bg-white px-3 py-[0.38rem] text-[0.75rem] text-[#1C2B24] outline-none transition focus:border-[#006751] dark:border-[#2a2a2a] dark:bg-[#121212] dark:text-[#f5f7f6] dark:focus:border-[#5ecba1]" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <div className="flex overflow-hidden rounded-md border border-[#d0ddd8] bg-[#F2F5F3] dark:border-[#2a2a2a] dark:bg-[#121212]" role="group" aria-label="View mode">
              {['grid', 'list'].map((mode) => (
                <button key={mode} className={`flex items-center justify-center px-3 py-2 transition ${view === mode ? 'bg-[#1a6644] text-white dark:bg-[#1a6644] dark:text-white' : 'bg-[#F2F5F3] text-[#5a6b62] dark:bg-[#121212] dark:text-[#8c9691]'}`} onClick={() => setView(mode)} aria-label={`${mode === 'grid' ? 'Grid' : 'List'} view`} aria-pressed={view === mode}>
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                    {mode === 'grid' ? <><rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" /><rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" /></> : <><rect x="1" y="1" width="14" height="3" rx="1" /><rect x="1" y="6.5" width="14" height="3" rx="1" /><rect x="1" y="12" width="14" height="3" rx="1" /></>}
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>

        {!hasSearched && (
          <section className="mb-6 rounded-[10px] border border-[#d0ddd8] bg-white p-5 dark:border-[#2a2a2a] dark:bg-[#121212]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <svg className="h-9 w-9 shrink-0 text-[#006751]/30 dark:text-[#5ecba1]/45" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <rect x="6" y="4" width="28" height="38" rx="3" stroke="currentColor" strokeWidth="2" />
                <rect x="14" y="10" width="28" height="38" rx="3" stroke="currentColor" strokeWidth="2" fill="#f0f8f5" />
                <path d="M20 22h16M20 28h12M20 34h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[0.84rem] font-bold tracking-[-0.01em] text-[#1C2B24] dark:text-[#f5f7f6]">Browsing the full collection</p>
                <p className="mb-3 text-[0.78rem] leading-[1.55] text-[#5a6b62] dark:text-[#8c9691]">You are viewing all holdings across the Beirut and Byblos campuses. Use the search bar or filters to refine your results.</p>
                <div className="flex flex-wrap gap-2">
                  {[{ label: 'Philosophy', onClick: () => setSearch('philosophy') }, { label: 'Khalil Gibran', onClick: () => setSearch('gibran') }, { label: 'Journals', onClick: () => setResType('Journal') }, { label: 'Theses', onClick: () => setResType('Thesis') }, { label: 'French Collection', onClick: () => setLanguage('French') }].map((hint) => (
                    <button key={hint.label} className="rounded-full border border-[#d0ddd8] bg-white px-3 py-1 text-[0.72rem] font-medium text-[#5a6b62] transition hover:border-[#006751] hover:bg-[#EDF3F0] hover:text-[#006751] dark:border-[#2a2a2a] dark:bg-[#121212] dark:text-[#8c9691] dark:hover:border-[#5ecba1] dark:hover:bg-[#181818] dark:hover:text-[#5ecba1]" onClick={hint.onClick}>
                      {hint.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
        {filtered.length === 0 ? (
          <section className="mx-auto flex max-w-[440px] flex-col items-center gap-2 px-4 py-16 text-center">
            <svg className="mb-1 h-12 w-12 text-[#ccc] dark:text-[#66706b]" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <circle cx="22" cy="22" r="14" stroke="currentColor" strokeWidth="2.5" />
              <path d="M33 33l9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M16 22h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <h2 className="text-[1.1rem] font-bold tracking-[-0.01em] text-[#1C2B24] dark:text-[#f5f7f6]">No results found</h2>
            <p className="text-[0.84rem] leading-[1.6] text-[#5a6b62] dark:text-[#8c9691]">We couldn&apos;t find anything matching your search. Here are a few suggestions:</p>
            <ul className="mt-2 space-y-2 text-left">
              {['Check the spelling of your search terms', 'Try broader keywords or alternative subject headings', 'Remove one or more filters to widen your search', 'Use the advanced search to query by title, author, or subject separately'].map((tip) => (
                <li key={tip} className="relative pl-4 text-[0.78rem] text-[#5a6b62] before:absolute before:left-0 before:top-[0.45rem] before:h-1 before:w-1 before:rounded-full before:bg-[#d0ddd8] dark:text-[#8c9691] dark:before:bg-[#333333]">
                  {tip}
                </li>
              ))}
            </ul>
            <button className="mt-3 rounded-md bg-[#1a6644] px-5 py-2 text-[0.8rem] font-semibold text-white shadow-[0_1px_3px_rgba(26,102,68,0.3)] transition hover:bg-[#14533a] dark:bg-[#1a6644] dark:text-white dark:hover:bg-[#14533a]" onClick={clearAll}>
              Clear all and start over
            </button>
          </section>
        ) : view === 'grid' ? (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-x-4 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
            {filtered.map((book) => {
              const bookAvail = getAvailability(book.id)
              const bookCampus = getCampus(book.id)
              const bookType = getResourceType(book.id)
              return (
                <li key={book.id} className="flex flex-col gap-2">
                  <div className="group relative aspect-[2/3] cursor-pointer overflow-hidden rounded-[3px_7px_7px_3px] bg-[#e5e2dc] shadow-[-2px_0_4px_rgba(28,43,36,0.14),0_2px_0_rgba(28,43,36,0.06),0_4px_14px_rgba(28,43,36,0.12)] transition duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[-4px_0_10px_rgba(28,43,36,0.18),0_2px_0_rgba(28,43,36,0.08),0_12px_28px_rgba(28,43,36,0.16)] dark:bg-[#121212]" onClick={() => navigate(`/books/${book.id}`)} role="link" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/books/${book.id}`) }}>
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.03)_40%,transparent_65%)]" />
                    <img src={book.cover} alt={`Cover of ${book.title}`} className="h-full w-full object-cover" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                  </div>
                  <div className="flex flex-col gap-1 pt-1">
                    <h2 className="line-clamp-2 text-[0.82rem] font-bold leading-[1.3] tracking-[-0.01em] text-[#1C2B24] dark:text-[#f5f7f6]">
                      <a href={`/books/${book.id}`} className="transition hover:text-[#006751] dark:hover:text-[#5ecba1]" onClick={(e) => { e.preventDefault(); navigate(`/books/${book.id}`) }}>
                        {book.title}
                      </a>
                    </h2>
                    <p className="text-[0.72rem] text-[#5a6b62] dark:text-[#8c9691]">{book.author}</p>
                    <p className="text-[0.64rem] tracking-[0.01em] text-[rgba(28,43,36,0.38)] dark:text-[#66706b]">{book.year > 0 ? book.year : `${Math.abs(book.year)} BCE`} - {bookCampus === 'both' ? 'Beirut & Byblos' : bookCampus}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <span className={tagClass('resource')}>{bookType}</span>
                      <span className={tagClass(bookAvail ? 'available' : 'on-loan')}>{bookAvail ? 'Available' : 'On Loan'}</span>
                    </div>
                    {admin && <div className="mt-2 border-t border-[#EDF3F0] pt-2 dark:border-[#333333]"><button className="text-[0.66rem] font-semibold text-[#006751] transition hover:text-[#005040] dark:text-[#5ecba1] dark:hover:text-white" onClick={() => setEditingBook(book)}>Edit</button></div>}
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <ul className="overflow-hidden rounded-[10px] bg-[#d0ddd8] dark:bg-[#121212]">
            {filtered.map((book, index) => {
              const bookAvail = getAvailability(book.id)
              const { total, available } = getCopies(book.id)
              const bookCampus = getCampus(book.id)
              const bookType = getResourceType(book.id)
              const callNum = getCallNumber(book)
              return (
                <li key={book.id} className={`flex gap-4 bg-white px-4 py-4 transition hover:bg-[rgba(237,243,240,0.45)] dark:bg-[#121212] dark:hover:bg-[#181818] ${index !== 0 ? 'border-t border-[#d0ddd8] dark:border-[#1f1f1f]' : ''}`}>
                  <img src={book.cover} alt={`Cover of ${book.title}`} className="h-[68px] w-[46px] shrink-0 rounded-[2px_4px_4px_2px] object-cover shadow-[-1px_0_3px_rgba(28,43,36,0.12),0_2px_6px_rgba(28,43,36,0.08)]" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                  <div className="min-w-0 flex-1">
                    <h2 className="text-[0.88rem] font-bold leading-[1.3] tracking-[-0.01em] text-[#1C2B24] dark:text-[#f5f7f6]">
                      <a href={`/books/${book.id}`} className="transition hover:text-[#006751] dark:hover:text-[#5ecba1]" onClick={(e) => { e.preventDefault(); navigate(`/books/${book.id}`) }}>
                        {book.title}
                      </a>
                    </h2>
                    <p className="text-[0.78rem] text-[#5a6b62] dark:text-[#8c9691]">{book.author}</p>
                    <p className="truncate text-[0.7rem] tracking-[0.005em] text-[rgba(28,43,36,0.38)] dark:text-[#66706b]">{book.publisher}, {book.year > 0 ? book.year : `${Math.abs(book.year)} BCE`} - {book.pages} pp. - ISBN {book.isbn}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className={tagClass('resource')}>{bookType}</span>
                      <span className={tagClass('subject')}>{book.genre}</span>
                      <span className={tagClass(bookAvail ? 'available' : 'on-loan')}>{bookAvail ? 'Available' : 'On Loan'}</span>
                    </div>
                    {admin && <div className="mt-2 border-t border-[#EDF3F0] pt-2 dark:border-[#333333]"><button className="text-[0.66rem] font-semibold text-[#006751] transition hover:text-[#005040] dark:text-[#5ecba1] dark:hover:text-white" onClick={() => setEditingBook(book)}>Edit</button></div>}
                  </div>
                  <div className="hidden shrink-0 flex-col items-end gap-1 pt-1 text-right md:flex">
                    <span className="rounded border border-transparent bg-[#EDF3F0] px-2 py-1 font-mono text-[0.64rem] tracking-[0.02em] text-[rgba(28,43,36,0.52)] dark:border-[#1f1f1f] dark:bg-[#121212] dark:text-[#8c9691]">{callNum}</span>
                    <span className="text-[0.68rem] text-[#5a6b62] dark:text-[#8c9691]">{bookCampus === 'both' ? 'Beirut & Byblos' : bookCampus}</span>
                    <span className="text-[0.64rem] text-[rgba(28,43,36,0.38)] dark:text-[#66706b]">{available} of {total} available</span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </main>

      {(showAddModal || editingBook) && admin && (
        <AdminBookModal book={editingBook || EMPTY_BOOK} isNew={!editingBook} onSave={handleSaveBook} onClose={() => { setEditingBook(null); setShowAddModal(false) }} />
      )}
    </div>
  )
}

function AdminBookModal({ book, isNew, onSave, onClose }) {
  const [form, setForm] = useState({
    title: book.title || '',
    author: book.author || '',
    genre: book.genre || '',
    language: book.language || 'EN',
    year: book.year || new Date().getFullYear(),
    rating: book.rating || 0,
    pages: book.pages || 0,
    publisher: book.publisher || '',
    isbn: book.isbn || '',
    description: book.description || '',
    cover: book.cover || '',
  })

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))
  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...form, year: Number(form.year), pages: Number(form.pages), rating: Number(form.rating) })
  }

  const fields = [
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'author', label: 'Author', type: 'text', required: true },
    { key: 'genre', label: 'Genre / Subject', type: 'text' },
    { key: 'publisher', label: 'Publisher', type: 'text' },
    { key: 'isbn', label: 'ISBN', type: 'text' },
    { key: 'cover', label: 'Cover Image URL', type: 'text' },
    { key: 'year', label: 'Year', type: 'number' },
    { key: 'pages', label: 'Pages', type: 'number' },
    { key: 'rating', label: 'Rating (0-5)', type: 'number' },
  ]

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 p-6" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-[620px] overflow-y-auto rounded-[14px] bg-white p-8 shadow-[0_24px_60px_rgba(0,0,0,0.22)] dark:bg-[#1f1f1f]" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-5 text-[1.15rem] font-bold text-[#1a1a1a] dark:text-[#f5f7f6]">{isNew ? 'Add New Book' : 'Edit Book'}</h2>
        <form onSubmit={handleSubmit} className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
          {fields.map((field) => (
            <label key={field.key} className="flex flex-col gap-1">
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.06em] text-[#888] dark:text-[#8c9691]">{field.label}</span>
              <input type={field.type} className={modalInputClass} value={form[field.key]} onChange={(e) => set(field.key, e.target.value)} required={field.required} />
            </label>
          ))}
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.06em] text-[#888] dark:text-[#8c9691]">Language</span>
            <select className={modalInputClass} value={form.language} onChange={(e) => set('language', e.target.value)}>
              <option value="EN">English</option>
              <option value="FR">French</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.06em] text-[#888] dark:text-[#8c9691]">Description</span>
            <textarea className={`${modalInputClass} min-h-20 resize-y`} value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} />
          </label>
          <div className="mt-2 flex justify-end gap-2 border-t border-[#eee] pt-4 sm:col-span-2 dark:border-[#333333]">
            <button type="button" className="rounded-md border border-[#ddd] bg-[#f5f5f5] px-4 py-2 text-[0.8rem] font-medium text-[#555] transition hover:bg-[#eee] dark:border-[#333333] dark:bg-[#121212] dark:text-[#8c9691] dark:hover:bg-[#242424]" onClick={onClose}>Cancel</button>
            <button type="submit" className="rounded-md bg-[#1a6644] px-5 py-2 text-[0.8rem] font-semibold text-white transition hover:bg-[#14533a] dark:bg-[#1a6644] dark:text-white dark:hover:bg-[#14533a]">{isNew ? 'Add Book' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

AdminBookModal.propTypes = {
  book: PropTypes.shape({
    title: PropTypes.string,
    author: PropTypes.string,
    genre: PropTypes.string,
    language: PropTypes.string,
    year: PropTypes.number,
    rating: PropTypes.number,
    pages: PropTypes.number,
    publisher: PropTypes.string,
    isbn: PropTypes.string,
    description: PropTypes.string,
    cover: PropTypes.string,
  }).isRequired,
  isNew: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}
