import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BOOKS } from '@/data/bookData'
import { EVENTS } from '@/data/eventsData'
import slideCampusGarden from '@/assets/0.jpg'
import slideCampusBench from '@/assets/487281962_1086257190198525_229767219208838718_n.jpg'
import slideCampusFountain from '@/assets/lebanese-american-university-lau_1153.jpg'

const HERO_SLIDES = [
  { src: slideCampusGarden, alt: 'LAU Beirut campus historic stone buildings and gardens' },
  { src: slideCampusBench, alt: 'Students under the old banyan tree on LAU Beirut campus' },
  { src: slideCampusFountain, alt: 'LAU Beirut campus fountain and palm trees' },
]

const QUICK_ACTIONS = [
  {
    eyebrow: 'Collections & Archives',
    title: 'Find Your Next Book',
    body: 'Search thousands of titles and discover something new to read.',
    detail: '500,000+ items available',
    href: '/books',
    colors: 'bg-[linear-gradient(150deg,#0A2E22_0%,#061C14_100%)] text-white border-white/10',
    iconWrap: 'bg-[rgba(196,112,95,0.15)] border-[rgba(196,112,95,0.22)] text-[#5ecba1]',
    eyebrowColor: 'text-[#5ecba1]',
    detailColor: 'text-[#5ecba1]/80',
    icon: (
      <>
        <path d="M4 19V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M4 19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M4 19a2 2 0 0 1 2-2h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 8h6M9 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
  },
  {
    eyebrow: "What's On",
    title: 'Join an Event',
    body: 'Attend talks, workshops, and activities happening at the library.',
    detail: "View this week's schedule",
    href: '/events',
    colors: 'bg-[linear-gradient(150deg,rgba(241,248,244,1)_0%,rgba(231,243,236,1)_100%)] text-[#1C2B24] border-[#d0ddd8] dark:bg-[#1f1f1f] dark:border-[#333333] dark:text-[#f5f7f6] dark:[background-image:none]',
    iconWrap: 'bg-[rgba(0,103,81,0.08)] border-[rgba(0,103,81,0.14)] text-[#006751] dark:bg-[#242424] dark:border-[#2e5541] dark:text-[#5ecba1]',
    eyebrowColor: 'text-[#006751] dark:text-[#5ecba1]',
    detailColor: 'text-[#006751]/80 dark:text-[#5ecba1]/80',
    icon: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 14h2M11 14h2M15 14h2M7 17.5h2M11 17.5h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
  },
  {
    eyebrow: 'Spaces & Facilities',
    title: 'Discover Study Spaces',
    body: 'Find quiet areas and comfortable places to focus and work.',
    detail: 'Reserve a space in advance',
    href: '/services/StudyRooms',
    colors: 'bg-[linear-gradient(150deg,rgba(245,249,246,1)_0%,rgba(237,245,240,1)_100%)] text-[#1C2B24] border-[#d0ddd8] dark:bg-[#1f1f1f] dark:border-[#333333] dark:text-[#f5f7f6] dark:[background-image:none]',
    iconWrap: 'bg-[rgba(68,124,96,0.09)] border-[rgba(68,124,96,0.14)] text-[#44785E] dark:bg-[#1a3428] dark:border-[#2e5541] dark:text-[#5ecba1]',
    eyebrowColor: 'text-[#44785E] dark:text-[#5ecba1]',
    detailColor: 'text-[#44785E]/80 dark:text-[#5ecba1]/80',
    icon: (
      <>
        <path d="M3 14h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 14V9a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M6 14v3M18 14v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 8V6M15 8V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
  },
  {
    eyebrow: 'Visitor Information',
    title: 'Plan Your Visit',
    body: 'Check opening hours, location, and visitor information.',
    detail: 'Mon-Fri 7:30am-10pm',
    href: '/visit',
    colors: 'bg-[linear-gradient(150deg,rgba(255,252,243,1)_0%,rgba(250,243,226,1)_100%)] text-[#1C2B24] border-[#ead8a8] dark:bg-[#1f1f1f] dark:border-[#333333] dark:text-[#f5f7f6] dark:[background-image:none]',
    iconWrap: 'bg-[rgba(152,118,52,0.09)] border-[rgba(152,118,52,0.14)] text-[#987432] dark:bg-[#3a2f14] dark:border-[#5d4a1d] dark:text-[#e1c375]',
    eyebrowColor: 'text-[#987432] dark:text-[#e1c375]',
    detailColor: 'text-[#987432]/80 dark:text-[#e1c375]/80',
    icon: (
      <>
        <path d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 12 6 12s6-7.582 6-12c0-3.314-2.686-6-6-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
      </>
    ),
  },
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
  const trackRef = useRef(null)
  const animRef = useRef(null)
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setCurrentSlide((c) => (c + 1) % HERO_SLIDES.length), 7000)
    return () => clearInterval(id)
  }, [])

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return

    const start = () => {
      const cw = getCardWidth(viewport.offsetWidth)
      const dist = N * (cw + GAP_PX)
      const dur = (dist / PX_PER_SEC) * 1000

      Array.from(track.children).forEach((card) => {
        card.style.flexBasis = `${cw}px`
      })

      animRef.current?.cancel()
      animRef.current = track.animate([{ transform: 'translateX(0)' }, { transform: `translateX(-${dist}px)` }], {
        duration: dur,
        iterations: Infinity,
        easing: 'linear',
      })
    }

    const pause = () => animRef.current?.pause()
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
  }, [])

  const today = new Date().toISOString().slice(0, 10)
  const nextEvent = EVENTS.filter((event) => event.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0]

  return (
    <div className="w-full bg-[#F2F5F3] text-[#1C2B24] dark:bg-[#121212] dark:text-[#f5f7f6]">
      <main>
        <section className="relative left-1/2 ml-[-50vw] h-[520px] w-screen overflow-hidden sm:h-[540px]" aria-label="Hero section with rotating images of the library and a search form">
          <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(to_right,rgba(12,10,8,0.38)_0%,rgba(12,10,8,0.18)_35%,transparent_62%)]" />
          {HERO_SLIDES.map((slide, i) => (
            <img
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-[1500ms] ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}

          {nextEvent && (() => {
            const eventDate = new Date(`${nextEvent.date}T00:00:00`)
            const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][eventDate.getDay()]
            const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][eventDate.getMonth()]

            return (
              <aside
                className="absolute right-[5%] top-1/2 z-10 hidden w-[min(240px,36%)] -translate-y-1/2 cursor-pointer flex-col rounded-xl border border-white/10 bg-[rgba(6,26,18,0.72)] p-5 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_8px_24px_rgba(0,0,0,0.32),0_2px_6px_rgba(0,0,0,0.18)] backdrop-blur-[14px] xl:flex"
                onClick={() => navigate('/events')}
              >
                <div className="mb-3 flex items-center gap-2">
                  <svg className="h-[13px] w-[13px] text-[#5ecba1]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[#5ecba1]">Upcoming Event</span>
                </div>
                <p className="mb-2 text-[0.88rem] font-bold leading-[1.3] tracking-[-0.015em] text-[rgba(240,248,244,0.95)]">{nextEvent.title}</p>
                <p className="text-[0.72rem] font-medium tracking-[0.01em] text-[rgba(240,248,244,0.55)]">{weekday}, {monthName} {eventDate.getDate()} - {nextEvent.time}</p>
                <p className="text-[0.67rem] tracking-[0.01em] text-[rgba(240,248,244,0.35)]">{nextEvent.location}</p>
              </aside>
            )
          })()}

          <div className="absolute bottom-8 left-1/2 z-10 flex w-[calc(100%-2rem)] max-w-[370px] -translate-x-1/2 flex-col rounded-2xl border border-[rgba(0,103,81,0.28)] border-t-white/70 bg-[linear-gradient(160deg,rgba(240,248,244,0.96)_0%,rgba(225,240,235,0.92)_100%)] p-6 shadow-[0_1px_0_rgba(255,255,255,0.65)_inset,0_8px_32px_rgba(10,20,15,0.20),0_2px_8px_rgba(10,20,15,0.12),0_40px_80px_rgba(5,10,8,0.18)] backdrop-blur-[12px] sm:left-[12%] sm:top-1/2 sm:bottom-auto sm:w-[min(370px,88%)] sm:-translate-x-0 sm:-translate-y-1/2 sm:px-9 sm:py-8 dark:border-[#333333] dark:bg-[linear-gradient(160deg,rgba(18,18,18,0.92)_0%,rgba(20,60,47,0.86)_100%)]">
            <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#006751] dark:text-[#5ecba1]">Riyad Nassar Library</p>
            <h1 className="mb-4 text-[clamp(1.6rem,3.2vw,2.15rem)] font-extrabold leading-[1.12] tracking-[-0.03em]">Your Next Discovery Starts Here!</h1>
            <p className="mb-6 text-[0.875rem] leading-[1.7] text-[#4e4e4e] dark:text-[#8c9691]">Spend time with a great book, join events, and share ideas with your community.</p>
            <form role="search" className="relative mb-4">
              <svg className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#006751]/50 dark:text-[#5ecba1]/70" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M16.5 16.5 L21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input className="w-full rounded-lg border border-[rgba(0,103,81,0.20)] bg-white/80 px-10 py-3 text-[0.8rem] text-[#1C2B24] outline-none transition focus:border-[rgba(0,103,81,0.55)] focus:bg-white focus:ring-4 focus:ring-[#006751]/10 dark:border-[#333333] dark:bg-[#121212]/80 dark:text-[#f5f7f6] dark:focus:border-[#5ecba1] dark:focus:ring-[#5ecba1]/10" type="search" placeholder="Search books, authors, or subjects..." aria-label="Search the library catalog" />
            </form>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" className="rounded-md bg-[#1a6644] px-5 py-2.5 text-[0.8rem] font-semibold text-white shadow-[0_1px_3px_rgba(26,102,68,0.3)] transition hover:bg-[#14533a] dark:bg-[#1a6644] dark:text-white dark:hover:bg-[#14533a]" onClick={() => navigate('/register')}>Get Started</button>
              <button type="button" className="rounded-md border border-[rgba(28,43,36,0.22)] px-5 py-2.5 text-[0.8rem] font-semibold text-[#1C2B24] transition hover:bg-[rgba(28,43,36,0.05)] dark:border-[#333333] dark:text-[#f5f7f6] dark:hover:bg-[#1f1f1f]">Learn More</button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 border-y border-[rgba(0,103,81,0.12)] bg-[rgba(0,103,81,0.04)] py-7 text-center sm:grid-cols-4 dark:border-[#333333] dark:bg-[rgba(45,212,168,0.04)]" aria-label="Library statistics">
          {[
            ['1.1M+', 'Library Resources'],
            ['185', 'Online Databases'],
            ['8,000+', 'Students Served'],
            ['517+', 'Reading Seats'],
          ].map(([value, label]) => (
            <div key={label} className="flex flex-col items-center gap-1 border-r border-[rgba(0,103,81,0.18)] px-4 last:border-r-0 dark:border-[#333333]">
              <span className="text-[1.3rem] font-bold tracking-[-0.03em] text-[#1C2B24] dark:text-[#f5f7f6]">{value}</span>
              <span className="text-[0.62rem] uppercase tracking-[0.08em] text-[rgba(28,43,36,0.38)] dark:text-[#8c9691]">{label}</span>
            </div>
          ))}
        </section>

        <section className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-[var(--container-max)]">
            <div className="mb-12">
              <h2 className="mb-3 text-[clamp(1.45rem,2.8vw,1.9rem)] font-extrabold tracking-[-0.032em] text-[#1C2B24] before:mb-[1.15rem] before:block before:h-[3px] before:w-10 before:rounded-full before:bg-gradient-to-r before:from-[#006751] before:to-[rgba(0,103,81,0.35)] dark:text-[#f5f7f6] dark:before:from-[#5ecba1] dark:before:to-[rgba(45,212,168,0.25)]">Explore the Library</h2>
              <p className="max-w-[52ch] text-[0.9rem] leading-[1.72] text-[#595959] dark:text-[#8c9691]">Browse collections, join events, find study spaces, and plan your visit.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {QUICK_ACTIONS.map((card) => (
                <a
                  key={card.title}
                  href={card.href}
                  onClick={(e) => {
                    e.preventDefault()
                    navigate(card.href)
                  }}
                  className={`group rounded-[14px] border p-8 shadow-[0_2px_5px_rgba(28,43,36,0.07),0_8px_20px_rgba(28,43,36,0.07)] transition hover:-translate-y-1 hover:shadow-[0_2px_8px_rgba(28,43,36,0.08),0_14px_36px_rgba(28,43,36,0.12)] ${card.colors}`}
                >
                  <div className={`mb-7 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] border ${card.iconWrap}`}>
                    <svg className="h-[26px] w-[26px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">{card.icon}</svg>
                  </div>
                  <p className={`mb-2 text-[0.63rem] font-bold uppercase tracking-[0.14em] ${card.eyebrowColor}`}>{card.eyebrow}</p>
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="text-[1.05rem] font-extrabold leading-[1.25] tracking-[-0.022em]">{card.title}</h3>
                    <span className={`text-[0.82rem] transition group-hover:translate-x-1 ${card.eyebrowColor}`}>-&gt;</span>
                  </div>
                  <p className={`text-[0.8rem] leading-[1.72] ${card.title === 'Find Your Next Book' ? 'text-white/65' : 'text-[#5a5a5a] dark:text-[#8c9691]'}`}>{card.body}</p>
                  <p className={`mt-4 border-t pt-4 text-[0.7rem] font-semibold ${card.detailColor} ${card.title === 'Find Your Next Book' ? 'border-white/10' : 'border-black/5 dark:border-white/10'}`}>{card.detail}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="relative left-1/2 ml-[-50vw] w-screen overflow-hidden border-y border-[rgba(0,103,81,0.22)] bg-[linear-gradient(180deg,rgba(215,235,228,0.38)_0%,rgba(200,228,220,0.54)_100%)] px-4 pb-2 pt-8 sm:px-6 lg:px-8 dark:border-[#333333] dark:bg-[linear-gradient(180deg,rgba(18,18,18,0.96)_0%,rgba(20,60,47,0.82)_100%)]">
          <div className="mx-auto max-w-[var(--container-max)]">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="mb-2 text-[clamp(1.1rem,2vw,1.35rem)] font-bold tracking-[-0.022em] text-[#1C2B24] before:mb-3 before:block before:h-[2px] before:w-8 before:rounded-full before:bg-gradient-to-r before:from-[#006751] before:to-[rgba(0,103,81,0.35)] dark:text-[#f5f7f6] dark:before:from-[#5ecba1] dark:before:to-[rgba(45,212,168,0.25)]">Staff Picks</h2>
                <p className="max-w-[52ch] text-[0.82rem] leading-[1.65] text-[#6a6a6a] dark:text-[#8c9691]">Discover a selection of titles to inspire your next visit.</p>
              </div>
              <a href="/books" className="text-[0.775rem] font-semibold text-[#006751] transition hover:opacity-100 dark:text-[#5ecba1]" onClick={(e) => { e.preventDefault(); navigate('/books') }}>View All</a>
            </div>
            <div ref={viewportRef} className="overflow-hidden">
              <div ref={trackRef} className="flex w-max gap-8 py-2 will-change-transform">
                {TRACK.map((book, i) => (
                  <article key={`${book.id}-${i}`} className="group shrink-0 cursor-pointer" onClick={() => navigate(`/books/${book.id}`)} aria-label={`View details for ${book.title} by ${book.author}`}>
                    <div className="relative mb-3 aspect-[2/3] overflow-hidden rounded-[3px_7px_7px_3px] shadow-[-3px_0_5px_rgba(0,0,0,0.20),0_2px_0_rgba(0,0,0,0.10),0_5px_16px_rgba(28,43,36,0.18)] transition group-hover:-translate-y-1 group-hover:shadow-[-6px_0_14px_rgba(0,0,0,0.32),0_2px_0_rgba(0,0,0,0.16),0_22px_52px_rgba(28,43,36,0.32)]">
                      <img src={book.cover} alt={book.title} className="absolute inset-0 h-full w-full object-cover object-top" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                      <span className="absolute left-0 top-0 h-full w-[9px] bg-gradient-to-r from-black/30 to-black/10" />
                      {book.badge && <span className="absolute right-2 top-3 rounded bg-white/15 px-2 py-1 text-[0.5rem] font-bold uppercase tracking-[0.11em] text-white backdrop-blur-sm">{book.badge}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[0.58rem] font-bold uppercase tracking-[0.13em]" style={{ color: book.genreColor }}>{book.genre}</span>
                      <h3 className="text-[0.78rem] font-bold leading-[1.25] tracking-[-0.015em] text-[#1C2B24] dark:text-[#f5f7f6]">{book.title}</h3>
                      <p className="text-[0.66rem] italic text-[#8a8a8a] dark:text-[#8c9691]">{book.author}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home
