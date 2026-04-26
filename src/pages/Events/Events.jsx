import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { getEvents } from '@/utils/api'
import { getStoredUser, isAdminUser } from '@/utils'

const CATEGORIES = ['All', 'Workshops', 'Author Talks', 'Exhibitions', 'Book Clubs', 'Film', 'Kids & Families', 'Community']
const MONTHS = ['All Months', 'March', 'April', 'May', 'June']
const FORMATS = ['All Formats', 'In-Person', 'Online']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const PLACEHOLDER_EVENT = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <rect width="800" height="500" fill="#f3f0eb"/>
  <text x="400" y="235" font-family="Arial, sans-serif" font-size="42" font-weight="700" text-anchor="middle" fill="#2f2f2f">NO EVENT</text>
  <text x="400" y="290" font-family="Arial, sans-serif" font-size="42" font-weight="700" text-anchor="middle" fill="#2f2f2f">IMAGE</text>
</svg>
`)}`

function sanitizeImage(url) {
  if (!url || typeof url !== 'string') return PLACEHOLDER_EVENT
  return url
}

function formatDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`)
  return { month: MONTH_NAMES[d.getMonth()], day: d.getDate(), weekday: DAY_NAMES[d.getDay()] }
}

function formatFullDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`)
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

function categoryColor(category) {
  const map = {
    Workshops: 'text-[#006751] dark:text-[#5ecba1]',
    'Author Talks': 'text-[#1a6644] dark:text-[#5ecba1]',
    Exhibitions: 'text-[#987432] dark:text-[#e2c781]',
    'Book Clubs': 'text-[#8B5E3C] dark:text-[#d6aa8a]',
    Film: 'text-[#2d6a4f] dark:text-[#5ecba1]',
    'Kids & Families': 'text-[#B8565C] dark:text-[#ff9ba3]',
    Community: 'text-[#44785E] dark:text-[#5ecba1]',
  }
  return map[category] || 'text-[#006751] dark:text-[#5ecba1]'
}

