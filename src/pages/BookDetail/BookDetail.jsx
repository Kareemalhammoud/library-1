import styles from './BookDetail.module.css'
import { useParams, useNavigate } from 'react-router-dom'
import { BOOKS } from '@/data/bookData'
import { useState, useEffect, useMemo } from 'react'
import { getCampus, getCopies } from '@/utils/bookUtils'

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Find the book in mock data whose id matches the URL param
  const book = BOOKS.find(b => b.id === parseInt(id))

  // Derive availability info from mock utility functions
  const { total: totalCopies, available: availableCopies } = getCopies(book?.id ?? 0)
  const isAvailable = availableCopies > 0
  const bookCampus = getCampus(book?.id ?? 0)

  // ── Borrow modal state ────────────────────────────────────────────────────────
  // modalOpen: controls whether the modal is visible
  // borrowed:  tracks if the user has confirmed a borrow (disables the button)
  // confirmed: switches the modal from confirmation view to success view
  const [modalOpen,  setModalOpen]  = useState(false)
  const [borrowed,   setBorrowed]   = useState(false)
  const [confirmed,  setConfirmed]  = useState(false)

  // ── Share button state ────────────────────────────────────────────────────────
  // Temporarily shows "✓ Copied!" on the share button after clicking
  const [shareCopied, setShareCopied] = useState(false)

  /** Copies the current page URL to clipboard and shows inline feedback for 2s */
  function handleShare() {
    navigator.clipboard?.writeText(window.location.href)
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 2000)
  }
  const borrowKey = `borrowed-${book.id}`

