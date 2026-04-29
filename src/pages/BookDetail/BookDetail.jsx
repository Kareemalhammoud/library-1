import { useParams, useNavigate } from 'react-router-dom'
import { BOOKS } from '@/data/bookData'
import { useState, useEffect, useMemo } from 'react'
import { getCampus, getCopies } from '@/utils/bookUtils'
import { useBooks } from '@/context/BooksContext'
import { borrowBook, fetchBookById, isBackendConfigured, reserveBook } from '@/services/libraryApi'

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { books, loading: booksLoading, error: booksContextError, loadBooks } = useBooks()

  const fallbackBook = useMemo(
    () => books.find((b) => String(b.id) === String(id)) || BOOKS.find((b) => String(b.id) === String(id)),
    [books, id]
  )

  const [book, setBook] = useState(fallbackBook || null)
  const [bookLoading, setBookLoading] = useState(true)
  const [bookError, setBookError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [borrowed, setBorrowed] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const [actionType, setActionType] = useState('borrow')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionNotice, setActionNotice] = useState('')
  const [progress, setProgress] = useState(0)

  function getUserPrefix() {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken')

    try {
      const u = JSON.parse(localStorage.getItem('user'))
      const key = u?.email || token
      return key ? `${key}:` : ''
    } catch {
      return token ? `${token}:` : ''
    }
  }

  function handleShare() {
    navigator.clipboard?.writeText(window.location.href)
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 2000)
  }

  const prefix = getUserPrefix()
  const hasLoggedInUser = localStorage.getItem('isLoggedIn') === 'true' && Boolean(prefix)
  const bookStorageId = book?.id === undefined || book?.id === null ? '' : String(book.id)
  const borrowKey = bookStorageId ? `${prefix}borrowed-${bookStorageId}` : ''
  const reserveKey = bookStorageId ? `${prefix}reserved-${bookStorageId}` : ''
  const loanKey = bookStorageId ? `${prefix}loan-${bookStorageId}` : ''
  const storageKey = bookStorageId ? `${prefix}reading-progress-${bookStorageId}` : ''
  const backendUserState = isBackendConfigured()
    ? book?.userLoan
      ? 'borrowed'
      : book?.userReservation
        ? 'reserved'
        : ''
    : ''
  const actionButtonState = backendUserState || (borrowed ? actionType : '')

  useEffect(() => {
    let alive = true

    if (!isBackendConfigured()) {
      setBook(fallbackBook || null)
      setBookError('')
      setBookLoading(false)
      return () => {
        alive = false
      }
    }

    setBookLoading(true)
    setBookError('')

    fetchBookById(id)
      .then((nextBook) => {
        if (alive) setBook(nextBook || fallbackBook || null)
      })
      .catch((err) => {
        if (!alive) return
        setBook(fallbackBook || null)
        setBookError(err.message || 'Could not load book details from the server.')
      })
      .finally(() => {
        if (alive) setBookLoading(false)
      })

    return () => {
      alive = false
    }
  }, [fallbackBook, id])

  const copyData = useMemo(() => {
    if (!book) return { total: 0, available: 0 }

    const numericId = Number(book.id)
    const fallbackCopies = Number.isFinite(numericId) ? getCopies(numericId) : { total: 1, available: 1 }
    const total =
      typeof book.copies === 'number' && Number.isFinite(book.copies)
        ? book.copies
        : typeof book.totalCopies === 'number' && Number.isFinite(book.totalCopies)
          ? book.totalCopies
          : fallbackCopies.total
    const available =
      typeof book.availableCopies === 'number' && Number.isFinite(book.availableCopies)
        ? book.availableCopies
        : typeof book.available === 'boolean'
          ? book.available ? total : 0
          : fallbackCopies.available

    return { total, available }
  }, [book])

  const totalCopies = copyData.total
  const availableCopies = copyData.available
  const isAvailable = availableCopies > 0
  const bookCampus = book?.campus || getCampus(Number(book?.id) || 0)

  useEffect(() => {
    setBorrowed(false)

    if (!bookStorageId || !hasLoggedInUser) {
      return
    }

    if (isBackendConfigured()) {
      const nextState = book?.userLoan ? 'borrow' : book?.userReservation ? 'reserve' : 'borrow'
      setActionType(nextState)
      setBorrowed(Boolean(book?.userLoan || book?.userReservation))
      return
    }

    const savedLoan = localStorage.getItem(loanKey)
    const savedReservation = localStorage.getItem(reserveKey)
    const hasReservation = savedReservation !== null
    setBorrowed(
      localStorage.getItem(borrowKey) !== null ||
      savedLoan !== null ||
      hasReservation
    )
    setActionType(hasReservation ? 'reserve' : 'borrow')
  }, [book?.userLoan, book?.userReservation, bookStorageId, borrowKey, hasLoggedInUser, loanKey, reserveKey])

  function handleBorrowClick() {
    if (!hasLoggedInUser) {
      navigate('/login', { state: { from: `/books/${book?.id}` } })
      return
    }

    setActionType(isAvailable ? 'borrow' : 'reserve')
    setActionError('')
    setActionNotice('')
    setConfirmed(false)
    setModalOpen(true)
  }

  async function handleConfirm() {
    if (!book) return

    setActionLoading(true)
    setActionError('')
    const borrowedAt = new Date()
    const dueAt = new Date(borrowedAt)
    dueAt.setDate(dueAt.getDate() + 14)
    let actionResult = null

    try {
      if (isBackendConfigured()) {
        if (actionType === 'borrow') {
          actionResult = await borrowBook(book.id, {
            borrowedAt: borrowedAt.toISOString(),
            dueAt: dueAt.toISOString(),
          })
        } else {
          actionResult = await reserveBook(book.id, {
            reservedAt: borrowedAt.toISOString(),
          })
        }
      }
      setActionNotice('')
    } catch (err) {
      setActionError(err.message || 'Could not complete this request.')
      setActionLoading(false)
      return
    }

    if (actionResult?.book) {
      setBook(actionResult.book)
    }

    setBorrowed(true)
    setConfirmed(true)
    if (actionType === 'borrow' && borrowKey) {
      localStorage.setItem(borrowKey, borrowedAt.toISOString())
    }
    if (actionType === 'reserve' && reserveKey) {
      localStorage.setItem(reserveKey, borrowedAt.toISOString())
    }

    if (actionType === 'borrow' && loanKey) {
      localStorage.setItem(
        loanKey,
        JSON.stringify({
          bookId: book.id,
          borrowedAt: borrowedAt.toISOString(),
          dueAt: dueAt.toISOString(),
        })
      )
    }

    // Update the borrowedBooks list so the Dashboard shows this book
    const borrowedBooksKey = `${prefix}borrowedBooks`
    let currentBooks = []
    try {
      currentBooks = JSON.parse(localStorage.getItem(borrowedBooksKey)) || []
    } catch { /* ignore */ }

    const alreadyExists = currentBooks.some((b) => b.id === book.id)
    if (!alreadyExists) {
      currentBooks.push({
        id: book.id,
        title: book.title,
        borrowedAt: actionType === 'borrow' ? borrowedAt.toISOString() : null,
        dueDate: actionType === 'borrow' ? dueAt.toISOString() : null,
        renewCount: 0,
        isReserved: actionType === 'reserve',
      })
      localStorage.setItem(borrowedBooksKey, JSON.stringify(currentBooks))
    }

    loadBooks?.()
    setActionLoading(false)
  }

  function handleClose() {
    setModalOpen(false)
  }

  const { relatedBooks, relatedTitle } = useMemo(() => {
    if (!book) return { relatedBooks: [], relatedTitle: '' }

    const sourceBooks = books.length ? books : BOOKS
    const sameGenre = sourceBooks.filter((b) => b.genre === book.genre && String(b.id) !== String(book.id))
    const nextRelatedBooks =
      sameGenre.length >= 2
        ? sameGenre.slice(0, 4)
        : sourceBooks.filter((b) => String(b.id) !== String(book.id)).slice(0, 4)
    const nextRelatedTitle = sameGenre.length >= 2 ? `More in ${book.genre}` : 'You might also enjoy'

    return { relatedBooks: nextRelatedBooks, relatedTitle: nextRelatedTitle }
  }, [book, books])

  useEffect(() => {
    setProgress(Number(localStorage.getItem(storageKey) ?? 0))
  }, [storageKey])

  const handleProgress = (val) => {
    setProgress(val)
    localStorage.setItem(storageKey, val)
  }

  if (bookLoading || booksLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f8f7f4] dark:bg-[#121212]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e5e2dc] border-t-[#1a4a3a] dark:border-[#333] dark:border-t-[#5ecba1]" aria-hidden="true" />
        <p className="text-[#555] dark:text-[#888]">Loading book details...</p>
      </main>
    )
  }

  if (!book) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-[#555]">{bookError || booksContextError || 'Book not found.'}</p>
        <button
          className="cursor-pointer rounded-lg border border-[#ccc] px-4 py-2 text-[0.85rem] hover:bg-[#eee]"
          onClick={() => navigate(-1)}
        >
          Go back
        </button>
      </main>
    )
  }

  return (
    <div key={id} className="min-h-screen bg-[#f8f7f4] pb-16 dark:bg-[#121212]">

      {/* ── Breadcrumb ── */}
      <nav
        className="flex items-center gap-4 border-b border-[#e5e2dc] bg-[#f8f7f4] px-4 py-4 sm:px-6 md:px-8 dark:border-[#2a2a2a] dark:bg-[#121212]"
        aria-label="Breadcrumb"
      >
        <button
          className="cursor-pointer rounded-md border border-[#ccc] bg-transparent px-[0.9rem] py-[0.4rem] text-[0.85rem] text-[#555] hover:bg-[#eee] dark:border-[#333] dark:text-[#888] dark:hover:bg-[#2e2e2e]"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <span className="truncate text-[0.85rem] text-[#999] dark:text-[#888]">
          Books / {book.title}
        </span>
      </nav>

      {/* ── Main article ──
          Mobile:  single column, cover on top, content below
          Desktop: two columns, cover sidebar sticky on left, content on right */}
      <article className="mx-auto mt-8 grid max-w-[1000px] grid-cols-1 items-start gap-8 px-4 sm:px-6 md:mt-12 md:gap-12 md:px-8 md:[grid-template-columns:260px_1fr]">
        {(bookError || booksContextError) && (
          <div className="rounded-lg border border-[#f0d6d3] bg-[#fff5f3] px-4 py-3 text-[0.85rem] text-[#9c3b31] dark:border-[#3b1c1a] dark:bg-[#241413] dark:text-[#ff9388] md:col-span-2" role="alert">
            {bookError || booksContextError} Showing the local catalog record while the backend is unavailable.
          </div>
        )}

        {/* ── Sidebar: cover + availability + action buttons ──
            Only sticky on md+ — on mobile it flows naturally above the content */}
        <aside className="md:sticky md:top-[4.5rem] md:self-start">
          <img
            src={book.cover}
            alt={`Cover of ${book.title}`}
            className="w-full rounded-md shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
          />

          <div className="mt-4 rounded-lg border border-[#e5e2dc] bg-[#e5e2dc] p-4 dark:border-[#2a2a2a] dark:bg-[#1a1a1a]">
            <p className={`m-0 text-[0.9rem] font-semibold ${isAvailable ? 'text-[#2d7a4f]' : 'text-[#c0392b]'}`}>
              {isAvailable ? '● Available' : '● No copies available'}
            </p>
            <p className="m-0 mt-1 text-[0.8rem] text-[#999] dark:text-[#888]">
              {availableCopies} of {totalCopies} copies available
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <button
              className="w-full cursor-pointer rounded-lg border-0 bg-[#1a4a3a] py-[0.85rem] text-[0.9rem] font-semibold text-white transition-colors hover:enabled:bg-[#2d7a4f] disabled:cursor-not-allowed disabled:bg-[#ccc] disabled:text-[#888]"
              disabled={Boolean(actionButtonState) || actionLoading}
              onClick={handleBorrowClick}
              aria-label={`Borrow ${book.title}`}
            >
              {actionButtonState ? (actionButtonState === 'reserved' || actionButtonState === 'reserve' ? 'Reserved' : 'Borrowed') : isAvailable ? 'Borrow this Book' : 'Reserve this Book'}
            </button>

            <button
              className="w-full cursor-pointer rounded-lg border border-[#ccc] bg-white py-[0.85rem] text-[0.9rem] font-semibold text-[#555] transition-colors hover:bg-[#f0f0f0] dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-[#888] dark:hover:bg-[#242424]"
              aria-label={`Share ${book.title}`}
              onClick={handleShare}
            >
              {shareCopied ? '✓ Copied!' : 'Share'}
            </button>

            {(() => { try { const u = JSON.parse(localStorage.getItem('user')); return u?.email === 'admin@lau.edu' } catch { return false } })() && (
              <button
                className="w-full cursor-pointer rounded-lg border-[1.5px] border-[#1a4a3a] bg-transparent py-[0.85rem] text-[0.9rem] font-semibold text-[#1a4a3a] transition-all hover:bg-[#1a4a3a] hover:text-white"
                aria-label={`Edit ${book.title}`}
                onClick={() => navigate(`/books/${book.id}/edit`)}
              >
                Edit Book
              </button>
            )}
          </div>
        </aside>

        {/* ── Main content: title, description, metadata, reading progress ── */}
        <section className="flex flex-col gap-3 self-stretch">
          <span className="text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[#888] dark:text-[#888]">
            {book.genre}
          </span>

          {/* Title scales down slightly on mobile */}
          <h1 className="m-0 text-[1.8rem] font-bold leading-[1.2] text-[#1a1a1a] sm:text-[2.2rem] dark:text-white">
            {book.title}
          </h1>
          <p className="m-0 text-base text-[#666] dark:text-[#888]">by {book.author}</p>

          <div className="my-2 text-[0.95rem] leading-[1.7] text-[#555] dark:text-[#888]">
            {book.description.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {/* Metadata grid — 2 cols at all sizes, readable on mobile */}
          <ul
            className="mt-2 grid list-none grid-cols-2 gap-x-4 gap-y-[0.6rem] border-t border-[#e5e2dc] p-0 pt-4 sm:gap-x-6 dark:border-[#333]"
            aria-label="Book details"
          >
            {[
              ['Year', book.year],
              ['Pages', book.pages],
              ['Publisher', book.publisher],
              ['ISBN', book.isbn],
              ['Language', book.language === 'FR' ? 'French' : 'English'],
              ['Rating', `⭐ ${book.rating}`],
              ['Campus', bookCampus === 'both' ? 'Beirut / Byblos' : bookCampus],
            ].map(([label, value]) => (
              <li key={label} className="flex flex-col text-[0.8rem] text-[#999] dark:text-[#888]">
                <span>{label}</span>
                <strong className="mt-[0.15rem] text-[0.9rem] text-[#222] dark:text-white">{value}</strong>
              </li>
            ))}
          </ul>

          {/* Reading progress tracker */}
          <section
            className="mt-6 flex flex-col gap-3 rounded-xl border border-[#e5e2dc] bg-white p-5 dark:border-[#2a2a2a] dark:bg-[#1a1a1a]"
            aria-label="Reading progress tracker"
          >
            {/* Label + percentage */}
            <div className="flex items-baseline justify-between">
              <label
                htmlFor={`progress-${book.id}`}
                className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#aaa] dark:text-[#888]"
              >
                Reading Progress
              </label>
              <span
                className="text-[1.6rem] font-extrabold leading-none tracking-tight text-[#1a1a1a] dark:text-white"
                aria-live="polite"
              >
                {progress}%
              </span>
            </div>

            {/* Single unified control: visual bar + draggable input overlaid on top */}
            <div className="relative h-5 w-full">
              {/* Visual track + filled bar */}
              <div
                className="pointer-events-none absolute top-1/2 h-2 w-full -translate-y-1/2 overflow-hidden rounded-full bg-[#f0ede8] dark:bg-[#2a2a2a]"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${progress}% complete`}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2d7a4f] to-[#1a4a3a] transition-[width] duration-[200ms] ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Range input — sits over the bar, transparent track, only thumb is visible */}
              <input
                id={`progress-${book.id}`}
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => handleProgress(Number(e.target.value))}
                className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent outline-none
                  [&::-webkit-slider-runnable-track]:bg-transparent
                  [&::-moz-range-track]:bg-transparent
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:h-[22px]
                  [&::-webkit-slider-thumb]:w-[22px]
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:border-[3px]
                  [&::-webkit-slider-thumb]:border-white
                  [&::-webkit-slider-thumb]:bg-[#1a4a3a]
                  [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.25)]
                  [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:duration-150
                  hover:[&::-webkit-slider-thumb]:scale-110
                  [&::-moz-range-thumb]:h-[22px]
                  [&::-moz-range-thumb]:w-[22px]
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:border-[3px]
                  [&::-moz-range-thumb]:border-white
                  [&::-moz-range-thumb]:bg-[#1a4a3a]
                  [&::-moz-range-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.25)]
                  dark:[&::-webkit-slider-thumb]:border-[#1a1a1a]
                  dark:[&::-webkit-slider-thumb]:bg-[#5ecba1]
                  dark:[&::-moz-range-thumb]:border-[#1a1a1a]
                  dark:[&::-moz-range-thumb]:bg-[#5ecba1]"
              />
            </div>

            <p className="m-0 text-[0.78rem] italic text-[#bbb] dark:text-[#888]" aria-live="polite">
              {progress === 0 && 'Not started yet'}
              {progress > 0 && progress < 100 && `${100 - progress}% left to go`}
              {progress === 100 && '✓ Finished!'}
            </p>
          </section>
        </section>
      </article>

      {/* ── Related books ──
          2 columns on mobile, 4 on sm+ */}
      {relatedBooks.length > 0 && (
        <section
          className="mx-auto mt-10 max-w-[1000px] border-t border-[#e5e2dc] px-4 pt-8 sm:px-6 md:mt-12 md:px-8 dark:border-[#333]"
          aria-label="Related books"
        >
          <h2 className="mb-6 text-[1.3rem] font-bold text-[#1a1a1a] dark:text-white">{relatedTitle}</h2>
          <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-4 sm:gap-6">
            {relatedBooks.map((related) => (
              <li key={related.id}>
                <button
                  className="group w-full cursor-pointer border-0 bg-transparent p-0 text-left"
                  onClick={() => navigate(`/books/${related.id}`)}
                  aria-label={`View ${related.title}`}
                >
                  <img
                    src={related.cover}
                    alt={`Cover of ${related.title}`}
                    className="aspect-[2/3] w-full rounded-md object-cover shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-transform duration-200 group-hover:-translate-y-1"
                  />
                  <p className="mb-[0.2rem] mt-[0.6rem] text-[0.85rem] font-semibold text-[#1a1a1a] dark:text-white">
                    {related.title}
                  </p>
                  <p className="m-0 text-[0.75rem] text-[#888] dark:text-[#888]">{related.author}</p>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Borrow modal ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 dark:bg-[rgba(0,0,0,0.7)]"
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-label="Borrow book"
        >
          <div
            className="flex w-full max-w-[400px] flex-col items-center gap-4 rounded-2xl bg-white p-6 text-center shadow-[0_24px_60px_rgba(0,0,0,0.2)] sm:p-8 dark:bg-[#242424]"
            onClick={(e) => e.stopPropagation()}
          >
            {confirmed ? (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2d7a4f] text-2xl text-white">
                  ✓
                </div>
                <h2 className="m-0 text-[1.2rem] font-bold text-[#1a1a1a] dark:text-white">
                  {actionType === 'borrow' ? 'Borrowed Successfully!' : 'Reservation Saved!'}
                </h2>
                <p className="m-0 text-[0.9rem] leading-[1.6] text-[#555] dark:text-[#888]">
                  <strong>{book.title}</strong>{' '}
                  {actionType === 'borrow'
                    ? 'has been added to your loans. Please pick it up from the library desk within 48 hours.'
                    : 'has been added to your reservations. A librarian will notify you when it becomes available.'}
                </p>
                {actionNotice && (
                  <p className="m-0 rounded-lg bg-[#fff5d8] px-3 py-2 text-[0.78rem] leading-[1.5] text-[#7c5b00] dark:bg-[#332800] dark:text-[#f1d57a]">
                    {actionNotice}
                  </p>
                )}
                <button
                  className="w-full flex-1 cursor-pointer rounded-lg border-0 bg-[#1a4a3a] py-3 text-[0.9rem] font-semibold text-white transition-colors hover:bg-[#2d7a4f]"
                  onClick={handleClose}
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <img
                  src={book.cover}
                  alt={`Cover of ${book.title}`}
                  className="aspect-[2/3] w-[100px] rounded-md object-cover shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                />
                <h2 className="m-0 text-[1.2rem] font-bold text-[#1a1a1a] dark:text-white">
                  {actionType === 'borrow' ? 'Borrow this book?' : 'Reserve this book?'}
                </h2>
                <p className="m-0 text-[0.9rem] leading-[1.6] text-[#555] dark:text-[#888]">
                  <strong>{book.title}</strong> by {book.author}
                  <br />
                  <span className="mt-1 block text-[0.8rem] text-[#aaa] dark:text-[#888]">
                    {actionType === 'borrow' ? 'Loan period: 14 days' : 'We will hold the next available copy for you'}
                  </span>
                </p>
                {actionError && <p className="m-0 text-[0.82rem] text-[#c0392b]">{actionError}</p>}
                <div className="mt-2 flex w-full gap-3">
                  <button
                    className="flex-1 cursor-pointer rounded-lg border border-[#e0ddd8] bg-white py-3 text-[0.9rem] font-semibold text-[#555] transition-colors hover:bg-[#f5f3ef] dark:border-[#333] dark:bg-[#2e2e2e] dark:text-[#888] dark:hover:bg-[#333]"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 cursor-pointer rounded-lg border-0 bg-[#1a4a3a] py-3 text-[0.9rem] font-semibold text-white transition-colors hover:bg-[#2d7a4f]"
                    onClick={handleConfirm}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Saving...' : actionType === 'borrow' ? 'Confirm Borrow' : 'Confirm Reserve'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
