import styles from './Home.module.css'
import { useLayoutEffect, useRef, useState, useEffect } from 'react'

import slideCampusGarden from '@/assets/0.jpg'
import slideCampusBench from '@/assets/487281962_1086257190198525_229767219208838718_n.jpg'
import slideCampusFountain from '@/assets/lebanese-american-university-lau_1153.jpg'

const HERO_SLIDES = [
  { src: slideCampusGarden, alt: 'LAU Beirut campus historic stone buildings and gardens' },
  { src: slideCampusBench, alt: 'Students under the old banyan tree on LAU Beirut campus' },
  { src: slideCampusFountain, alt: 'LAU Beirut campus fountain and palm trees' },
]

// cover: Open Library public covers API — falls back to the gradient if the image 404s.
// Swap any URL for local artwork: import img from '@/assets/...' and reference it here.
const BOOKS = [
  {
    id: 0, color: 'terracotta', genreColor: '#B75A4A',
    genre: 'Fiction', title: 'The Midnight Library', author: 'Matt Haig',
    badge: 'Reader Favorite',
    cover: 'https://covers.openlibrary.org/b/isbn/9780525559474-L.jpg',
  },
  {
    id: 1, color: 'navy', genreColor: '#4A6EA3',
    genre: 'History', title: 'Sapiens', author: 'Yuval Noah Harari',
    cover: 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg',
  },
  {
    id: 2, color: 'sage', genreColor: '#44785E',
    genre: 'Mystery', title: 'The Name of the Rose', author: 'Umberto Eco',
    cover: 'https://covers.openlibrary.org/b/isbn/9780156001311-L.jpg',
  },
  {
    id: 3, color: 'gold', genreColor: '#987432',
    genre: 'Psychology', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman',
    badge: 'New Arrival',
    cover: 'https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg',
  },
  {
    id: 4, color: 'slate', genreColor: '#5C7098',
    genre: 'Classic', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald',
    cover: 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg',
  },
  {
    id: 5, color: 'burgundy', genreColor: '#8B3A52',
    genre: 'Philosophy', title: 'Meditations', author: 'Marcus Aurelius',
    cover: 'https://covers.openlibrary.org/b/isbn/9780812968255-L.jpg',
  },
  {
    id: 6, color: 'forest', genreColor: '#3D6B4A',
    genre: 'Science', title: 'A Brief History of Time', author: 'Stephen Hawking',
    cover: 'https://covers.openlibrary.org/b/isbn/9780553380163-L.jpg',
  },
  {
    id: 7, color: 'copper', genreColor: '#9B5E3A',
    genre: 'Travel', title: 'In Patagonia', author: 'Bruce Chatwin',
    cover: 'https://covers.openlibrary.org/b/isbn/9780140118506-L.jpg',
  },
  {
    id: 8, color: 'indigo', genreColor: '#4A4E8C',
    genre: 'Science Fiction', title: 'Dune', author: 'Frank Herbert',
    badge: 'Reader Favorite',
    cover: 'https://covers.openlibrary.org/b/isbn/9780441013593-L.jpg',
  },
  {
    id: 9, color: 'rose', genreColor: '#8B3A5E',
    genre: 'Biography', title: 'Long Walk to Freedom', author: 'Nelson Mandela',
    cover: 'https://covers.openlibrary.org/b/isbn/9780316548182-L.jpg',
  },
  {
    id: 10, color: 'amber', genreColor: '#8C6A1E',
    genre: 'Art', title: 'The Story of Art', author: 'E.H. Gombrich',
    cover: 'https://covers.openlibrary.org/b/isbn/9780714832470-L.jpg',
  },
  {
    id: 11, color: 'teal', genreColor: '#2E7080',
    genre: 'Classic', title: 'Crime & Punishment', author: 'Fyodor Dostoevsky',
    cover: 'https://covers.openlibrary.org/b/isbn/9780140449136-L.jpg',
  },
  {
    id: 12, color: 'plum', genreColor: '#6B3A82',
    genre: 'Poetry', title: 'Leaves of Grass', author: 'Walt Whitman',
    badge: 'New Arrival',
    cover: 'https://covers.openlibrary.org/b/isbn/9780199535521-L.jpg',
  },
  {
    id: 13, color: 'olive', genreColor: '#5E6B2E',
    genre: 'Nature', title: 'Walden', author: 'Henry David Thoreau',
    cover: 'https://covers.openlibrary.org/b/isbn/9780691163611-L.jpg',
  },
  {
    id: 14, color: 'crimson', genreColor: '#8B2E2E',
    genre: 'Epic', title: 'The Iliad', author: 'Homer',
    cover: 'https://covers.openlibrary.org/b/isbn/9780140275360-L.jpg',
  },
]

