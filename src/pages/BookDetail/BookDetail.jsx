import { useParams, useNavigate } from 'react-router-dom'
import { BOOKS } from '@/data/bookData'
import { useState, useEffect, useMemo } from 'react'
import { getCampus, getCopies } from '@/utils/bookUtils'

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const book = BOOKS.find((b) => b.id === parseInt(id))
  const { total: totalCopies, available: availableCopies } = getCopies(book?.id ?? 0)
  const isAvailable = availableCopies > 0
  const bookCampus = getCampus(book?.id ?? 0)

  const [modalOpen, setModalOpen] = useState(false)
  const [borrowed, setBorrowed] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)

  function handleShare() {
    navigator.clipboard?.writeText(window.location.href)
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 2000)
  }

  const borrowKey = `borrowed-${book?.id}`
  const loanKey = `loan-${book?.id}`

  useEffect(() => {
    const savedLoan = localStorage.getItem(loanKey)
    setBorrowed(Boolean(savedLoan) || localStorage.getItem(borrowKey) === 'true')
  }, [borrowKey, loanKey])

  function handleBorrowClick() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

    if (!isLoggedIn) {
      navigate('/login', { state: { from: `/books/${book.id}` } })
      return
    }

    setConfirmed(false)
    setModalOpen(true)
  }

  function handleConfirm() {
    const borrowedAt = new Date()
    const dueAt = new Date(borrowedAt)
    dueAt.setDate(dueAt.getDate() + 14)

    setBorrowed(true)
    setConfirmed(true)
    localStorage.setItem(borrowKey, 'true')
    localStorage.setItem(
      loanKey,
      JSON.stringify({
        bookId: book.id,
        borrowedAt: borrowedAt.toISOString(),
        dueAt: dueAt.toISOString(),
      })
    )
  }

  function handleClose() {
    setModalOpen(false)
  }

  if (!book) {
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

  const { relatedBooks, relatedTitle } = useMemo(() => {
    const sameGenre = BOOKS.filter((b) => b.genre === book.genre && b.id !== book.id)
    const nextRelatedBooks =
      sameGenre.length >= 2
        ? sameGenre.slice(0, 4)
        : BOOKS.filter((b) => b.id !== book.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 4)
    const nextRelatedTitle = sameGenre.length >= 2 ? `More in ${book.genre}` : 'You might also enjoy'

    return { relatedBooks: nextRelatedBooks, relatedTitle: nextRelatedTitle }
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
    <div key={id} className="min-h-screen bg-[#f8f7f4] pb-16 dark:bg-[#1a1a1a]">
      <nav
        className="flex items-center gap-4 border-b border-[#e5e2dc] bg-[#f8f7f4] px-8 py-4 dark:border-[#2e2e2e] dark:bg-[#1a1a1a]"
        aria-label="Breadcrumb"
      >
        <button
          className="cursor-pointer rounded-md border border-[#ccc] bg-transparent px-[0.9rem] py-[0.4rem] text-[0.85rem] text-[#555] hover:bg-[#eee] dark:border-[#3a3a3a] dark:text-[#aaa] dark:hover:bg-[#2a2a2a]"
          onClick={() => navigate(-1)}
        >
          {'\u2190'} Back
        </button>
        <span className="text-[0.85rem] text-[#999] dark:text-[#555]">Books / {book.title}</span>
      </nav>

      <article className="mx-auto mt-12 grid max-w-[1000px] items-start gap-12 px-8 [grid-template-columns:280px_1fr]">
        <aside className="sticky top-[4.5rem] self-start">
          <img
            src={book.cover}
            alt={`Cover of ${book.title}`}
            className="w-full rounded-md shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
          />

          <div className="mt-4 rounded-lg border border-[#e5e2dc] bg-[#e5e2dc] p-4 dark:border-[#2e2e2e] dark:bg-[#252525]">
            <p className={`m-0 text-[0.9rem] font-semibold ${isAvailable ? 'text-[#2d7a4f]' : 'text-[#c0392b]'}`}>
              {isAvailable ? '\u25CF Available' : '\u25CF Fully Borrowed'}
            </p>
            <p className="m-0 mt-1 text-[0.8rem] text-[#999] dark:text-[#555]">
              {availableCopies} of {totalCopies} copies available
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <button
              className="w-full cursor-pointer rounded-lg border-0 bg-[#1a4a3a] py-[0.85rem] text-[0.9rem] font-semibold text-white transition-colors hover:enabled:bg-[#2d7a4f] disabled:cursor-not-allowed disabled:bg-[#ccc] disabled:text-[#888]"
              disabled={!isAvailable || borrowed}
              onClick={handleBorrowClick}
              aria-label={`Borrow ${book.title}`}
            >
              {borrowed ? '\u2713 Borrowed' : isAvailable ? 'Borrow this Book' : 'Unavailable'}
            </button>

            <button
              className="w-full cursor-pointer rounded-lg border border-[#ccc] bg-white py-[0.85rem] text-[0.9rem] font-semibold text-[#555] transition-colors hover:bg-[#f0f0f0] dark:border-[#3a3a3a] dark:bg-[#2a2a2a] dark:text-[#aaa] dark:hover:bg-[#333]"
              aria-label={`Share ${book.title}`}
              onClick={handleShare}
            >
              {shareCopied ? '\u2713 Copied!' : 'Share'}
            </button>

            <button
              className="w-full cursor-pointer rounded-lg border-[1.5px] border-[#1a4a3a] bg-transparent py-[0.85rem] text-[0.9rem] font-semibold text-[#1a4a3a] transition-all hover:bg-[#1a4a3a] hover:text-white"
              aria-label={`Edit ${book.title}`}
              onClick={() => navigate(`/books/${book.id}/edit`)}
            >
              Edit Book
            </button>
          </div>
        </aside>

        <section className="flex flex-col gap-3 self-stretch">
          <span className="text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[#888] dark:text-[#666]">
            {book.genre}
          </span>

          <h1 className="m-0 text-[2.2rem] font-bold leading-[1.2] text-[#1a1a1a] dark:text-[#f0ede8]">
            {book.title}
          </h1>
          <p className="m-0 text-base text-[#666] dark:text-[#888]">by {book.author}</p>

          <div className="my-2 text-[0.95rem] leading-[1.7] text-[#555] dark:text-[#999]">
            {book.description.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <ul
            className="mt-2 grid list-none grid-cols-2 gap-x-6 gap-y-[0.6rem] border-t border-[#e5e2dc] p-0 pt-4 dark:border-[#2e2e2e]"
            aria-label="Book details"
          >
            {[
              ['Year', book.year],
              ['Pages', book.pages],
              ['Publisher', book.publisher],
              ['ISBN', book.isbn],
              ['Language', book.language === 'FR' ? 'French' : 'English'],
              ['Rating', `\u2B50 ${book.rating}`],
              ['Campus', bookCampus === 'both' ? 'Beirut / Byblos' : bookCampus],
            ].map(([label, value]) => (
              <li key={label} className="flex flex-col text-[0.8rem] text-[#999] dark:text-[#555]">
                <span>{label}</span>
                <strong className="mt-[0.15rem] text-[0.9rem] text-[#222] dark:text-[#d0cdc8]">{value}</strong>
              </li>
            ))}
          </ul>

          <section
            className="mt-6 flex flex-col gap-3 rounded-xl border border-[#e5e2dc] bg-white p-5 dark:border-[#2e2e2e] dark:bg-[#222]"
            aria-label="Reading progress tracker"
          >
            <div className="flex items-baseline justify-between">
              <label
                htmlFor={`progress-${book.id}`}
                className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#aaa] dark:text-[#555]"
              >
                Reading Progress
              </label>
              <span
                className="text-[1.6rem] font-extrabold leading-none tracking-tight text-[#1a1a1a] dark:text-[#f0ede8]"
                aria-live="polite"
              >
                {progress}%
              </span>
            </div>

            <div
              className="h-2 w-full overflow-hidden rounded-full bg-[#f0ede8] dark:bg-[#2a2a2a]"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${progress}% complete`}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#2d7a4f] to-[#1a4a3a] transition-[width] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
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
              className="m-0 h-1 w-full cursor-pointer appearance-none bg-transparent outline-none accent-[#1a4a3a] dark:accent-[#2d7a4f] [&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[#1a4a3a] dark:[&::-moz-range-thumb]:border-[#1a1a1a] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#1a4a3a] [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_#ccc,0_2px_6px_rgba(0,0,0,0.2)] hover:[&::-webkit-slider-thumb]:scale-[1.2] hover:[&::-webkit-slider-thumb]:shadow-[0_0_0_1px_#999,0_4px_10px_rgba(0,0,0,0.25)] dark:[&::-webkit-slider-thumb]:border-[#1a1a1a]"
            />

            <p className="m-0 text-[0.78rem] italic text-[#bbb] dark:text-[#555]" aria-live="polite">
              {progress === 0 && 'Not started yet'}
              {progress > 0 && progress < 100 && `${100 - progress}% left to go`}
              {progress === 100 && '\u2713 Finished!'}
            </p>
          </section>
        </section>
      </article>

      {relatedBooks.length > 0 && (
        <section
          className="mx-auto mt-12 max-w-[1000px] border-t border-[#e5e2dc] px-8 pt-8 dark:border-[#2e2e2e]"
          aria-label="Related books"
        >
          <h2 className="mb-6 text-[1.3rem] font-bold text-[#1a1a1a] dark:text-[#f0ede8]">{relatedTitle}</h2>
          <ul className="m-0 grid list-none grid-cols-4 gap-6 p-0">
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
                  <p className="mb-[0.2rem] mt-[0.6rem] text-[0.85rem] font-semibold text-[#1a1a1a] dark:text-[#f0ede8]">
                    {related.title}
                  </p>
                  <p className="m-0 text-[0.75rem] text-[#888] dark:text-[#666]">{related.author}</p>
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
            className="flex w-full max-w-[400px] flex-col items-center gap-4 rounded-2xl bg-white p-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.2)] dark:bg-[#222]"
            onClick={(e) => e.stopPropagation()}
          >
            {confirmed ? (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2d7a4f] text-2xl text-white">
                  {'\u2713'}
                </div>
                <h2 className="m-0 text-[1.2rem] font-bold text-[#1a1a1a] dark:text-[#f0ede8]">
                  Borrowed Successfully!
                </h2>
                <p className="m-0 text-[0.9rem] leading-[1.6] text-[#555] dark:text-[#999]">
                  <strong>{book.title}</strong> has been added to your loans. Please pick it up from the library desk
                  within 48 hours.
                </p>
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
                <h2 className="m-0 text-[1.2rem] font-bold text-[#1a1a1a] dark:text-[#f0ede8]">Borrow this book?</h2>
                <p className="m-0 text-[0.9rem] leading-[1.6] text-[#555] dark:text-[#999]">
                  <strong>{book.title}</strong> by {book.author}
                  <br />
                  <span className="mt-1 block text-[0.8rem] text-[#aaa]">Loan period: 14 days</span>
                </p>
                <div className="mt-2 flex w-full gap-3">
                  <button
                    className="flex-1 cursor-pointer rounded-lg border border-[#e0ddd8] bg-white py-3 text-[0.9rem] font-semibold text-[#555] transition-colors hover:bg-[#f5f3ef] dark:border-[#3a3a3a] dark:bg-[#2a2a2a] dark:text-[#aaa] dark:hover:bg-[#333]"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 cursor-pointer rounded-lg border-0 bg-[#1a4a3a] py-3 text-[0.9rem] font-semibold text-white transition-colors hover:bg-[#2d7a4f]"
                    onClick={handleConfirm}
                  >
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
