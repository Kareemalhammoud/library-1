import './BookDetail.css'
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

  const [modalOpen,   setModalOpen]   = useState(false)
  const [borrowed,    setBorrowed]    = useState(false)
  const [confirmed,   setConfirmed]   = useState(false)
  const [shareCopied, setShareCopied] = useState(false)

  function getUserPrefix() {
    try {
      const u = JSON.parse(localStorage.getItem('user'))
      return u?.email ? `${u.email}:` : ''
    } catch { return '' }
  }

  function handleShare() {
    navigator.clipboard?.writeText(window.location.href)
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 2000)
  }

  const prefix = getUserPrefix()
  const borrowKey = `${prefix}borrowed-${book?.id}`

  useEffect(() => {
    setBorrowed(!!localStorage.getItem(borrowKey))
  }, [borrowKey])

  function handleBorrowClick() { setConfirmed(false); setModalOpen(true) }
  function handleConfirm() {
    setBorrowed(true)
    setConfirmed(true)
    localStorage.setItem(borrowKey, new Date().toISOString())
  }
  function handleClose() { setModalOpen(false) }

  if (!book) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-[#555]">Book not found.</p>
        <button className="px-4 py-2 border border-[#ccc] rounded-lg text-[0.85rem] cursor-pointer hover:bg-[#eee]" onClick={() => navigate(-1)}>Go back</button>
      </main>
    )
  }

  const { relatedBooks, relatedTitle } = useMemo(() => {
    const sameGenre = BOOKS.filter(b => b.genre === book.genre && b.id !== book.id)
    const relatedBooks = sameGenre.length >= 2
      ? sameGenre.slice(0, 4)
      : BOOKS.filter(b => b.id !== book.id).sort(() => Math.random() - 0.5).slice(0, 4)
    const relatedTitle = sameGenre.length >= 2 ? `More in ${book.genre}` : 'You might also enjoy'
    return { relatedBooks, relatedTitle }
  }, [book.id, book.genre])

  const storageKey = `${prefix}reading-progress-${book.id}`
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setProgress(Number(localStorage.getItem(storageKey) ?? 0))
  }, [storageKey])

  const handleProgress = (val) => {
    setProgress(val)
    localStorage.setItem(storageKey, val)
  }

  return (
    <div key={id} className="bd-page min-h-screen bg-[#f8f7f4] pb-16">

      {/* ── Breadcrumb nav ── */}
      <nav className="bd-topbar flex items-center gap-4 px-8 py-4 border-b border-[#e5e2dc] bg-[#f8f7f4]" aria-label="Breadcrumb">
        <button
          className="bd-back-btn bg-transparent border border-[#ccc] rounded-md px-[0.9rem] py-[0.4rem] cursor-pointer text-[0.85rem] text-[#555] hover:bg-[#eee]"
          onClick={() => navigate(-1)}
        >← Back</button>
        <span className="bd-breadcrumb text-[0.85rem] text-[#999]">Books / {book.title}</span>
      </nav>

      {/* ── Main detail layout ── */}
      <article className="grid gap-12 max-w-[1000px] mx-auto mt-12 px-8 items-start bd-detail-grid">

        <aside className="sticky top-[4.5rem] self-start">
          <img src={book.cover} alt={`Cover of ${book.title}`} className="w-full rounded-md shadow-[0_8px_24px_rgba(0,0,0,0.15)]" />

          {/* Availability badge */}
          <div className="bd-avail-box mt-4 p-4 bg-[#e5e2dc] rounded-lg border border-[#e5e2dc]">
            <p className={`font-semibold text-[0.9rem] m-0 ${isAvailable ? 'text-[#2d7a4f]' : 'text-[#c0392b]'}`}>
              {isAvailable ? '● Available' : '● Fully Borrowed'}
            </p>
            <p className="bd-copies text-[0.8rem] text-[#999] mt-1 m-0">
              {availableCopies} of {totalCopies} copies available
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <button
              className="w-full py-[0.85rem] rounded-lg border-0 bg-[#1a4a3a] text-white text-[0.9rem] font-semibold cursor-pointer transition-colors hover:enabled:bg-[#2d7a4f] disabled:bg-[#ccc] disabled:text-[#888] disabled:cursor-not-allowed"
              disabled={!isAvailable || borrowed}
              onClick={handleBorrowClick}
              aria-label={`Borrow ${book.title}`}
            >
              {borrowed ? '✓ Borrowed' : isAvailable ? 'Borrow this Book' : 'Unavailable'}
            </button>

            <button
              className="bd-share-btn w-full py-[0.85rem] rounded-lg border border-[#ccc] bg-white text-[#555] text-[0.9rem] font-semibold cursor-pointer transition-colors hover:bg-[#f0f0f0]"
              aria-label={`Share ${book.title}`}
              onClick={handleShare}
            >
              {shareCopied ? '✓ Copied!' : 'Share'}
            </button>

          </div>
        </aside>

        {/* ── Book info ── */}
        <section className="flex flex-col gap-3 self-stretch">
          <span className="bd-genre text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[#888]">
            {book.genre}
          </span>

          <h1 className="bd-title text-[2.2rem] font-bold text-[#1a1a1a] leading-[1.2] m-0">
            {book.title}
          </h1>
          <p className="bd-author text-base text-[#666] m-0">by {book.author}</p>

          <div className="bd-description text-[0.95rem] text-[#555] leading-[1.7] my-2">
            {book.description.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
          </div>

          <ul className="bd-meta list-none p-0 mt-2 grid grid-cols-2 gap-x-6 gap-y-[0.6rem] border-t border-[#e5e2dc] pt-4" aria-label="Book details">
            {[
              ['Year', book.year],
              ['Pages', book.pages],
              ['Publisher', book.publisher],
              ['ISBN', book.isbn],
              ['Language', book.language === 'FR' ? 'French' : 'English'],
              ['Rating', `⭐ ${book.rating}`],
            ].map(([label, value]) => (
              <li key={label} className="bd-meta-item flex flex-col text-[0.8rem] text-[#999]">
                <span>{label}</span>
                <strong className="bd-meta-value text-[#222] text-[0.9rem] mt-[0.15rem]">{value}</strong>
              </li>
            ))}
          </ul>

          {/* ── Reading Progress Tracker ── */}
          <section className="bd-progress-tracker mt-6 p-5 border border-[#e5e2dc] rounded-xl bg-white flex flex-col gap-3" aria-label="Reading progress tracker">
            <div className="flex justify-between items-baseline">
              <label htmlFor={`progress-${book.id}`} className="bd-progress-label text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#aaa]">
                Reading Progress
              </label>
              <span className="bd-progress-value text-[1.6rem] font-extrabold text-[#1a1a1a] leading-none tracking-tight" aria-live="polite">
                {progress}%
              </span>
            </div>

            <div className="bd-progress-track w-full h-2 bg-[#f0ede8] rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${progress}% complete`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#2d7a4f] to-[#1a4a3a] transition-[width] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <input
              id={`progress-${book.id}`}
              type="range" min="0" max="100" value={progress}
              onChange={e => handleProgress(Number(e.target.value))}
              className="bd-progress-slider w-full cursor-pointer m-0 h-1 bg-transparent outline-none appearance-none"
            />

            <p className="bd-progress-hint text-[0.78rem] text-[#bbb] m-0 italic" aria-live="polite">
              {progress === 0 && 'Not started yet'}
              {progress > 0 && progress < 100 && `${100 - progress}% left to go`}
              {progress === 100 && '✓ Finished!'}
            </p>
          </section>
        </section>
      </article>

      {/* ── Related books ── */}
      {relatedBooks.length > 0 && (
        <section className="bd-related max-w-[1000px] mx-auto mt-12 px-8 border-t border-[#e5e2dc] pt-8" aria-label="Related books">
          <h2 className="bd-related-title text-[1.3rem] font-bold text-[#1a1a1a] mb-6">{relatedTitle}</h2>
          <ul className="list-none p-0 m-0 grid grid-cols-4 gap-6">
            {relatedBooks.map(related => (
              <li key={related.id}>
                <button className="bg-transparent border-0 cursor-pointer text-left p-0 w-full group" onClick={() => navigate(`/books/${related.id}`)} aria-label={`View ${related.title}`}>
                  <img src={related.cover} alt={`Cover of ${related.title}`} className="w-full aspect-[2/3] object-cover rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-transform duration-200 group-hover:-translate-y-1" />
                  <p className="bd-related-book-title text-[0.85rem] font-semibold text-[#1a1a1a] mt-[0.6rem] mb-[0.2rem]">{related.title}</p>
                  <p className="bd-related-author text-[0.75rem] text-[#888] m-0">{related.author}</p>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Borrow Modal ── */}
      {modalOpen && (
        <div className="bd-modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={handleClose} role="dialog" aria-modal="true" aria-label="Borrow book">
          <div className="bd-modal bg-white rounded-2xl p-8 max-w-[400px] w-full flex flex-col items-center gap-4 shadow-[0_24px_60px_rgba(0,0,0,0.2)] text-center" onClick={e => e.stopPropagation()}>
            {confirmed ? (
              <>
                <div className="w-14 h-14 rounded-full bg-[#2d7a4f] text-white text-2xl flex items-center justify-center">✓</div>
                <h2 className="bd-modal-title text-[1.2rem] font-bold text-[#1a1a1a] m-0">Borrowed Successfully!</h2>
                <p className="bd-modal-body text-[0.9rem] text-[#555] m-0 leading-[1.6]">
                  <strong>{book.title}</strong> has been added to your loans. Please pick it up from the library desk within 48 hours.
                </p>
                <button className="flex-1 w-full py-3 rounded-lg border-0 bg-[#1a4a3a] text-white text-[0.9rem] font-semibold cursor-pointer transition-colors hover:bg-[#2d7a4f]" onClick={handleClose}>Done</button>
              </>
            ) : (
              <>
                <img src={book.cover} alt={`Cover of ${book.title}`} className="w-[100px] aspect-[2/3] object-cover rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.15)]" />
                <h2 className="bd-modal-title text-[1.2rem] font-bold text-[#1a1a1a] m-0">Borrow this book?</h2>
                <p className="bd-modal-body text-[0.9rem] text-[#555] m-0 leading-[1.6]">
                  <strong>{book.title}</strong> by {book.author}
                  <br />
                  <span className="text-[0.8rem] text-[#aaa] mt-1 block">Loan period: 14 days</span>
                </p>
                <div className="flex gap-3 w-full mt-2">
                  <button className="bd-modal-cancel flex-1 py-3 rounded-lg border border-[#e0ddd8] bg-white text-[#555] text-[0.9rem] font-semibold cursor-pointer transition-colors hover:bg-[#f5f3ef]" onClick={handleClose}>Cancel</button>
                  <button className="flex-1 py-3 rounded-lg border-0 bg-[#1a4a3a] text-white text-[0.9rem] font-semibold cursor-pointer transition-colors hover:bg-[#2d7a4f]" onClick={handleConfirm}>Confirm Borrow</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}