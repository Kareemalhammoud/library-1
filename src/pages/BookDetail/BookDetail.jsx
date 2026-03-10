import styles from './BookDetail.module.css'
import { useParams, useNavigate } from 'react-router-dom'
import { BOOKS } from '@/data/bookData'

export default function BookDetail() {
  const { id } = useParams()
const navigate = useNavigate()
const book = BOOKS.find(b => b.id === parseInt(id))

const totalCopies = 3 + (book?.id % 4)
const borrowedCopies = book?.id % 3
const availableCopies = totalCopies - borrowedCopies
const isAvailable = availableCopies > 0

if (!book) {
  return (
    <main className={styles.notFound}>
      <p>Book not found.</p>
      <button onClick={() => navigate(-1)}>Go back</button>
    </main>
  )
}

  return (
  <div className={styles.page}>

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
  </div>
</aside>

      <section className={styles.info}>
  <span className={styles.genre}>{book.genre}</span>

  <h1 className={styles.title}>{book.title}</h1>
  <p className={styles.author}>by {book.author}</p>

  <p className={styles.description}>{book.description}</p>

  <ul className={styles.meta} aria-label="Book details">
    <li><span>Year</span><strong>{book.year}</strong></li>
    <li><span>Pages</span><strong>{book.pages}</strong></li>
    <li><span>Publisher</span><strong>{book.publisher}</strong></li>
    <li><span>ISBN</span><strong>{book.isbn}</strong></li>
    <li><span>Language</span><strong>{book.language === 'FR' ? 'French' : 'English'}</strong></li>
    <li><span>Rating</span><strong>⭐ {book.rating}</strong></li>
  </ul>
</section>

    </article>
  </div>
)
}