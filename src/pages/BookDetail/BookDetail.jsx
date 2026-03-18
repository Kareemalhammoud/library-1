import styles from './BookDetail.module.css'
import { useParams, useNavigate } from 'react-router-dom'
import { BOOKS } from '@/data/bookData'
import { useState, useEffect, useMemo } from 'react'
import { getCampus, getCopies } from '@/utils/bookUtils'

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const book = BOOKS.find(b => b.id === parseInt(id))

  const { total: totalCopies, available: availableCopies } = getCopies(book?.id ?? 0)
  const isAvailable = availableCopies > 0
  const bookCampus = getCampus(book?.id ?? 0)

  if (!book) {
    return (
      <main className={styles.notFound}>
        <p>Book not found.</p>
        <button onClick={() => navigate(-1)}>Go back</button>
      </main>
    )
  }

  // Memoized so the random fallback only runs once, not on every state change
  const { relatedBooks, relatedTitle } = useMemo(() => {
    const sameGenre = BOOKS.filter(b => b.genre === book.genre && b.id !== book.id)
    const relatedBooks = sameGenre.length >= 2
      ? sameGenre.slice(0, 4)
      : BOOKS.filter(b => b.id !== book.id).sort(() => Math.random() - 0.5).slice(0, 4)
    const relatedTitle = sameGenre.length >= 2 ? `More in ${book.genre}` : 'You might also enjoy'
    return { relatedBooks, relatedTitle }
  }, [book.id, book.genre])

  const storageKey = `reading-progress-${book.id}`
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setProgress(Number(localStorage.getItem(storageKey) ?? 0))
  }, [storageKey])

  const handleProgress = (val) => {
    setProgress(val)
    localStorage.setItem(storageKey, val)
  }

  return (
    <div key={id} className={styles.page}>

      <nav className={styles.topbar} aria-label="Breadcrumb">
        <button
          className={styles.backBtn}
          onClick={() => navigate(-1)}
        > ← Back
        </button>
        <span className={styles.breadcrumb}>
          Books / {book.title}
        </span>
      </nav>

      <article className={styles.detail}>

        <aside className={styles.sidebar}>
          <img
            src={book.cover}
            alt={`Cover of ${book.title}`}
            className={styles.cover}
          />

          <div className={styles.availability}>
            <p className={isAvailable ? styles.available : styles.unavailable}>
              {isAvailable ? '● Available' : '● Fully Borrowed'}
            </p>
            <p className={styles.copies}>
              {availableCopies} of {totalCopies} copies available
            </p>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.borrowBtn}
              disabled={!isAvailable}
              aria-label={`Borrow ${book.title}`}
            >
              {isAvailable ? 'Borrow this Book' : 'Unavailable'}
            </button>

            <button
              className={styles.shareBtn}
              aria-label={`Share ${book.title}`}
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
            >
              Share
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

        <section className={styles.info}>
          <span className={styles.genre}>{book.genre}</span>

          <h1 className={styles.title}>{book.title}</h1>
          <p className={styles.author}>by {book.author}</p>

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

          {/* Reading Progress Tracker */}
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

    </div>
  )
}