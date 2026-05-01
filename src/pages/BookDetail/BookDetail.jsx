import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import {
  getBook,
  getBooks,
  getFavorites,
  addFavorite,
  removeFavorite,
  createLoan,
  createReservation,
  getActiveLoans,
  getReadingProgress,
  updateReadingProgress,
  getReviewsForBook,
  submitReview,
  deleteReview as deleteReviewApi,
} from '@/utils/api'
import { getStoredUser, isAdminUser, isLoggedInUser } from '@/utils'

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

function normalizeBook(data) {
  return {
    id: data.id,
    title: data.title || 'Untitled',
    author: data.author || 'Unknown Author',
    genre: data.genre || data.category || 'General',
    description: data.description || 'No description available for this book yet.',
    cover: sanitizeImage(data.cover || data.image),
    availableCopies: Number(data.available_copies ?? data.availableCopies ?? data.copies ?? 0),
    totalCopies: Number(data.totalCopies ?? data.total_copies ?? data.available_copies ?? data.availableCopies ?? data.copies ?? 0),
    year: data.year || 'N/A',
    pages: data.pages || 'N/A',
    publisher: data.publisher || 'Library Collection',
    isbn: data.isbn || 'N/A',
    language: data.language || 'EN',
    rating: data.rating || 'N/A',
    campus: data.campus || 'Beirut',
    authorBiography: data.authorBiography || '',
    userLoan: data.userLoan || null,
    userReservation: data.userReservation || null,
  }
}

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const admin = isAdminUser()

  const [book, setBook] = useState(null)
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError('')
    setNotFound(false)
    setBook(null)

    Promise.all([getBook(id), getBooks()])
      .then(([oneBook, allBooks]) => {
        if (cancelled) return
        setBook(normalizeBook(oneBook))
        setBooks(allBooks)
      })
      .catch((error) => {
        if (cancelled) return
        if (error.status === 404) {
          setNotFound(true)
        } else {
          setLoadError(error.message || 'Failed to load book')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  const [modalOpen, setModalOpen] = useState(false)
  const [borrowed, setBorrowed] = useState(false)
  const [reserved, setReserved] = useState(false)
  const [actionSubmitting, setActionSubmitting] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressSaving, setProgressSaving] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteBusy, setFavoriteBusy] = useState(false)
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewHover, setReviewHover] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const currentUser = getStoredUser()

  // Whenever a book loads (or the user navigates to a different book), check
  // whether it's in this user's favorites. Skip the API call for guests.
  useEffect(() => {
    if (!book || !isLoggedInUser()) {
      setIsFavorite(false)
      return
    }
    let cancelled = false
    getFavorites()
      .then((favs) => {
        if (cancelled) return
        setIsFavorite(favs.some((fav) => fav.id === book.id))
      })
      .catch(() => {
        /* non-critical — leave as unfavorited */
      })
    return () => {
      cancelled = true
    }
  }, [book])

  // Load reviews whenever the book changes. If the current user already has
  // one, pre-fill the form so they can edit rather than add a duplicate.
  useEffect(() => {
    if (!book) return
    let cancelled = false
    setReviewsLoading(true)
    getReviewsForBook(book.id)
      .then((data) => {
        if (cancelled) return
        setReviews(data)
        const mine = currentUser ? data.find((r) => r.userId === currentUser.id) : null
        if (mine) {
          setReviewRating(mine.rating)
          setReviewComment(mine.comment || '')
        } else {
          setReviewRating(0)
          setReviewComment('')
        }
      })
      .catch(() => {
        /* non-critical — reviews just won't show */
      })
      .finally(() => {
        if (!cancelled) setReviewsLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book])

  const reviewStats = useMemo(() => {
    if (reviews.length === 0) return { average: 0, count: 0 }
    const total = reviews.reduce((sum, r) => sum + r.rating, 0)
    return { average: total / reviews.length, count: reviews.length }
  }, [reviews])

  const myReview = currentUser ? reviews.find((r) => r.userId === currentUser.id) : null

  async function handleSubmitReview(e) {
    e.preventDefault()
    if (!book) return
    if (!isLoggedInUser()) {
      navigate('/login', { state: { from: `/books/${book.id}` } })
      return
    }
    if (reviewRating < 1) {
      setReviewError('Pick a star rating before submitting.')
      return
    }

    setReviewError('')
    setReviewSubmitting(true)
    try {
      const saved = await submitReview(book.id, { rating: reviewRating, comment: reviewComment })
      setReviews((prev) => {
        const without = prev.filter((r) => r.id !== saved.id)
        return [saved, ...without]
      })
    } catch (error) {
      setReviewError(error.message || 'Failed to submit review')
    } finally {
      setReviewSubmitting(false)
    }
  }

  async function handleDeleteReview(reviewId) {
    try {
      await deleteReviewApi(reviewId)
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
      setReviewRating(0)
      setReviewComment('')
    } catch (error) {
      setReviewError(error.message || 'Failed to delete review')
    }
  }

  async function handleToggleFavorite() {
    if (!book) return
    if (!isLoggedInUser()) {
      navigate('/login', { state: { from: `/books/${book.id}` } })
      return
    }

    const next = !isFavorite
    setFavoriteBusy(true)
    // Optimistic update — flip immediately, revert on failure so the heart
    // feels responsive even on a slow connection.
    setIsFavorite(next)
    try {
      if (next) {
        await addFavorite(book.id)
      } else {
        await removeFavorite(book.id)
      }
    } catch {
      setIsFavorite(!next)
    } finally {
      setFavoriteBusy(false)
    }
  }

  function getUserPrefix() {
    const user = getStoredUser?.()
    return user?.email ? `${user.email}:` : ''
  }

  const prefix = getUserPrefix()
  const safeBookId = book?.id ?? 0
  const borrowKey = `${prefix}borrowed-${safeBookId}`
  const reservationKey = `${prefix}reserved-${safeBookId}`
  const storageKey = `${prefix}reading-progress-${safeBookId}`

  useEffect(() => {
    if (!book) return
    setActionError('')
    setActionSuccess('')
    setBorrowed(false)

    if (!isLoggedInUser()) {
      setReserved(false)
      return
    }

    let cancelled = false
    getActiveLoans()
      .then((loans) => {
        if (cancelled) return
        setBorrowed(loans.some((loan) => Number(loan.book_id) === Number(book.id)))
      })
      .catch(() => {
        if (!cancelled) setBorrowed(Boolean(book.userLoan))
      })

    setReserved(Boolean(book.userReservation) || Boolean(localStorage.getItem(reservationKey)))

    return () => {
      cancelled = true
    }
  }, [book, reservationKey])

  useEffect(() => {
    if (!book) return
    let cancelled = false

    if (!isLoggedInUser()) {
      setProgress(Number(localStorage.getItem(storageKey) ?? 0))
      return
    }

    getReadingProgress(book.id)
      .then((data) => {
        if (cancelled) return
        setProgress(Number(data.progress ?? 0))
      })
      .catch(() => {
        if (!cancelled) setProgress(Number(localStorage.getItem(storageKey) ?? 0))
      })

    return () => {
      cancelled = true
    }
  }, [book, storageKey])

  const isAvailable = Number(book?.availableCopies ?? 0) > 0
  const bookCampus = book?.campus === 'both' ? 'Beirut / Byblos' : book?.campus || 'Beirut'
  const authorBiography =
    book?.authorBiography || 'No biography available for this author yet.'

  const { relatedBooks, relatedTitle } = useMemo(() => {
    if (!book || books.length === 0) {
      return { relatedBooks: [], relatedTitle: 'You might also enjoy' }
    }

    const sameGenre = books.filter((b) => b.genre === book.genre && b.id !== book.id)
    const nextRelatedBooks =
      sameGenre.length >= 2
        ? sameGenre.slice(0, 4)
        : books.filter((b) => b.id !== book.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 4)

    const nextRelatedTitle =
      sameGenre.length >= 2 ? `More in ${book.genre}` : 'You might also enjoy'

    return { relatedBooks: nextRelatedBooks, relatedTitle: nextRelatedTitle }
  }, [book, books])

  function handleShare() {
    navigator.clipboard?.writeText(window.location.href)
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 2000)
  }

  function handleBorrowClick() {
    if (!book) return

    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login', { state: { from: `/books/${book.id}` } })
      return
    }

    setConfirmed(false)
    setActionError('')
    setActionSuccess('')
    setModalOpen(true)
  }

  async function handleConfirm() {
    if (!book) return
    setActionSubmitting(true)
    setActionError('')

    // Persist to the DB first. Without this, the dashboard can't show the
    // loan — it reads from the `loans` table, not localStorage.
    try {
      const loan = await createLoan(book.id)
      // Reflect the decremented available count on this page without a full refetch.
      // total_copies stays the same — only the available count drops.
      setBook((prev) => (prev ? {
        ...prev,
        copies: Math.max(0, (prev.copies ?? 0) - 1),
        availableCopies: Math.max(0, (prev.availableCopies ?? 0) - 1),
      } : prev))
      setBorrowed(Boolean(loan))
    } catch (error) {
      setActionError(error.message || 'Failed to borrow this book')
      setActionSubmitting(false)
      return
    }

    const borrowedAt = new Date()
    const dueAt = new Date(borrowedAt)
    dueAt.setDate(dueAt.getDate() + 14)

    const borrowedBookEntry = {
      id: book.id,
      title: book.title,
      borrowedAt: borrowedAt.toISOString(),
      dueDate: dueAt.toISOString(),
      renewCount: 0,
      isReserved: false,
    }

    const borrowedBooksKey = `${prefix}borrowedBooks`
    let currentBorrowedBooks = []

    try {
      currentBorrowedBooks =
        JSON.parse(localStorage.getItem(borrowedBooksKey)) || []
    } catch {
      currentBorrowedBooks = []
    }

    setBorrowed(true)
    setConfirmed(true)
    setActionSuccess(`You borrowed ${book.title}.`)
    setActionSubmitting(false)

    localStorage.removeItem(borrowKey)

    const alreadyTracked = currentBorrowedBooks.some((entry) => entry.id === book.id)

    if (!alreadyTracked) {
      localStorage.setItem(borrowedBooksKey, JSON.stringify([...currentBorrowedBooks, borrowedBookEntry]))
    }
  }

  async function handleReserveClick() {
    if (!book) return

    if (!isLoggedInUser()) {
      navigate('/login', { state: { from: `/books/${book.id}` } })
      return
    }

    setActionSubmitting(true)
    setActionError('')
    setActionSuccess('')

    try {
      await createReservation(book.id)
      setReserved(true)
      setActionSuccess(`You reserved ${book.title}. We will notify you when a copy is available.`)
      localStorage.setItem(reservationKey, new Date().toISOString())
    } catch (error) {
      if (error.status === 409) {
        setReserved(true)
        setActionSuccess(error.message || 'This book is already reserved for your account.')
        localStorage.setItem(reservationKey, new Date().toISOString())
      } else {
        setActionError(error.message || 'Failed to reserve this book')
      }
    } finally {
      setActionSubmitting(false)
    }
  }

  function handleClose() {
    setModalOpen(false)
  }

  const handleProgress = (val) => {
    setProgress(val)
    localStorage.setItem(storageKey, val)
    if (!book || !isLoggedInUser()) return

    setProgressSaving(true)
    updateReadingProgress(book.id, val)
      .catch(() => {
        /* localStorage remains as a fallback if the network save fails */
      })
      .finally(() => setProgressSaving(false))
  }

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#d0ddd8] border-t-[#1a6644] dark:border-[#333333] dark:border-t-[#5ecba1]" />
        <p className="text-[0.85rem] text-[#5a6b62] dark:text-[#8c9691]">Loading book...</p>
      </main>
    )
  }

  if (loadError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-[1rem] font-bold text-[#b5392b] dark:text-[#ff9388]">Couldn&apos;t load this book</p>
        <p className="max-w-[44ch] text-[0.85rem] leading-[1.6] text-[#555] dark:text-[#888]">{loadError}</p>
        <button
          className="cursor-pointer rounded-lg border border-[#ccc] px-4 py-2 text-[0.85rem] hover:bg-[#eee]"
          onClick={() => navigate(-1)}
        >
          Go back
        </button>
      </main>
    )
  }

  if (notFound || !book) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-[#555]">Book not found.</p>
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

      <article className="mx-auto mt-8 grid max-w-[1000px] grid-cols-1 items-start gap-8 px-4 sm:px-6 md:mt-12 md:gap-12 md:px-8 md:[grid-template-columns:260px_1fr]">
        <aside className="md:sticky md:top-[4.5rem] md:self-start">
          <img
            src={book.cover}
            alt={`Cover of ${book.title}`}
            className="w-full rounded-md shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = PLACEHOLDER_COVER
            }}
          />

          <div className="mt-4 rounded-lg border border-[#e5e2dc] bg-[#e5e2dc] p-4 dark:border-[#2a2a2a] dark:bg-[#1a1a1a]">
            <p className={`m-0 text-[0.9rem] font-semibold ${isAvailable ? 'text-[#2d7a4f]' : 'text-[#c0392b]'}`}>
              {isAvailable ? '● Available' : '● Fully Borrowed'}
            </p>
            <p className="m-0 mt-1 text-[0.8rem] text-[#999] dark:text-[#888]">
              {book.availableCopies} of {book.totalCopies} copies available
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <button
              className="w-full cursor-pointer rounded-lg border-0 bg-[#1a4a3a] py-[0.85rem] text-[0.9rem] font-semibold text-white transition-colors hover:enabled:bg-[#2d7a4f] disabled:cursor-not-allowed disabled:bg-[#ccc] disabled:text-[#888]"
              disabled={!isAvailable || borrowed || actionSubmitting}
              onClick={handleBorrowClick}
              aria-label={`Borrow ${book.title}`}
            >
              {actionSubmitting && isAvailable ? 'Working...' : borrowed ? 'Borrowed' : isAvailable ? 'Borrow this Book' : 'Unavailable'}
            </button>

            {!isAvailable && (
              <button
                className="w-full cursor-pointer rounded-lg border border-[#1a4a3a] bg-white py-[0.85rem] text-[0.9rem] font-semibold text-[#1a4a3a] transition-colors hover:enabled:bg-[#eef7f2] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#5ecba1] dark:bg-[#1a1a1a] dark:text-[#5ecba1] dark:hover:enabled:bg-[#20352c]"
                disabled={reserved || actionSubmitting}
                onClick={handleReserveClick}
                aria-label={`Reserve ${book.title}`}
              >
                {actionSubmitting ? 'Working...' : reserved ? 'Reserved' : 'Reserve this Book'}
              </button>
            )}

            {actionError && (
              <p className="m-0 rounded-lg bg-[#fdecea] px-3 py-2 text-[0.78rem] leading-relaxed text-[#b5392b] dark:bg-[#3b1c1a] dark:text-[#ff9388]" role="alert">
                {actionError}
              </p>
            )}

            {actionSuccess && !modalOpen && (
              <p className="m-0 rounded-lg bg-[#eaf5ee] px-3 py-2 text-[0.78rem] leading-relaxed text-[#1a6644] dark:bg-[#1f352b] dark:text-[#5ecba1]" role="status">
                {actionSuccess}
              </p>
            )}

            <button
              className="w-full cursor-pointer rounded-lg border border-[#ccc] bg-white py-[0.85rem] text-[0.9rem] font-semibold text-[#555] transition-colors hover:bg-[#f0f0f0] dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-[#888] dark:hover:bg-[#242424]"
              aria-label={`Share ${book.title}`}
              onClick={handleShare}
            >
              {shareCopied ? '✓ Copied!' : 'Share'}
            </button>

            <button
              className={`w-full cursor-pointer rounded-lg py-[0.85rem] text-[0.9rem] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                isFavorite
                  ? 'border border-[#c0392b] bg-[#fdecea] text-[#b5392b] hover:bg-[#fbdcd8] dark:border-[#7a2b20] dark:bg-[#3b1c1a] dark:text-[#ff9388] dark:hover:bg-[#4a211e]'
                  : 'border border-[#ccc] bg-white text-[#555] hover:bg-[#f0f0f0] dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-[#888] dark:hover:bg-[#242424]'
              }`}
              onClick={handleToggleFavorite}
              disabled={favoriteBusy}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? `Remove ${book.title} from favorites` : `Add ${book.title} to favorites`}
            >
              {isFavorite ? '♥ Favorited' : '♡ Add to Favorites'}
            </button>

            {admin && (
              <button
                className="w-full cursor-pointer rounded-lg border-[1.5px] border-[#1a4a3a] bg-transparent py-[0.85rem] text-[0.9rem] font-semibold text-[#1a4a3a] transition-all hover:bg-[#1a4a3a] hover:text-white"
                aria-label={`Edit ${book.title}`}
                onClick={() => navigate(`/books/edit/${book.id}`)}
              >
                Edit Book
              </button>
            )}
          </div>
        </aside>

        <section className="flex flex-col gap-3 self-stretch">
          <span className="text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[#888] dark:text-[#888]">
            {book.genre}
          </span>

          <h1 className="m-0 text-[1.8rem] font-bold leading-[1.2] text-[#1a1a1a] sm:text-[2.2rem] dark:text-white">
            {book.title}
          </h1>

          <div className="group relative w-fit">
            <p className="m-0 cursor-help text-base text-[#666] underline decoration-dotted underline-offset-4 dark:text-[#888]">
              by {book.author}
            </p>

            <div className="pointer-events-none absolute left-0 top-full z-20 mt-3 w-80 rounded-xl border border-[#e5e2dc] bg-white p-4 text-sm leading-6 text-[#555] opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.14)] transition-all duration-200 group-hover:opacity-100 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-[#bbb]">
              <p className="m-0 mb-2 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#999] dark:text-[#888]">
                Author Biography
              </p>
              <p className="m-0">{authorBiography}</p>
            </div>
          </div>

          <div className="my-2 text-[0.95rem] leading-[1.7] text-[#555] dark:text-[#888]">
            {String(book.description)
              .split('\n\n')
              .map((para, i) => (
                <p key={i}>{para}</p>
              ))}
          </div>

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
              [
                'Rating',
                reviewStats.count > 0
                  ? `⭐ ${reviewStats.average.toFixed(1)} (${reviewStats.count} ${reviewStats.count === 1 ? 'review' : 'reviews'})`
                  : 'Not yet rated',
              ],
              ['Campus', bookCampus === 'both' ? 'Beirut / Byblos' : bookCampus],
            ].map(([label, value]) => (
              <li key={label} className="flex flex-col text-[0.8rem] text-[#999] dark:text-[#888]">
                <span>{label}</span>
                <strong className="mt-[0.15rem] text-[0.9rem] text-[#222] dark:text-white">{value}</strong>
              </li>
            ))}
          </ul>

          <section
            className="mt-6 flex flex-col gap-3 rounded-xl border border-[#e5e2dc] bg-white p-5 dark:border-[#2a2a2a] dark:bg-[#1a1a1a]"
            aria-label="Reading progress tracker"
          >
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

            <div className="relative h-5 w-full">
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
              {progressSaving && 'Saving progress...'}
              {!progressSaving && progress === 0 && 'Not started yet'}
              {!progressSaving && progress > 0 && progress < 100 && `${100 - progress}% left to go`}
              {!progressSaving && progress === 100 && '✓ Finished!'}
            </p>
          </section>
        </section>
      </article>

      <section
        className="mx-auto mt-10 max-w-[1000px] border-t border-[#e5e2dc] px-4 pt-8 sm:px-6 md:mt-12 md:px-8 dark:border-[#333]"
        aria-labelledby="reviews-heading"
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="reviews-heading" className="text-[1.3rem] font-bold text-[#1a1a1a] dark:text-white">
              Reader Reviews
            </h2>
            {reviewStats.count > 0 ? (
              <p className="mt-1 text-[0.85rem] text-[#666] dark:text-[#888]">
                <span className="font-semibold text-[#1a1a1a] dark:text-white">
                  {reviewStats.average.toFixed(1)}
                </span>{' '}
                <span aria-hidden="true">{'★'.repeat(Math.round(reviewStats.average)).padEnd(5, '☆')}</span>{' '}
                from {reviewStats.count} {reviewStats.count === 1 ? 'review' : 'reviews'}
              </p>
            ) : (
              <p className="mt-1 text-[0.85rem] text-[#888] dark:text-[#888]">No reviews yet.</p>
            )}
          </div>
        </div>

        <form
          onSubmit={handleSubmitReview}
          className="mb-8 rounded-xl border border-[#e5e2dc] bg-white p-5 dark:border-[#2a2a2a] dark:bg-[#1a1a1a]"
        >
          <p className="mb-3 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-[#aaa] dark:text-[#888]">
            {myReview ? 'Your review' : isLoggedInUser() ? 'Leave a review' : 'Sign in to leave a review'}
          </p>

          <div className="mb-3 flex items-center gap-1" role="radiogroup" aria-label="Star rating">
            {[1, 2, 3, 4, 5].map((value) => {
              const filled = (reviewHover || reviewRating) >= value
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={reviewRating === value}
                  aria-label={`${value} star${value === 1 ? '' : 's'}`}
                  onClick={() => setReviewRating(value)}
                  onMouseEnter={() => setReviewHover(value)}
                  onMouseLeave={() => setReviewHover(0)}
                  className={`text-2xl leading-none transition ${
                    filled ? 'text-[#e4b028]' : 'text-[#d8d4cd] dark:text-[#3a3a3a]'
                  } hover:scale-110`}
                >
                  {filled ? '★' : '☆'}
                </button>
              )
            })}
            {reviewRating > 0 && (
              <span className="ml-2 text-[0.8rem] text-[#666] dark:text-[#888]">
                {reviewRating}/5
              </span>
            )}
          </div>

          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Share your thoughts (optional)"
            rows={3}
            className="w-full resize-y rounded-md border border-[#e5e2dc] bg-[#fafaf8] p-3 text-[0.9rem] text-[#333] outline-none transition focus:border-[#1a6644] focus:bg-white dark:border-[#2a2a2a] dark:bg-[#121212] dark:text-[#ddd] dark:focus:border-[#5ecba1]"
          />

          {reviewError && (
            <p className="mt-2 text-[0.8rem] text-[#b5392b] dark:text-[#ff9388]" role="alert">
              {reviewError}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={reviewSubmitting}
              className="cursor-pointer rounded-lg bg-[#1a4a3a] px-5 py-[0.65rem] text-[0.85rem] font-semibold text-white transition hover:enabled:bg-[#2d7a4f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {reviewSubmitting ? 'Saving...' : myReview ? 'Update review' : 'Submit review'}
            </button>
            {myReview && (
              <button
                type="button"
                onClick={() => handleDeleteReview(myReview.id)}
                className="text-[0.8rem] font-semibold text-[#b5392b] transition hover:text-[#8a2c20] dark:text-[#ff9388] dark:hover:text-[#ffb5ad]"
              >
                Delete my review
              </button>
            )}
          </div>
        </form>

        {reviewsLoading ? (
          <p className="text-[0.85rem] text-[#888] dark:text-[#888]">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-[0.85rem] text-[#888] dark:text-[#888]">
            Be the first to share your thoughts on this book.
          </p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r) => {
              const date = r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''
              return (
                <li
                  key={r.id}
                  className="rounded-lg border border-[#e5e2dc] bg-white p-4 dark:border-[#2a2a2a] dark:bg-[#1a1a1a]"
                >
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[0.9rem] font-semibold text-[#1a1a1a] dark:text-white">
                        {r.reviewer_name || 'Anonymous'}
                      </span>
                      <span className="text-[0.95rem] text-[#e4b028]" aria-label={`${r.rating} out of 5 stars`}>
                        {'★'.repeat(r.rating)}
                        <span className="text-[#d8d4cd] dark:text-[#3a3a3a]">{'☆'.repeat(5 - r.rating)}</span>
                      </span>
                    </div>
                    {date && (
                      <span className="text-[0.72rem] text-[#aaa] dark:text-[#777]">{date}</span>
                    )}
                  </div>
                  {r.comment && (
                    <p className="text-[0.88rem] leading-[1.6] text-[#555] dark:text-[#bbb]">{r.comment}</p>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

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
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = PLACEHOLDER_COVER
                    }}
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
                  Borrowed Successfully!
                </h2>
                <p className="m-0 text-[0.95rem] leading-[1.6] text-[#555] dark:text-[#888]">
                  You have borrowed <strong>{book.title}</strong>.
                </p>
                <button
                  className="mt-2 rounded-lg border-0 bg-[#1a4a3a] px-5 py-[0.75rem] text-[0.9rem] font-semibold text-white hover:bg-[#2d7a4f]"
                  onClick={handleClose}
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <h2 className="m-0 text-[1.2rem] font-bold text-[#1a1a1a] dark:text-white">
                  Confirm Borrow
                </h2>
                <p className="m-0 text-[0.95rem] leading-[1.6] text-[#555] dark:text-[#888]">
                  Do you want to borrow <strong>{book.title}</strong>?
                </p>
                <div className="mt-2 flex w-full gap-3">
                  <button
                    className="flex-1 rounded-lg border border-[#ccc] bg-white px-4 py-[0.75rem] text-[0.9rem] font-semibold text-[#555] hover:bg-[#f0f0f0] dark:border-[#333] dark:bg-[#1a1a1a] dark:text-[#888] dark:hover:bg-[#2e2e2e]"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 rounded-lg border-0 bg-[#1a4a3a] px-4 py-[0.75rem] text-[0.9rem] font-semibold text-white hover:enabled:bg-[#2d7a4f] disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={handleConfirm}
                    disabled={actionSubmitting}
                  >
                    {actionSubmitting ? 'Borrowing...' : 'Confirm'}
                  </button>
                </div>
                {actionError && (
                  <p className="m-0 mt-3 text-[0.8rem] text-[#b5392b] dark:text-[#ff9388]" role="alert">
                    {actionError}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