useEffect(() => {
  setBorrowed(localStorage.getItem(borrowKey) === 'true')
}, [borrowKey])

  /** Opens the borrow modal, resetting confirmed state from any previous session */
  function handleBorrowClick() {
    setConfirmed(false)
    setModalOpen(true)
  }

  /** Called when user clicks "Confirm Borrow" — marks book as borrowed */
  function handleConfirm() {
    setBorrowed(true)
    setConfirmed(true)
    localStorage.setItem(borrowKey, 'true')
  }

  /** Closes the borrow modal */
  function handleClose() {
    setModalOpen(false)
  }

  // If no book matches the URL id, show a not-found fallback
  if (!book) {
    return (
      <main className={styles.notFound}>
        <p>Book not found.</p>
        <button onClick={() => navigate(-1)}>Go back</button>
      </main>
    )
  }

  // ── Related books ─────────────────────────────────────────────────────────────
  // Wrapped in useMemo so the random fallback sort only runs once on mount,
  // not on every re-render triggered by progress slider or other state changes.
  // Dependencies: book.id and book.genre — only recalculates if the book changes.
  const { relatedBooks, relatedTitle } = useMemo(() => {
    const sameGenre = BOOKS.filter(b => b.genre === book.genre && b.id !== book.id)
    const relatedBooks = sameGenre.length >= 2
      ? sameGenre.slice(0, 4)
      : BOOKS.filter(b => b.id !== book.id).sort(() => Math.random() - 0.5).slice(0, 4)
    const relatedTitle = sameGenre.length >= 2 ? `More in ${book.genre}` : 'You might also enjoy'
    return { relatedBooks, relatedTitle }
  }, [book.id, book.genre])

  // ── Reading progress tracker ──────────────────────────────────────────────────
  // Progress is persisted in localStorage so it survives page refreshes.
  // The key is unique per book so each book tracks its own progress independently.
  const storageKey = `reading-progress-${book.id}`
  const [progress, setProgress] = useState(0)

  // On mount (or when the book changes), load saved progress from localStorage
  useEffect(() => {
    setProgress(Number(localStorage.getItem(storageKey) ?? 0))
  }, [storageKey])

  /** Updates progress state and saves it to localStorage on every slider change */
  const handleProgress = (val) => {
    setProgress(val)
    localStorage.setItem(storageKey, val)
  }

  return (
    <div key={id} className={styles.page}>

      {/* ── Breadcrumb nav ── */}
      <nav className={styles.topbar} aria-label="Breadcrumb">
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <span className={styles.breadcrumb}>
          Books / {book.title}
        </span>
      </nav>

      {/* ── Main detail layout: sidebar (cover + actions) + info section ── */}
      <article className={styles.detail}>

        <aside className={styles.sidebar}>
          <img
            src={book.cover}
            alt={`Cover of ${book.title}`}
            className={styles.cover}
          />

          {/* Availability badge derived from mock utility */}
          <div className={styles.availability}>
            <p className={isAvailable ? styles.available : styles.unavailable}>
              {isAvailable ? '● Available' : '● Fully Borrowed'}
            </p>
            <p className={styles.copies}>
              {availableCopies} of {totalCopies} copies available
            </p>
          </div>

          <div className={styles.actions}>
            {/* Borrow button — disabled once borrowed or unavailable */}
            <button
              className={styles.borrowBtn}
              disabled={!isAvailable || borrowed}
              onClick={handleBorrowClick}
              aria-label={`Borrow ${book.title}`}
            >
              {borrowed ? '✓ Borrowed' : isAvailable ? 'Borrow this Book' : 'Unavailable'}
            </button>

            {/* Share button — copies URL and shows inline "✓ Copied!" feedback */}
            <button
              className={styles.shareBtn}
              aria-label={`Share ${book.title}`}
              onClick={handleShare}
            >
              {shareCopied ? '✓ Copied!' : 'Share'}
            </button>

            <button
              className={styles.editBtn}
              aria-label={`Edit ${book.title}`}
              onClick={() => navigate(`/books/${book.id}/edit`)}
            >
              Edit Book
            </button>
          </div>
        </aside>

        {/* ── Book info: title, author, description, meta, progress tracker ── */}
        <section className={styles.info}>
          <span className={styles.genre}>{book.genre}</span>

          <h1 className={styles.title}>{book.title}</h1>
          <p className={styles.author}>by {book.author}</p>

          {/* Split description by double newlines to render as separate paragraphs */}
          <div className={styles.description}>
            {book.description.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <ul className={styles.meta} aria-label="Book details">
            <li><span>Year</span><strong>{book.year}</strong></li>
            <li><span>Pages</span><strong>{book.pages}</strong></li>
            <li><span>Publisher</span><strong>{book.publisher}</strong></li>
            <li><span>ISBN</span><strong>{book.isbn}</strong></li>
            <li><span>Language</span><strong>{book.language === 'FR' ? 'French' : 'English'}</strong></li>
            <li><span>Rating</span><strong>⭐ {book.rating}</strong></li>
          </ul>

          {/* ── Reading Progress Tracker ── */}
          {/* Slider updates both UI state and localStorage on every change */}
          <section className={styles.progressTracker} aria-label="Reading progress tracker">
            <div className={styles.progressHeader}>
              <label htmlFor={`progress-${book.id}`} className={styles.progressLabel}>
                Reading Progress
              </label>
              <span className={styles.progressValue} aria-live="polite">{progress}%</span>
            </div>
            <div
              className={styles.progressBarTrack}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${progress}% complete`}
            >
              <div className={styles.progressBarFill} style={{ width: `${progress}%` }} />
            </div>
            <input
              id={`progress-${book.id}`}
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={e => handleProgress(Number(e.target.value))}
              className={styles.progressSlider}
            />
            <p className={styles.progressHint} aria-live="polite">
              {progress === 0 && 'Not started yet'}
              {progress > 0 && progress < 100 && `${100 - progress}% left to go`}
              {progress === 100 && '✓ Finished!'}
            </p>
          </section>

        </section>

      </article>

      {/* ── Related books section ── */}
      {relatedBooks.length > 0 && (
        <section className={styles.related} aria-label="Related books">
          <h2 className={styles.relatedTitle}>{relatedTitle}</h2>
          <ul className={styles.relatedGrid}>
            {relatedBooks.map(related => (
              <li key={related.id}>
                <button
                  className={styles.relatedCard}
                  onClick={() => navigate(`/books/${related.id}`)}
                  aria-label={`View ${related.title}`}
                >
                  <img
                    src={related.cover}
                    alt={`Cover of ${related.title}`}
                    className={styles.relatedCover}
                  />
                  <p className={styles.relatedBookTitle}>{related.title}</p>
                  <p className={styles.relatedAuthor}>{related.author}</p>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Borrow Modal ── */}
      {/* Clicking the overlay closes the modal; clicking inside stops propagation */}
      {modalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-label="Borrow book"
        >
          <div
            className={styles.modal}
            onClick={e => e.stopPropagation()}
          >
            {/* Switch between confirmation view and success view based on confirmed state */}
            {confirmed ? (
              <>
                <div className={styles.modalIcon}>✓</div>
                <h2 className={styles.modalTitle}>Borrowed Successfully!</h2>
                <p className={styles.modalBody}>
                  <strong>{book.title}</strong> has been added to your loans.
                  Please pick it up from the library desk within 48 hours.
                </p>
                <button className={styles.modalConfirmBtn} onClick={handleClose}>
                  Done
                </button>
              </>
            ) : (
              <>
                <img
                  src={book.cover}
                  alt={`Cover of ${book.title}`}
                  className={styles.modalCover}
                />
                <h2 className={styles.modalTitle}>Borrow this book?</h2>
                <p className={styles.modalBody}>
                  <strong>{book.title}</strong> by {book.author}
                  <br />
                  <span className={styles.modalMeta}>Loan period: 14 days</span>
                </p>
                <div className={styles.modalActions}>
                  <button className={styles.modalCancelBtn} onClick={handleClose}>
                    Cancel
                  </button>
                  <button className={styles.modalConfirmBtn} onClick={handleConfirm}>
                    Confirm Borrow
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