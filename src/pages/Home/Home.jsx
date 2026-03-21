import styles from './Home.module.css'
import { useLayoutEffect, useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BOOKS } from '@/data/bookData'
import slideCampusGarden from '@/assets/0.jpg'
import slideCampusBench from '@/assets/487281962_1086257190198525_229767219208838718_n.jpg'
import slideCampusFountain from '@/assets/lebanese-american-university-lau_1153.jpg'

const HERO_SLIDES = [
  { src: slideCampusGarden, alt: 'LAU Beirut campus historic stone buildings and gardens' },
  { src: slideCampusBench, alt: 'Students under the old banyan tree on LAU Beirut campus' },
  { src: slideCampusFountain, alt: 'LAU Beirut campus fountain and palm trees' },
]

const GAP_PX = 32
const N = BOOKS.length
const TRACK = [...BOOKS, ...BOOKS]
const PX_PER_SEC = 55

function getCardWidth(viewportWidth) {
  if (viewportWidth < 480) return 112
  if (viewportWidth < 768) return 132
  return 158
}

function Home() {
  const viewportRef = useRef(null)
  const trackRef    = useRef(null)
  const animRef     = useRef(null)
  const navigate = useNavigate()
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
      const dist = N * (cw + GAP_PX)
      const dur  = (dist / PX_PER_SEC) * 1000

      Array.from(track.children).forEach(card => {
        card.style.flexBasis = `${cw}px`
      })

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
      <main>
      <section className={styles.hero} aria-label="Hero section with rotating images of the library and a search form">
        {HERO_SLIDES.map((slide, i) => (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            className={`${styles.heroImage} ${i === currentSlide ? styles.heroImageActive : ''}`}
          />
        ))}

        <aside className={styles.heroEvent}>
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
        </aside>

        <div className={styles.heroCard}>
          <p className={styles.heroCardEyebrow}>Riyad Nassar Library</p>
          <h1 className={styles.heroCardTitle}>
           Your Next Discovery Starts Here!
          </h1>
          <p className={styles.heroCardBody}>
           Spend time with a great book, join events, and share ideas with your community.
          </p>

          <form role="search" className={styles.heroSearch}>
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
          </form>

          <div className={styles.heroCardActions}>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => navigate('/register')}
            >
              Get Started
            </button>
            <button className={styles.btnGhost}>Learn More</button>
          </div>
        </div>
      </section>

      <section className={styles.stats} aria-label="Library statistics">
        <div className={styles.statBlock}>
          <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
          <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <ellipse cx="12" cy="6" rx="8" ry="3" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M4 6v4c0 1.657 3.582 3 8 3s8-1.343 8-3V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M4 10v4c0 1.657 3.582 3 8 3s8-1.343 8-3v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className={styles.statValue}>185</span>
          <span className={styles.statLabel}>Online Databases</span>
        </div>
        <span className={styles.statDivider} />
        <div className={styles.statBlock}>
          <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
          <svg className={styles.statIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M3 14h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M5 14V9a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M6 14v3M18 14v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M9 8V6M15 8V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className={styles.statValue}>517+</span>
          <span className={styles.statLabel}>Reading Seats</span>
        </div>
      </section>

      {/* ── Quick actions ── */}
      <section className={styles.actions}>
        <div className={styles.actionsHeader}>
          <h2 className={styles.actionsTitle}>Explore the Library</h2>
          <p className={styles.actionsSubtitle}>Browse collections, join events, find study spaces, and plan your visit.</p>
        </div>
        <div className={styles.actionsGrid}>

          {/* Card 1 — Find Your Next Book */}
          <a href="/books" className={styles.actionCard}>
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
          </a>

          {/* Card 2 — Join an Event (no link yet) */}
          <a href="#" className={styles.actionCard}>
            <svg className={styles.actionIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M7 14h2M11 14h2M15 14h2M7 17.5h2M11 17.5h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p className={styles.actionCardEyebrow}>What&apos;s On</p>
            <div className={styles.actionCardHeader}>
              <h3 className={styles.actionCardTitle}>Join an Event</h3>
              <span className={styles.actionArrow}>→</span>
            </div>
            <p className={styles.actionCardBody}>Attend talks, workshops, and activities happening at the library.</p>
            <p className={styles.actionCardDetail}>View this week&apos;s schedule</p>
          </a>

          {/* Card 3 — Discover Study Spaces → /services/StudyRooms */}
          <a
            href="/services/StudyRooms"
            className={styles.actionCard}
            onClick={e => { e.preventDefault(); navigate('/services/StudyRooms') }}
          >
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
          </a>

          {/* Card 4 — Plan Your Visit (no link yet) */}
          <a href="#" className={styles.actionCard}>
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
          </a>

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
            <a className={styles.featuredViewAll} href="/books">View All</a>
          </div>
        </div>

        <div className={styles.booksViewport} ref={viewportRef}>
          <div className={styles.booksTrack} ref={trackRef}>
            {TRACK.map((book, i) => (
              <article
                key={`${book.id}-${i}`}
                className={styles.bookCard}
                onClick={() => navigate(`/books/${book.id}`)}
                style={{ cursor: 'pointer' }}
                aria-label={`View details for ${book.title} by ${book.author}`}
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
              </article>
            ))}
          </div>
        </div>
      </section>
      </main>
    </div>
  )
}

export default Home