// Gap in px — must match CSS .booksTrack gap (2rem at 16px root = 32px)
const GAP_PX = 32
const N = BOOKS.length

// Double the list so the CSS animation can scroll one full set and loop seamlessly
const TRACK = [...BOOKS, ...BOOKS]

// Scroll speed in px/s — constant across breakpoints so the shelf always
// feels the same regardless of card size
const PX_PER_SEC = 55

// Fixed card widths per breakpoint
function getCardWidth(viewportWidth) {
  if (viewportWidth < 480) return 112
  if (viewportWidth < 768) return 132
  return 158
}

function Home() {
  const viewportRef = useRef(null)
  const trackRef    = useRef(null)
  const animRef     = useRef(null) // Web Animations API Animation object

  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setCurrentSlide(c => (c + 1) % HERO_SLIDES.length), 7000)
    return () => clearInterval(id)
  }, [])

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const track    = trackRef.current
    if (!viewport || !track) return

    const start = () => {
      const cw   = getCardWidth(viewport.offsetWidth)
      const dist = N * (cw + GAP_PX)          // one seamless loop = N × (card + gap)
      const dur  = (dist / PX_PER_SEC) * 1000 // ms

      // Size every card
      Array.from(track.children).forEach(card => {
        card.style.flexBasis = `${cw}px`
      })

      // Cancel any previous animation (e.g. after a resize) and start fresh
      animRef.current?.cancel()
      animRef.current = track.animate(
        [{ transform: 'translateX(0)' }, { transform: `translateX(-${dist}px)` }],
        { duration: dur, iterations: Infinity, easing: 'linear' }
      )
    }

    const pause  = () => animRef.current?.pause()
    const resume = () => animRef.current?.play()

    start()
    viewport.addEventListener('mouseenter', pause)
    viewport.addEventListener('mouseleave', resume)
    window.addEventListener('resize', start)

    return () => {
      animRef.current?.cancel()
      viewport.removeEventListener('mouseenter', pause)
      viewport.removeEventListener('mouseleave', resume)
      window.removeEventListener('resize', start)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        {HERO_SLIDES.map((slide, i) => (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            className={`${styles.heroImage} ${i === currentSlide ? styles.heroImageActive : ''}`}
          />
        ))}

        {/* Upcoming event chip — right side */}
        <div className={styles.heroEvent}>
          <div className={styles.heroEventHeader}>
            <svg className={styles.heroEventIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className={styles.heroEventLabel}>Upcoming Event</span>
          </div>
          <p className={styles.heroEventTitle}>Research Skills Workshop</p>
          <p className={styles.heroEventMeta}>Wed, Mar 12 &nbsp;·&nbsp; 2:00 – 4:00 PM</p>
          <p className={styles.heroEventLocation}>Riyad Nassar Library, Beirut</p>
        </div>

        {/* Floating card overlay */}
        <div className={styles.heroCard}>
          <p className={styles.heroCardEyebrow}>Riyad Nassar Library</p>
          <h1 className={styles.heroCardTitle}>
           Your Next Discovery Starts Here!
          </h1>
          <p className={styles.heroCardBody}>
           Spend time with a great book, join events, and share ideas with your community.
          </p>

          <div className={styles.heroSearch}>
            <svg className={styles.heroSearchIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M16.5 16.5 L21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <input
              className={styles.heroSearchInput}
              type="search"
              placeholder="Search books, authors, or subjects…"
              aria-label="Search the library catalog"
            />
          </div>

          <div className={styles.heroCardActions}>
            <button className={styles.btnPrimary}>Get Started</button>
            <button className={styles.btnGhost}>Learn More</button>
          </div>
        </div>
      </section>

      {/* ── Community stats — real LAU figures from Academic Catalog 2025–26 ── */}
      <div className={styles.stats}>
        <div className={styles.statBlock}>
          {/* Book icon */}
          <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 19V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M4 19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M4 19a2 2 0 0 1 2-2h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M9 8h6M9 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className={styles.statValue}>1.1M+</span>
          <span className={styles.statLabel}>Library Resources</span>
        </div>
        <span className={styles.statDivider} />
        <div className={styles.statBlock}>
          {/* Database/stack icon */}
          <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="12" cy="6" rx="8" ry="3" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M4 6v4c0 1.657 3.582 3 8 3s8-1.343 8-3V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M4 10v4c0 1.657 3.582 3 8 3s8-1.343 8-3v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className={styles.statValue}>185</span>
          <span className={styles.statLabel}>Online Databases</span>
        </div>
        <span className={styles.statDivider} />
        <div className={styles.statBlock}>
          {/* Users icon */}
          <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 20c0-2.21-2.239-4-5-4s-5 1.79-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M23 20c0-1.863-1.571-3.45-3.75-3.875" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M18 6.25A3 3 0 0 1 18 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className={styles.statValue}>8,000+</span>
          <span className={styles.statLabel}>Students Served</span>
        </div>
        <span className={styles.statDivider} />
        <div className={styles.statBlock}>
          {/* Desk/chair icon */}
          <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 14h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M5 14V9a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M6 14v3M18 14v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M9 8V6M15 8V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className={styles.statValue}>517+</span>
          <span className={styles.statLabel}>Reading Seats</span>
        </div>
      </div>

      {/* ── Quick actions ── */}
      <section className={styles.actions}>
        <div className={styles.actionsHeader}>
          <h2 className={styles.actionsTitle}>Explore the Library</h2>
          <p className={styles.actionsSubtitle}>Browse collections, join events, find study spaces, and plan your visit.</p>
        </div>
        <div className={styles.actionsGrid}>

          <div className={styles.actionCard}>
            <svg className={styles.actionIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 19V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M4 19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M4 19a2 2 0 0 1 2-2h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M9 8h6M9 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p className={styles.actionCardEyebrow}>Collections & Archives</p>
            <div className={styles.actionCardHeader}>
              <h3 className={styles.actionCardTitle}>Find Your Next Book</h3>
              <span className={styles.actionArrow}>→</span>
            </div>
            <p className={styles.actionCardBody}>Search thousands of titles and discover something new to read.</p>
            <p className={styles.actionCardDetail}>500,000+ items available</p>
          </div>

          <div className={styles.actionCard}>
            <svg className={styles.actionIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M7 14h2M11 14h2M15 14h2M7 17.5h2M11 17.5h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p className={styles.actionCardEyebrow}>What's On</p>
            <div className={styles.actionCardHeader}>
              <h3 className={styles.actionCardTitle}>Join an Event</h3>
              <span className={styles.actionArrow}>→</span>
            </div>
            <p className={styles.actionCardBody}>Attend talks, workshops, and activities happening at the library.</p>
            <p className={styles.actionCardDetail}>View this week's schedule</p>
          </div>

          <div className={styles.actionCard}>
            <svg className={styles.actionIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 14h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M5 14V9a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M6 14v3M18 14v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M9 8V6M15 8V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p className={styles.actionCardEyebrow}>Spaces & Facilities</p>
            <div className={styles.actionCardHeader}>
              <h3 className={styles.actionCardTitle}>Discover Study Spaces</h3>
              <span className={styles.actionArrow}>→</span>
            </div>
            <p className={styles.actionCardBody}>Find quiet areas and comfortable places to focus and work.</p>
            <p className={styles.actionCardDetail}>Reserve a space in advance</p>
          </div>

          <div className={styles.actionCard}>
            <svg className={styles.actionIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 12 6 12s6-7.582 6-12c0-3.314-2.686-6-6-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <p className={styles.actionCardEyebrow}>Visitor Information</p>
            <div className={styles.actionCardHeader}>
              <h3 className={styles.actionCardTitle}>Plan Your Visit</h3>
              <span className={styles.actionArrow}>→</span>
            </div>
            <p className={styles.actionCardBody}>Check opening hours, location, and visitor information.</p>
            <p className={styles.actionCardDetail}>Mon–Fri 9am–8pm · Sat–Sun 10am–5pm</p>
          </div>

        </div>
      </section>

      {/* ── Staff Picks ── */}
      <section className={styles.featured}>
        <div className={styles.featuredHeader}>
          <div>
            <h2 className={styles.featuredTitle}>Staff Picks</h2>
            <p className={styles.featuredSubtitle}>Discover a selection of titles to inspire your next visit.</p>
          </div>
          <div className={styles.carouselControls}>
            <a className={styles.featuredViewAll} href="#">View all collections</a>
          </div>
        </div>

        <div className={styles.booksViewport} ref={viewportRef}>
          <div className={styles.booksTrack} ref={trackRef}>
            {TRACK.map((book, i) => (
              <div
                key={i}
                className={styles.bookCard}
              >
                <div className={styles.bookCover} data-color={book.color}>
                  {book.cover && (
                    <img
                      src={book.cover}
                      alt={book.title}
                      className={styles.bookCoverImg}
                      onError={e => { e.currentTarget.style.display = 'none' }}
                    />
                  )}
                  <span className={styles.bookSpine} />
                  {book.badge && <span className={styles.bookBadge}>{book.badge}</span>}
                </div>
                <div className={styles.bookMeta}>
                  <span className={styles.bookGenre} style={{ color: book.genreColor }}>
                    {book.genre}
                  </span>
                  <h3 className={styles.bookTitle}>{book.title}</h3>
                  <p className={styles.bookAuthor}>{book.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
