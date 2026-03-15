import styles from './Catalog.module.css'
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BOOKS, GENRES } from '@/data/bookData'
import { getCampus, getAvailability, getCopies, getResourceType, getCallNumber } from '@/utils/bookUtils'

const CAMPUS_OPTIONS   = ['All Campuses', 'Beirut', 'Byblos']
const LANG_OPTIONS     = ['All Languages', 'English', 'French']
const AVAIL_OPTIONS    = ['All', 'Available', 'On Loan']
const TYPE_OPTIONS     = ['All Types', 'Book', 'E-Book', 'Journal', 'Thesis', 'Reference', 'Conference Paper']
const YEAR_OPTIONS     = ['All Years', '2020–Present', '2010–2019', '2000–2009', '1990–1999', 'Before 1990']
const SORT_OPTIONS     = [
  { value: 'relevance',    label: 'Relevance' },
  { value: 'title-asc',    label: 'Title A–Z' },
  { value: 'title-desc',   label: 'Title Z–A' },
  { value: 'author-asc',   label: 'Author A–Z' },
  { value: 'year-desc',    label: 'Newest First' },
  { value: 'year-asc',     label: 'Oldest First' },
  { value: 'avail-desc',   label: 'Availability' },
]

export default function Catalog() {
  const navigate = useNavigate()

  const [search,   setSearch]   = useState('')
  const [genre,    setGenre]    = useState('All')
  const [language, setLanguage] = useState('All Languages')
  const [campus,   setCampus]   = useState('All Campuses')
  const [avail,    setAvail]    = useState('All')
  const [resType,  setResType]  = useState('All Types')
  const [yearRange, setYearRange] = useState('All Years')
  const [sort,     setSort]     = useState('relevance')
  const [view,     setView]     = useState('grid')

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [advTitle,  setAdvTitle]  = useState('')
  const [advAuthor, setAdvAuthor] = useState('')
  const [advSubject, setAdvSubject] = useState('')
  const [advFormat, setAdvFormat] = useState('All')
  const [advYear,   setAdvYear]   = useState('')


  const filtered = useMemo(() => {
    const results = BOOKS.filter(book => {
      const bookCampus = getCampus(book.id)
      const bookLang   = book.language === 'FR' ? 'French' : 'English'
      const bookAvail  = getAvailability(book.id)
      const bookType   = getResourceType(book.id)

      if (search) {
        const q = search.toLowerCase()
        if (!book.title.toLowerCase().includes(q) &&
            !book.author.toLowerCase().includes(q) &&
            !book.isbn.toLowerCase().includes(q) &&
            !book.genre.toLowerCase().includes(q) &&
            !book.publisher.toLowerCase().includes(q)) return false
      }
      if (advTitle && !book.title.toLowerCase().includes(advTitle.toLowerCase()))   return false
      if (advAuthor && !book.author.toLowerCase().includes(advAuthor.toLowerCase())) return false
      if (advSubject && !book.genre.toLowerCase().includes(advSubject.toLowerCase())) return false
      if (advFormat !== 'All') {
        const lang = advFormat === 'French' ? 'FR' : 'EN'
        if (book.language !== lang) return false
      }
      if (advYear && book.year !== Number(advYear)) return false
      if (genre    !== 'All'           && book.genre !== genre)                           return false
      if (language !== 'All Languages' && bookLang   !== language)                        return false
      if (campus   !== 'All Campuses'  && bookCampus !== 'both' && bookCampus !== campus) return false
      if (resType  !== 'All Types'     && bookType   !== resType)                         return false
      if (avail === 'Available' && !bookAvail) return false
      if (avail === 'On Loan'   &&  bookAvail) return false
      if (yearRange !== 'All Years') {
        const y = book.year
        if (yearRange === '2020–Present' && y < 2020)            return false
        if (yearRange === '2010–2019'    && (y < 2010 || y > 2019)) return false
        if (yearRange === '2000–2009'    && (y < 2000 || y > 2009)) return false
        if (yearRange === '1990–1999'    && (y < 1990 || y > 1999)) return false
        if (yearRange === 'Before 1990'  && y >= 1990)           return false
      }
      return true
    })

    if (sort !== 'relevance') {
      const [field, dir] = sort.split('-')
      results.sort((a, b) => {
        let cmp = 0
        if (field === 'title')  cmp = a.title.localeCompare(b.title)
        if (field === 'author') cmp = a.author.localeCompare(b.author)
        if (field === 'year')   cmp = a.year - b.year
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

  const activeCount = [
    genre !== 'All',
    language !== 'All Languages',
    campus !== 'All Campuses',
    avail !== 'All',
    resType !== 'All Types',
    yearRange !== 'All Years',
  ].filter(Boolean).length

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
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <p className={styles.heroEyebrow}>Riyad Nassar Library</p>
        <h1 className={styles.heroTitle}>Library Catalog</h1>
        <p className={styles.heroSub}>
          Search books, journals, theses, and academic resources across the Beirut and Byblos collections.
        </p>

        <div className={styles.heroSearch}>
          <svg className={styles.heroSearchIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6"/>
            <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          <input
            className={styles.heroSearchInput}
            type="search"
            placeholder="Search by title, author, subject, ISBN, or keyword"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search the catalog"
          />
          {search && (
            <button
              className={styles.heroSearchClear}
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >×</button>
          )}
        </div>

        <button
          className={styles.advancedToggle}
          onClick={() => setShowAdvanced(v => !v)}
        >
          {showAdvanced ? 'Hide advanced search' : 'Advanced search'}
          <svg
            className={`${styles.advancedChevron} ${showAdvanced ? styles.advancedChevronOpen : ''}`}
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {showAdvanced && (
          <div className={styles.advancedPanel}>
            <div className={styles.advancedGrid}>
              <div className={styles.advancedField}>
                <label className={styles.advancedLabel} htmlFor="adv-title">Title</label>
                <input
                  id="adv-title"
                  className={styles.advancedInput}
                  type="text"
                  placeholder="e.g. The Great Gatsby"
                  value={advTitle}
                  onChange={e => setAdvTitle(e.target.value)}
                />
              </div>
              <div className={styles.advancedField}>
                <label className={styles.advancedLabel} htmlFor="adv-author">Author</label>
                <input
                  id="adv-author"
                  className={styles.advancedInput}
                  type="text"
                  placeholder="e.g. Khalil Gibran"
                  value={advAuthor}
                  onChange={e => setAdvAuthor(e.target.value)}
                />
              </div>
              <div className={styles.advancedField}>
                <label className={styles.advancedLabel} htmlFor="adv-subject">Subject</label>
                <input
                  id="adv-subject"
                  className={styles.advancedInput}
                  type="text"
                  placeholder="e.g. Philosophy"
                  value={advSubject}
                  onChange={e => setAdvSubject(e.target.value)}
                />
              </div>
              <div className={styles.advancedField}>
                <label className={styles.advancedLabel} htmlFor="adv-format">Language</label>
                <select
                  id="adv-format"
                  className={styles.advancedSelect}
                  value={advFormat}
                  onChange={e => setAdvFormat(e.target.value)}
                >
                  <option value="All">All Languages</option>
                  <option value="English">English</option>
                  <option value="French">French</option>
                </select>
              </div>
              <div className={styles.advancedField}>
                <label className={styles.advancedLabel} htmlFor="adv-year">Year</label>
                <input
                  id="adv-year"
                  className={styles.advancedInput}
                  type="number"
                  placeholder="e.g. 1925"
                  value={advYear}
                  onChange={e => setAdvYear(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Filter Bar ── */}
      <div className={styles.filterBar}>
        <div className={styles.filterBarInner}>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Availability</span>
              <select
                className={styles.select}
                value={avail}
                onChange={e => setAvail(e.target.value)}
                aria-label="Filter by availability"
              >
                {AVAIL_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Resource Type</span>
              <select
                className={styles.select}
                value={resType}
                onChange={e => setResType(e.target.value)}
                aria-label="Filter by resource type"
              >
                {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Language</span>
              <select
                className={styles.select}
                value={language}
                onChange={e => setLanguage(e.target.value)}
                aria-label="Filter by language"
              >
                {LANG_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Subject</span>
              <select
                className={styles.select}
                value={genre}
                onChange={e => setGenre(e.target.value)}
                aria-label="Filter by subject"
              >
                <option value="All">All Subjects</option>
                {GENRES.filter(g => g !== 'All').map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Campus</span>
              <select
                className={styles.select}
                value={campus}
                onChange={e => setCampus(e.target.value)}
                aria-label="Filter by campus"
              >
                {CAMPUS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Year</span>
              <select
                className={styles.select}
                value={yearRange}
                onChange={e => setYearRange(e.target.value)}
                aria-label="Filter by publication year"
              >
                {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {activeCount > 0 && (
            <div className={styles.filterBarClear}>
              <button className={styles.clearBtn} onClick={clearAll}>
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      <main className={styles.main}>
        <div className={styles.resultsHeader}>
          <span className={styles.resultCount} aria-live="polite">
            <strong>{filtered.length}</strong> {filtered.length === 1 ? 'record' : 'records'} found
          </span>

          <div className={styles.resultsControls}>
            <label className={styles.sortLabel} htmlFor="sort-select">Sort by</label>
            <select
              id="sort-select"
              className={styles.sortSelect}
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <div className={styles.viewToggle} role="group" aria-label="View mode">
              <button
                className={`${styles.viewBtn} ${view === 'grid' ? styles.viewBtnActive : ''}`}
                onClick={() => setView('grid')}
                aria-label="Grid view"
                aria-pressed={view === 'grid'}
              >
                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                  <rect x="1" y="1" width="6" height="6" rx="1"/>
                  <rect x="9" y="1" width="6" height="6" rx="1"/>
                  <rect x="1" y="9" width="6" height="6" rx="1"/>
                  <rect x="9" y="9" width="6" height="6" rx="1"/>
                </svg>
              </button>
              <button
                className={`${styles.viewBtn} ${view === 'list' ? styles.viewBtnActive : ''}`}
                onClick={() => setView('list')}
                aria-label="List view"
                aria-pressed={view === 'list'}
              >
                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                  <rect x="1" y="1" width="14" height="3" rx="1"/>
                  <rect x="1" y="6.5" width="14" height="3" rx="1"/>
                  <rect x="1" y="12" width="14" height="3" rx="1"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {!hasSearched && (
          <section className={styles.welcome}>
            <div className={styles.welcomeInner}>
              <svg className={styles.welcomeIcon} viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <rect x="6" y="4" width="28" height="38" rx="3" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="10" width="28" height="38" rx="3" stroke="currentColor" strokeWidth="2" fill="#f0f8f5"/>
                <path d="M20 22h16M20 28h12M20 34h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div className={styles.welcomeText}>
                <p className={styles.welcomeTitle}>Browsing the full collection</p>
                <p className={styles.welcomeBody}>
                  You are viewing all holdings across the Beirut and Byblos campuses. Use the search bar or filters to refine your results.
                </p>
                <div className={styles.welcomeHints}>
                  <button className={styles.emptyHint} onClick={() => setSearch('philosophy')}>Philosophy</button>
                  <button className={styles.emptyHint} onClick={() => setSearch('gibran')}>Khalil Gibran</button>
                  <button className={styles.emptyHint} onClick={() => setResType('Journal')}>Journals</button>
                  <button className={styles.emptyHint} onClick={() => setResType('Thesis')}>Theses</button>
                  <button className={styles.emptyHint} onClick={() => setLanguage('French')}>French Collection</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {filtered.length === 0 ? (
          <section className={styles.empty}>
            <svg className={styles.emptyIcon} viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <circle cx="22" cy="22" r="14" stroke="#ccc" strokeWidth="2.5"/>
              <path d="M33 33l9 9" stroke="#ccc" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M16 22h12" stroke="#ccc" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <h2 className={styles.emptyTitle}>No results found</h2>
            <p className={styles.emptyBody}>
              We couldn't find anything matching your search. Here are a few suggestions:
            </p>
            <ul className={styles.emptySuggestions}>
              <li>Check the spelling of your search terms</li>
              <li>Try broader keywords or alternative subject headings</li>
              <li>Remove one or more filters to widen your search</li>
              <li>Use the advanced search to query by title, author, or subject separately</li>
            </ul>
            <button className={styles.emptyBtn} onClick={clearAll}>Clear all and start over</button>
          </section>
        ) : view === 'grid' ? (
          <ul className={styles.grid} aria-label={`${filtered.length} results`}>
            {filtered.map(book => {
              const bookAvail  = getAvailability(book.id)
              const bookCampus = getCampus(book.id)
              const bookType   = getResourceType(book.id)
              return (
                <li key={book.id} className={styles.card}>
                  <div
                    className={styles.coverWrap}
                    onClick={() => navigate(`/books/${book.id}`)}
                    role="link"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter') navigate(`/books/${book.id}`) }}
                  >
                    <img
                      src={book.cover}
                      alt={`Cover of ${book.title}`}
                      className={styles.coverImg}
                      loading="lazy"
                      onError={e => { e.currentTarget.style.display = 'none' }}
                    />
                  </div>
                  <div className={styles.cardBody}>
                    <h2 className={styles.cardTitle}>
                      <a
                        href={`/books/${book.id}`}
                        className={styles.cardTitleLink}
                        onClick={e => { e.preventDefault(); navigate(`/books/${book.id}`) }}
                      >
                        {book.title}
                      </a>
                    </h2>
                    <p className={styles.cardAuthor}>{book.author}</p>
                    <p className={styles.cardMeta}>
                      {book.year > 0 ? book.year : `${Math.abs(book.year)} BCE`} · {bookCampus === 'both' ? 'Beirut & Byblos' : bookCampus}
                    </p>
                    <div className={styles.cardTags}>
                      <span className={styles.tag} data-type="resource">{bookType}</span>
                      <span className={styles.tag} data-type={bookAvail ? 'available' : 'on-loan'}>
                        {bookAvail ? 'Available' : 'On Loan'}
                      </span>
                    </div>
                    <div className={styles.cardActions}>
                      <a
                        href={`/books/${book.id}`}
                        className={styles.action}
                        onClick={e => { e.preventDefault(); navigate(`/books/${book.id}`) }}
                      >
                        View Record
                      </a>
                      <span className={styles.actionSep} aria-hidden="true" />
                      <button
                        className={styles.action}
                        onClick={() => navigate(`/books/${book.id}`)}
                      >
                        Holdings
                      </button>
                      <span className={styles.actionSep} aria-hidden="true" />
                      <button className={styles.action} onClick={e => e.preventDefault()}>
                        Save
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <ul className={styles.list} aria-label={`${filtered.length} results`}>
            {filtered.map(book => {
              const bookAvail  = getAvailability(book.id)
              const { total, available } = getCopies(book.id)
              const bookCampus = getCampus(book.id)
              const bookType   = getResourceType(book.id)
              const callNum    = getCallNumber(book)
              return (
                <li key={book.id} className={styles.listRow}>
                  <img
                    src={book.cover}
                    alt={`Cover of ${book.title}`}
                    className={styles.listCover}
                    loading="lazy"
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                  <div className={styles.listInfo}>
                    <h2 className={styles.listTitle}>
                      <a
                        href={`/books/${book.id}`}
                        className={styles.listTitleLink}
                        onClick={e => { e.preventDefault(); navigate(`/books/${book.id}`) }}
                      >
                        {book.title}
                      </a>
                    </h2>
                    <p className={styles.listAuthor}>{book.author}</p>
                    <p className={styles.listDetails}>
                      {book.publisher}, {book.year > 0 ? book.year : `${Math.abs(book.year)} BCE`} · {book.pages} pp. · ISBN {book.isbn}
                    </p>
                    <div className={styles.listTags}>
                      <span className={styles.tag} data-type="resource">{bookType}</span>
                      <span className={styles.tag} data-type="subject">{book.genre}</span>
                      <span className={styles.tag} data-type={bookAvail ? 'available' : 'on-loan'}>
                        {bookAvail ? 'Available' : 'On Loan'}
                      </span>
                    </div>
                    <div className={styles.listActions}>
                      <a
                        href={`/books/${book.id}`}
                        className={styles.action}
                        onClick={e => { e.preventDefault(); navigate(`/books/${book.id}`) }}
                      >
                        View Record
                      </a>
                      <span className={styles.actionSep} aria-hidden="true" />
                      <button
                        className={styles.action}
                        onClick={() => navigate(`/books/${book.id}`)}
                      >
                        Holdings
                      </button>
                      <span className={styles.actionSep} aria-hidden="true" />
                      <button className={styles.action}>
                        Save
                      </button>
                    </div>
                  </div>
                  <div className={styles.listRight}>
                    <span className={styles.listCallNum}>{callNum}</span>
                    <span className={styles.listCampus}>
                      {bookCampus === 'both' ? 'Beirut & Byblos' : bookCampus}
                    </span>
                    <span className={styles.listCopies}>
                      {available} of {total} available
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}