function getRegisteredEvents() {
  const storedUser = getStoredUser()
  const prefix = storedUser?.email ? `${storedUser.email}:` : ''
  const rawRegisteredEvents =
    localStorage.getItem(`${prefix}registeredEvents`) ||
    localStorage.getItem('registeredEvents')

  if (!rawRegisteredEvents) return []

  try {
    const parsed = JSON.parse(rawRegisteredEvents)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function getSeatState(eventItem, registeredEvents) {
  if (!eventItem.seats) {
    return {
      isRegistered: registeredEvents.some((item) => item.id === eventItem.id),
      effectiveRegistered: null,
      seatsLeft: null,
      isFull: false,
    }
  }

  const isRegistered = registeredEvents.some((item) => item.id === eventItem.id)
  const effectiveRegistered = Math.min(eventItem.seats, eventItem.registered + (isRegistered ? 1 : 0))
  const seatsLeft = Math.max(0, eventItem.seats - effectiveRegistered)

  return {
    isRegistered,
    effectiveRegistered,
    seatsLeft,
    isFull: seatsLeft === 0,
  }
}

function normalizeEvent(event) {
  return {
    ...event,
    image: sanitizeImage(event.image),
    highlights: Array.isArray(event.highlights) ? event.highlights : [],
  }
}

function Events() {
  const navigate = useNavigate()
  const admin = isAdminUser()

  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [month, setMonth] = useState('All Months')
  const [format, setFormat] = useState('All Formats')
  const [registeredEvents, setRegisteredEvents] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const dialogTitleId = confirmed ? 'event-registration-success-title' : 'event-registration-confirm-title'
  const dialogDescriptionId = confirmed ? 'event-registration-success-description' : 'event-registration-confirm-description'

  const featuredEvent = events.find((e) => Boolean(e.featured))

  useEffect(() => {
    setRegisteredEvents(getRegisteredEvents())
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError('')

    getEvents()
      .then((data) => {
        if (cancelled) return
        setEvents((Array.isArray(data) ? data : []).map(normalizeEvent))
      })
      .catch((error) => {
        if (cancelled) return
        setLoadError(error.message || 'Failed to load events')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    let list = events.filter((e) => !e.featured)

    if (activeCategory !== 'All') list = list.filter((e) => e.category === activeCategory)

    if (month !== 'All Months') {
      list = list.filter((e) => {
        const d = new Date(`${e.date}T00:00:00`)
        return MONTH_NAMES[d.getMonth()] === month.slice(0, 3)
      })
    }

    if (format !== 'All Formats') list = list.filter((e) => e.format === format)

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          (e.speaker && e.speaker.toLowerCase().includes(q)) ||
          e.location.toLowerCase().includes(q)
      )
    }

    return list
  }, [events, activeCategory, search, month, format])

  const activeFilterCount =
    (activeCategory !== 'All' ? 1 : 0) +
    (month !== 'All Months' ? 1 : 0) +
    (format !== 'All Formats' ? 1 : 0) +
    (search.trim() ? 1 : 0)

  function clearAll() {
    setActiveCategory('All')
    setSearch('')
    setMonth('All Months')
    setFormat('All Formats')
  }

  function handleRegister(eventItem) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/events' } })
      return
    }

    const storedUser = getStoredUser()
    const prefix = storedUser?.email ? `${storedUser.email}:` : ''
    const key = `${prefix}registeredEvents`
    const currentRegisteredEvents = getRegisteredEvents()
    const seatState = getSeatState(eventItem, currentRegisteredEvents)

    if (seatState.isRegistered) {
      const nextRegisteredEvents = currentRegisteredEvents.filter((item) => item.id !== eventItem.id)
      localStorage.setItem(key, JSON.stringify(nextRegisteredEvents))
      setRegisteredEvents(nextRegisteredEvents)
      return
    }

    if (seatState.isFull) return

    setSelectedEvent(eventItem)
    setConfirmed(false)
    setModalOpen(true)
  }

  function handleConfirmRegistration() {
    if (!selectedEvent) return

    const storedUser = getStoredUser()
    const prefix = storedUser?.email ? `${storedUser.email}:` : ''
    const key = `${prefix}registeredEvents`
    const currentRegisteredEvents = getRegisteredEvents()
    const seatState = getSeatState(selectedEvent, currentRegisteredEvents)

    if (seatState.isRegistered || seatState.isFull) return

    const nextRegisteredEvents = [
      ...currentRegisteredEvents,
      { id: selectedEvent.id, title: selectedEvent.title, date: selectedEvent.date },
    ]

    localStorage.setItem(key, JSON.stringify(nextRegisteredEvents))
    setRegisteredEvents(nextRegisteredEvents)
    setConfirmed(true)
  }

  function handleCloseModal() {
    setModalOpen(false)
    setConfirmed(false)
    setSelectedEvent(null)
  }

  return (
    <main className="min-h-screen bg-[#F2F5F3] text-[#1C2B24] dark:bg-[#121212] dark:text-[#f5f7f6]">
      <section className="grid md:min-h-[480px] md:grid-cols-2">
        <div className="relative flex items-center overflow-hidden bg-[linear-gradient(165deg,#0A2E22_0%,#061C14_100%)] px-5 py-9 sm:px-6 sm:py-12 md:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_80%,rgba(0,171,142,0.07)_0%,transparent_70%),radial-gradient(ellipse_40%_40%_at_80%_20%,rgba(196,112,95,0.04)_0%,transparent_70%)]" />
          <div className="relative max-w-[480px]">
            <p className="mb-4 text-[0.63rem] font-semibold uppercase tracking-[0.16em] text-[#5ecba1]">Our Libraries</p>
            <h1 className="mb-5 text-[clamp(1.8rem,3.5vw,2.5rem)] font-extrabold leading-[1.1] tracking-[-0.035em] text-[rgba(240,248,244,0.96)]">Library Events</h1>
            <p className="mb-8 max-w-[42ch] text-[0.9rem] leading-[1.75] text-[rgba(240,248,244,0.48)]">
              Author talks, research workshops, film screenings, poetry evenings: the library is where ideas find their audience and community takes shape.
            </p>
            <div className="mb-8 flex flex-wrap gap-3">
              <a href="#upcoming" className="rounded-lg bg-[#1a6644] px-5 py-2.5 text-[0.8rem] font-semibold text-white shadow-[0_1px_4px_rgba(26,102,68,0.3)] transition hover:bg-[#14533a]">
                View Upcoming Events
              </a>
              {admin && (
                <button
                  type="button"
                  className="rounded-lg border border-white/15 px-5 py-2.5 text-[0.8rem] font-semibold text-[rgba(240,248,244,0.7)] transition hover:bg-white/5 hover:text-[rgba(240,248,244,0.95)]"
                  onClick={() => navigate('/events/add')}
                >
                  + Add Event
                </button>
              )}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <span className="h-[7px] w-[7px] rounded-full bg-[#5ecba1] shadow-[0_0_0_3px_rgba(94,203,161,0.18)]" />
              <span className="text-[0.72rem] font-semibold text-[rgba(240,248,244,0.55)]">{events.length} events this month</span>
            </div>
          </div>
        </div>

        <div className="hidden items-center justify-center bg-[linear-gradient(155deg,rgba(0,103,81,0.06)_0%,rgba(200,190,170,0.05)_100%)] p-6 md:flex dark:bg-[linear-gradient(155deg,rgba(18,18,18,0.96)_0%,rgba(31,31,31,0.92)_100%)]">
          <div className="grid h-full max-h-[400px] w-full max-w-[520px] grid-cols-[1.4fr_1fr] grid-rows-2 gap-3">
            {[
              ['main', 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&q=80', 'Library shelves'],
              ['top', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&q=80', 'Workshop session'],
              ['bottom', 'https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?w=400&q=80', 'Poetry reading'],
            ].map(([pos, src, alt]) => (
              <div key={pos} className={`${pos === 'main' ? 'row-span-2' : ''} overflow-hidden rounded-[14px]`}>
                <img src={src} alt={alt} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {featuredEvent && (() => {
        const fd = formatDate(featuredEvent.date)
        const featuredSeatState = getSeatState(featuredEvent, registeredEvents)
        const seatsLeft = featuredSeatState.seatsLeft
        const pct = featuredEvent.seats ? (featuredSeatState.effectiveRegistered / featuredEvent.seats) * 100 : 0

        return (
          <section className="border-b border-[rgba(0,103,81,0.06)] bg-[linear-gradient(170deg,rgba(0,103,81,0.035)_0%,rgba(200,190,170,0.055)_100%)] px-5 py-16 dark:border-[#333333] dark:bg-[linear-gradient(170deg,rgba(18,18,18,0.94)_0%,rgba(31,31,31,0.9)_100%)]">
            <div className="mx-auto grid max-w-[var(--container-max)] gap-10 lg:grid-cols-[420px_minmax(0,1fr)]">
              <div className="lg:sticky lg:top-24 lg:self-start">
                <div className="relative overflow-hidden rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.10),0_1px_3px_rgba(0,0,0,0.06)]">
                  <img
                    src={featuredEvent.image}
                    alt={featuredEvent.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = PLACEHOLDER_EVENT
                    }}
                  />
                  <div className="absolute left-4 top-4 flex w-14 flex-col items-center rounded-[10px] border border-white/12 bg-[rgba(6,26,18,0.78)] py-2 shadow-[0_4px_16px_rgba(0,0,0,0.28)] backdrop-blur-[10px]">
                    <span className="text-[0.54rem] font-bold uppercase tracking-[0.14em] text-[#5ecba1]">{fd.month}</span>
                    <span className="text-[1.4rem] font-extrabold leading-none text-[rgba(240,248,244,0.95)]">{fd.day}</span>
                  </div>
                  <span className={`absolute bottom-4 left-4 rounded-md bg-white/90 px-3 py-1 text-[0.58rem] font-bold uppercase tracking-[0.12em] shadow dark:bg-[#121212]/90 ${categoryColor(featuredEvent.category)}`}>
                    {featuredEvent.category}
                  </span>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#006751] px-3 py-1 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-white dark:bg-[#5ecba1] dark:text-[#121212]">
                    Featured Event
                  </span>
                  <span className="text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[#5a6b62]/60 dark:text-[#8c9691]">
                    Open to all
                  </span>
                </div>

                <h2 className="mb-3 text-[clamp(1.35rem,2.8vw,1.9rem)] font-extrabold leading-[1.2] tracking-[-0.03em]">
                  {featuredEvent.title}
                </h2>

                <p className="mb-7 max-w-[56ch] text-[0.88rem] leading-[1.72] text-[#595959] dark:text-[#8c9691]">
                  {featuredEvent.description}
                </p>

                <div className="mb-7 grid gap-4 rounded-xl border border-[#d0ddd8] border-t-[2px] border-t-[rgba(0,103,81,0.15)] bg-[linear-gradient(155deg,rgba(253,250,244,1)_0%,rgba(247,242,232,1)_100%)] p-5 shadow-sm md:grid-cols-2 dark:border-[#333333] dark:border-t-[rgba(94,203,161,0.3)] dark:bg-[#1f1f1f] dark:[background-image:none]">
                  {[
                    ['Date', `${fd.weekday}, ${formatFullDate(featuredEvent.date)}`],
                    ['Time', featuredEvent.time],
                    ['Location', featuredEvent.location],
                    ['Speaker', featuredEvent.speaker],
                  ]
                    .filter(([, value]) => value)
                    .map(([label, value]) => (
                      <div key={label}>
                        <span className="mb-1 block text-[0.58rem] font-bold uppercase tracking-[0.12em] text-[#5a6b62]/60 dark:text-[#8c9691]">
                          {label}
                        </span>
                        <span className="text-[0.82rem] font-semibold text-[#1C2B24] dark:text-[#f5f7f6]">
                          {value}
                        </span>
                      </div>
                    ))}
                </div>

                {featuredEvent.seats && (
                  <div className="mb-7 flex items-center gap-3">
                    <div
                      className="h-[5px] w-[140px] overflow-hidden rounded bg-[#d0ddd8] dark:bg-[#333333]"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={featuredEvent.seats}
                      aria-valuenow={featuredSeatState.effectiveRegistered}
                    >
                      <div className="h-full rounded bg-[#006751] dark:bg-[#5ecba1]" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[0.72rem] font-semibold text-[#006751]/70 dark:text-[#5ecba1]/80">
                      {seatsLeft} of {featuredEvent.seats} seats remaining
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  {featuredEvent.seats && (
                    <button
                      type="button"
                      onClick={() => handleRegister(featuredEvent)}
                      disabled={featuredSeatState.isFull && !featuredSeatState.isRegistered}
                      className={`rounded-lg px-6 py-2.5 text-[0.82rem] font-semibold transition ${
                        featuredSeatState.isRegistered
                          ? 'bg-[#cfcfcf] text-[#4f4f4f] hover:bg-[#bdbdbd] dark:bg-[#4a4a4a] dark:text-[#f1f1f1] dark:hover:bg-[#5a5a5a]'
                          : 'bg-[#1a6644] text-white shadow-[0_1px_3px_rgba(26,102,68,0.3)] hover:bg-[#14533a] dark:bg-[#1a6644] dark:text-white dark:hover:bg-[#14533a]'
                      } disabled:cursor-not-allowed disabled:bg-[#b9b9b9] disabled:text-[#666]`}
                    >
                      {featuredSeatState.isRegistered ? 'Cancel Registration' : featuredSeatState.isFull ? 'Seats Full' : 'Reserve a Spot'}
                    </button>
                  )}

                  <Link to={`/events/${featuredEvent.id}`} className="rounded-lg border border-[#d0ddd8] px-6 py-2.5 text-center text-[0.82rem] font-semibold text-[#1C2B24] transition hover:border-[#006751] hover:bg-[#006751]/5 dark:border-[#333333] dark:text-[#f5f7f6] dark:hover:border-[#5ecba1] dark:hover:bg-[#1f1f1f]">
                    Learn More
                  </Link>

                  {admin && (
                    <button
                      type="button"
                      onClick={() => navigate(`/events/edit/${featuredEvent.id}`)}
                      className="rounded-lg border border-[#1a6644] px-6 py-2.5 text-[0.82rem] font-semibold text-[#1a6644] transition hover:bg-[#1a6644] hover:text-white"
                    >
                      Edit Event
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        )
      })()}

      <section id="upcoming" className="relative overflow-hidden border-b border-[rgba(0,103,81,0.05)] bg-[rgba(200,190,170,0.05)] px-5 py-16 dark:border-[#333333] dark:bg-[rgba(18,18,18,0.88)]">
        <div className="mx-auto max-w-[var(--container-max)]">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="mb-2 text-[clamp(1.3rem,2.6vw,1.75rem)] font-extrabold tracking-[-0.028em] before:mb-[1.15rem] before:block before:h-[3px] before:w-10 before:rounded-full before:bg-gradient-to-r before:from-[#006751] before:to-[rgba(0,103,81,0.35)] dark:before:from-[#5ecba1] dark:before:to-[rgba(94,203,161,0.25)]">
                Upcoming Events
              </h2>
              <p className="max-w-[48ch] text-[0.86rem] leading-[1.72] text-[#595959] dark:text-[#8c9691]">
                Browse what's coming up, or narrow things down by topic, month, or format.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {admin && (
                <button
                  type="button"
                  className="rounded-lg bg-[#1a6644] px-4 py-2 text-[0.8rem] font-semibold text-white transition hover:bg-[#14533a]"
                  onClick={() => navigate('/events/add')}
                >
                  + Add Event
                </button>
              )}
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-[#d0ddd8] px-3 py-1.5 text-[0.72rem] font-semibold text-[#5a6b62] transition hover:border-[#1a6644] hover:bg-[#1a6644]/5 hover:text-[#1a6644] dark:border-[#333333] dark:text-[#8c9691]"
                  onClick={clearAll}
                >
                  Clear all
                  <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#1a6644] text-[0.58rem] font-bold text-white">
                    {activeFilterCount}
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="mb-6 max-w-[560px]">
            <div className="relative">
              <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#006751]/40 dark:text-[#5ecba1]/60" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M16.5 16.5 L21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                className="w-full rounded-[10px] border border-[#d0ddd8] bg-white px-10 py-3 text-[0.82rem] text-[#1C2B24] outline-none transition focus:border-[#006751] focus:ring-4 focus:ring-[#006751]/8 dark:border-[#333333] dark:bg-[#1f1f1f] dark:text-[#f5f7f6] dark:focus:border-[#5ecba1] dark:focus:ring-[#5ecba1]/10"
                placeholder="Search events, speakers, or topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[#5a6b62]/50 transition hover:bg-black/5 hover:text-[#5a6b62]"
                  onClick={() => setSearch('')}
                >
                  x
                </button>
              )}
            </div>
          </div>

          <div className="sticky top-0 z-[8] mb-6 rounded-[14px] border border-[#d0ddd8] bg-white p-5 shadow-sm dark:border-[#333333] dark:bg-[#1f1f1f] max-[480px]:static">
            <div className="mb-5">
              <span className="mb-3 block text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[#5a6b62]/55 dark:text-[#8c9691]">Category</span>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`rounded-full border px-3 py-1.5 text-[0.72rem] transition ${
                      cat === activeCategory
                        ? 'border-[#1a6644] bg-[#1a6644] text-white shadow-[0_1px_3px_rgba(26,102,68,0.25)]'
                        : 'border-[#d0ddd8] bg-[#F2F5F3] text-[#5a6b62] hover:border-[#1a6644] hover:text-[#1a6644] dark:border-[#333333] dark:bg-[#121212] dark:text-[#8c9691]'
                    }`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat === 'All' ? 'All Events' : cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-[#5a6b62]/55 dark:text-[#8c9691]">Month</span>
                <select className="rounded-md border border-[#d0ddd8] bg-[#F2F5F3] px-3 py-2 text-[0.78rem] outline-none transition focus:border-[#006751] dark:border-[#333333] dark:bg-[#121212] dark:text-[#f5f7f6]" value={month} onChange={(e) => setMonth(e.target.value)}>
                  {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-[#5a6b62]/55 dark:text-[#8c9691]">Format</span>
                <select className="rounded-md border border-[#d0ddd8] bg-[#F2F5F3] px-3 py-2 text-[0.78rem] outline-none transition focus:border-[#006751] dark:border-[#333333] dark:bg-[#121212] dark:text-[#f5f7f6]" value={format} onChange={(e) => setFormat(e.target.value)}>
                  {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </label>
            </div>
          </div>

          <div className="mb-5 text-[0.82rem] text-[#5a6b62] dark:text-[#8c9691]">
            <span className="font-bold text-[#1C2B24] dark:text-[#f5f7f6]">{filtered.length}</span> event{filtered.length !== 1 ? 's' : ''} found
          </div>

          {loading ? (
            <div className="flex flex-col items-center gap-3 rounded-[14px] border border-[#d0ddd8] bg-white px-6 py-16 text-center dark:border-[#333333] dark:bg-[#1f1f1f]">
              <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#d0ddd8] border-t-[#1a6644] dark:border-[#333333] dark:border-t-[#5ecba1]" />
              <p className="text-[0.82rem] text-[#5a6b62] dark:text-[#8c9691]">Loading events...</p>
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center gap-2 rounded-[14px] border border-[#d0ddd8] bg-white px-6 py-16 text-center dark:border-[#333333] dark:bg-[#1f1f1f]">
              <p className="text-[0.94rem] font-bold text-[#b5392b] dark:text-[#ff9388]">Couldn't load events</p>
              <p className="max-w-[36ch] text-[0.8rem] leading-[1.7] text-[#5a6b62] dark:text-[#8c9691]">{loadError}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center rounded-[14px] border border-[#d0ddd8] bg-white px-6 py-16 text-center dark:border-[#333333] dark:bg-[#1f1f1f]">
              <p className="mb-2 text-[0.94rem] font-bold">No events found</p>
              <button type="button" className="rounded-md bg-[#1a6644] px-5 py-2 text-[0.8rem] font-semibold text-white transition hover:bg-[#14533a]" onClick={clearAll}>
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              {filtered.map((event, idx) => {
                const { month, day, weekday } = formatDate(event.date)
                const seatState = getSeatState(event, registeredEvents)
                const seatsLeft = seatState.seatsLeft

                return (
                  <article
                    key={event.id}
                    className={`overflow-hidden rounded-[14px] border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(28,43,36,0.10)] dark:border-[#333333] dark:bg-[#1f1f1f] ${
                      idx === 0 ? 'border-[#d0ddd8] bg-[linear-gradient(150deg,rgba(253,250,244,1)_0%,rgba(247,242,232,1)_100%)] xl:col-span-2 dark:[background-image:none]' : 'border-[#d0ddd8]'
                    }`}
                  >
                    <div className="relative aspect-[1.35] overflow-hidden bg-[#EDF3F0] dark:bg-[#242424]">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="absolute inset-0 h-full w-full object-cover transition duration-500 hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = PLACEHOLDER_EVENT
                        }}
                      />
                      <div className="absolute left-3 top-3 flex w-12 flex-col items-center rounded-lg border border-white/10 bg-[rgba(6,26,18,0.78)] py-1.5 text-[rgba(240,248,244,0.95)] shadow-[0_4px_12px_rgba(0,0,0,0.24)] backdrop-blur-[10px]">
                        <span className="text-[0.48rem] font-bold uppercase tracking-[0.14em] text-[#5ecba1]">{month}</span>
                        <span className="text-[1.15rem] font-extrabold leading-none">{day}</span>
                      </div>
                      <span className={`absolute bottom-3 left-3 rounded bg-white/90 px-2.5 py-1 text-[0.54rem] font-bold uppercase tracking-[0.12em] shadow dark:bg-[#121212]/90 ${categoryColor(event.category)}`}>{event.category}</span>
                    </div>

                    <div className="flex flex-col p-4 sm:p-6">
                      <h3 className="mb-2 text-[0.94rem] font-bold leading-[1.3] tracking-[-0.015em]">{event.title}</h3>
                      <p className="mb-4 line-clamp-4 text-[0.78rem] leading-[1.6] text-[#5a6b62] dark:text-[#8c9691]">{event.description}</p>

                      <div className="mb-4 space-y-2 text-[0.72rem] text-[#5a6b62]/80 dark:text-[#8c9691]">
                        <div>{weekday} - {event.time}</div>
                        <div>{event.location}</div>
                      </div>

                      <div className="flex flex-col gap-3 border-t border-[rgba(0,103,81,0.06)] pt-4 dark:border-[#333333]">
                        {seatsLeft !== null ? (
                          <div className="flex items-center gap-2">
                            <div className="h-[5px] w-[110px] overflow-hidden rounded bg-[#d0ddd8] dark:bg-[#333333]">
                              <div className="h-full rounded bg-[#006751] dark:bg-[#5ecba1]" style={{ width: `${(seatState.effectiveRegistered / event.seats) * 100}%` }} />
                            </div>
                            <span className="text-[0.66rem] font-semibold text-[#006751]/75 dark:text-[#5ecba1]/80">{seatsLeft} left</span>
                          </div>
                        ) : (
                          <span className="text-[0.66rem] dark:text-[#8c9691]">Open attendance</span>
                        )}

                        <div className="flex flex-wrap items-center gap-2">
                          {seatsLeft !== null && (
                            <button
                              type="button"
                              onClick={() => handleRegister(event)}
                              disabled={seatState.isFull && !seatState.isRegistered}
                              className={`rounded-md px-4 py-2 text-[0.72rem] font-semibold transition ${
                                seatState.isRegistered
                                  ? 'bg-[#cfcfcf] text-[#4f4f4f] hover:bg-[#bdbdbd]'
                                  : 'bg-[#1a6644] text-white hover:bg-[#14533a]'
                              } disabled:cursor-not-allowed disabled:bg-[#b9b9b9] disabled:text-[#666]`}
                            >
                              {seatState.isRegistered ? 'Cancel Registration' : seatState.isFull ? 'Seats Full' : 'Reserve a Spot'}
                            </button>
                          )}

                          <Link to={`/events/${event.id}`} className="rounded-md border border-[#d0ddd8] px-4 py-2 text-center text-[0.72rem] font-semibold text-[#006751] transition hover:border-[#006751] hover:bg-[#006751]/5 dark:border-[#333333] dark:text-[#5ecba1]">
                            Learn More
                          </Link>

                          {admin && (
                            <button
                              type="button"
                              onClick={() => navigate(`/events/edit/${event.id}`)}
                              className="rounded-md border border-[#1a6644] px-4 py-2 text-[0.72rem] font-semibold text-[#1a6644] transition hover:bg-[#1a6644] hover:text-white"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {modalOpen && selectedEvent && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 dark:bg-[rgba(0,0,0,0.7)]"
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogTitleId}
          aria-describedby={dialogDescriptionId}
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
                <h2 id={dialogTitleId} className="m-0 text-[1.2rem] font-bold text-[#1a1a1a] dark:text-white">
                  Registered Successfully!
                </h2>
                <p id={dialogDescriptionId} className="m-0 text-[0.95rem] leading-[1.6] text-[#555] dark:text-[#888]">
                  You have registered for <strong>{selectedEvent.title}</strong>.
                </p>
                <button
                  className="mt-2 rounded-lg border-0 bg-[#1a4a3a] px-5 py-[0.75rem] text-[0.9rem] font-semibold text-white hover:bg-[#2d7a4f]"
                  onClick={handleCloseModal}
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <h2 id={dialogTitleId} className="m-0 text-[1.2rem] font-bold text-[#1a1a1a] dark:text-white">
                  Confirm Registration
                </h2>
                <p id={dialogDescriptionId} className="m-0 text-[0.95rem] leading-[1.6] text-[#555] dark:text-[#888]">
                  Do you want to register for <strong>{selectedEvent.title}</strong>?
                </p>
                <div className="mt-2 flex w-full gap-3">
                  <button
                    className="flex-1 rounded-lg border border-[#ccc] bg-white px-4 py-[0.75rem] text-[0.9rem] font-semibold text-[#555] hover:bg-[#f0f0f0] dark:border-[#333] dark:bg-[#1a1a1a] dark:text-[#888]"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 rounded-lg border-0 bg-[#1a4a3a] px-4 py-[0.75rem] text-[0.9rem] font-semibold text-white hover:bg-[#2d7a4f]"
                    onClick={handleConfirmRegistration}
                  >
                    Confirm
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

export default Events