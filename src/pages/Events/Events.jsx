import { useState, useMemo } from 'react'
import styles from './Events.module.css'
import { EVENTS } from '@/data/eventsData'

const CATEGORIES = ['All', 'Workshops', 'Author Talks', 'Exhibitions', 'Book Clubs', 'Film', 'Kids & Families', 'Community']
const MONTHS = ['All Months', 'March', 'April', 'May', 'June']
const FORMATS = ['All Formats', 'In-Person', 'Online']

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return { month: MONTH_NAMES[d.getMonth()], day: d.getDate(), weekday: DAY_NAMES[d.getDay()] }
}

function formatFullDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

function Events() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [month, setMonth] = useState('All Months')
  const [format, setFormat] = useState('All Formats')

  const featuredEvent = EVENTS.find(e => e.featured)

  const filtered = useMemo(() => {
    let list = EVENTS.filter(e => !e.featured)

    if (activeCategory !== 'All') {
      list = list.filter(e => e.category === activeCategory)
    }

    if (month !== 'All Months') {
      list = list.filter(e => {
        const d = new Date(e.date + 'T00:00:00')
        return MONTH_NAMES[d.getMonth()] === month.slice(0, 3)
      })
    }

    if (format !== 'All Formats') {
      list = list.filter(e => e.format === format)
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        (e.speaker && e.speaker.toLowerCase().includes(q)) ||
        e.location.toLowerCase().includes(q)
      )
    }

    return list
  }, [activeCategory, search, month, format])

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


  return (
    <div className={styles.page}>

      {/* ── 1. Hero — split layout ── */}
      <section className={styles.hero} aria-label="Events hero">

        {/* Left — dark panel with text */}
        <div className={styles.heroLeft}>
          <div className={styles.heroLeftInner}>
            <p className={styles.heroEyebrow}>Riyad Nassar Library</p>
            <h1 className={styles.heroTitle}>Library Events</h1>
            <p className={styles.heroBody}>
              Author talks, research workshops, film screenings, poetry evenings —
              the library is where ideas find their audience and community takes shape.
            </p>
            <div className={styles.heroActions}>
              <a href="#upcoming" className={styles.heroBtn}>View Upcoming Events</a>
              <a href="mailto:libraries@lau.edu.lb" className={styles.heroBtnGhost}>Host or Partner With Us</a>
            </div>
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeDot} />
              <span className={styles.heroBadgeText}>
                {EVENTS.length} events this month
              </span>
            </div>
          </div>
        </div>

        {/* Right — image collage mosaic */}
        <div className={styles.heroRight}>
          <div className={styles.heroMosaic}>
            <div className={styles.heroMosaicItem} data-pos="main">
              <img src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&q=80" alt="Library shelves" className={styles.heroMosaicImg} />
            </div>
            <div className={styles.heroMosaicItem} data-pos="top">
              <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&q=80" alt="Workshop session" className={styles.heroMosaicImg} />
            </div>
            <div className={styles.heroMosaicItem} data-pos="bottom">
              <img src="https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?w=400&q=80" alt="Poetry reading" className={styles.heroMosaicImg} />
            </div>
          </div>
        </div>

      </section>

      {/* ── 2. Featured Event ── */}
      {featuredEvent && (() => {
        const fd = formatDate(featuredEvent.date)
        const seatsLeft = featuredEvent.seats
          ? featuredEvent.seats - featuredEvent.registered
          : null
        const pct = featuredEvent.seats
          ? (featuredEvent.registered / featuredEvent.seats) * 100
          : 0

        return (
          <section className={styles.featuredSection}>
            <div className={styles.featuredInner}>

              {/* Left — large image card */}
              <div className={styles.featuredVisual}>
                <div className={styles.featuredImageWrap}>
                  {featuredEvent.image && (
                    <img src={featuredEvent.image} alt={featuredEvent.title} className={styles.featuredImg} />
                  )}
                  {/* Date badge overlay */}
                  <div className={styles.featuredDateBadge}>
                    <span className={styles.featuredDateMonth}>{fd.month}</span>
                    <span className={styles.featuredDateDay}>{fd.day}</span>
                  </div>
                  {/* Category overlay */}
                  <span className={styles.featuredCatOverlay} data-cat={featuredEvent.category}>
                    {featuredEvent.category}
                  </span>
                </div>
              </div>

              {/* Right — details */}
              <div className={styles.featuredContent}>
                <div className={styles.featuredTopRow}>
                  <span className={styles.featuredLabel}>Featured Event</span>
                  <span className={styles.featuredAudience}>
                    <svg className={styles.featuredAudienceIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M17 20c0-2.21-2.239-4-5-4s-5 1.79-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M23 20c0-1.863-1.571-3.45-3.75-3.875" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M18 6.25A3 3 0 0 1 18 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Open to all
                  </span>
                </div>

                <h2 className={styles.featuredTitle}>{featuredEvent.title}</h2>
                <p className={styles.featuredDesc}>{featuredEvent.description}</p>

                <div className={styles.featuredMeta}>
                  <div className={styles.featuredMetaItem}>
                    <svg className={styles.featuredMetaIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <div>
                      <span className={styles.featuredMetaLabel}>Date</span>
                      <span className={styles.featuredMetaValue}>{fd.weekday}, {formatFullDate(featuredEvent.date)}</span>
                    </div>
                  </div>
                  <div className={styles.featuredMetaItem}>
                    <svg className={styles.featuredMetaIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div>
                      <span className={styles.featuredMetaLabel}>Time</span>
                      <span className={styles.featuredMetaValue}>{featuredEvent.time}</span>
                    </div>
                  </div>
                  <div className={styles.featuredMetaItem}>
                    <svg className={styles.featuredMetaIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 12 6 12s6-7.582 6-12c0-3.314-2.686-6-6-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <div>
                      <span className={styles.featuredMetaLabel}>Location</span>
                      <span className={styles.featuredMetaValue}>{featuredEvent.location}</span>
                    </div>
                  </div>
                  {featuredEvent.speaker && (
                    <div className={styles.featuredMetaItem}>
                      <svg className={styles.featuredMetaIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M17 20c0-2.21-2.239-4-5-4s-5 1.79-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                      <div>
                        <span className={styles.featuredMetaLabel}>Speaker</span>
                        <span className={styles.featuredMetaValue}>{featuredEvent.speaker}</span>
                      </div>
                    </div>
                  )}
                </div>

                {featuredEvent.seats && (
                  <div className={styles.featuredSeats}>
                    <div className={styles.seatsBar}>
                      <div className={styles.seatsBarFill} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={styles.seatsText}>
                      {seatsLeft} of {featuredEvent.seats} seats remaining
                    </span>
                  </div>
                )}

                <div className={styles.featuredActions}>
                  <button type="button" className={styles.featuredBtn}>Reserve a Spot</button>
                  <button type="button" className={styles.featuredBtnSecondary}>Learn More</button>
                </div>
              </div>

            </div>
          </section>
        )
      })()}

      {/* ── 3. Filter + Browse ── */}
      <section id="upcoming" className={styles.browse}>
        <div className={styles.browseInner}>
          <div className={styles.browseHeader}>
            <div>
              <h2 className={styles.browseTitle}>Upcoming Events</h2>
              <p className={styles.browseSubtitle}>
                Browse what's coming up, or narrow things down by topic, month, or format.
              </p>
            </div>
            {activeFilterCount > 0 && (
              <button type="button" className={styles.clearAllBtn} onClick={clearAll}>
                Clear all
                <span className={styles.clearAllCount}>{activeFilterCount}</span>
              </button>
            )}
          </div>

          {/* Search bar */}
          <div className={styles.searchRow}>
            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                <path d="M16.5 16.5 L21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              <input
                type="search"
                className={styles.searchInput}
                placeholder="Search events, speakers, or topics..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search events"
              />
              {search && (
                <button
                  type="button"
                  className={styles.searchClear}
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" width="14" height="14">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Filter controls */}
          <div className={styles.filterBar}>
            {/* Category pills */}
            <div className={styles.filterGroup}>
              <span className={styles.filterGroupLabel}>Category</span>
              <div className={styles.filterPills}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className={styles.filterBtn}
                    data-active={cat === activeCategory}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat === 'All' ? 'All Events' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Dropdowns row */}
            <div className={styles.filterDropdowns}>
              <div className={styles.filterSelectGroup}>
                <label className={styles.filterSelectLabel} htmlFor="month-filter">Month</label>
                <div className={styles.selectWrap}>
                  <select
                    id="month-filter"
                    className={styles.filterSelect}
                    value={month}
                    onChange={e => setMonth(e.target.value)}
                  >
                    {MONTHS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <svg className={styles.selectChevron} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className={styles.filterSelectGroup}>
                <label className={styles.filterSelectLabel} htmlFor="format-filter">Format</label>
                <div className={styles.selectWrap}>
                  <select
                    id="format-filter"
                    className={styles.filterSelect}
                    value={format}
                    onChange={e => setFormat(e.target.value)}
                  >
                    {FORMATS.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  <svg className={styles.selectChevron} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Result count */}
          <div className={styles.resultCount}>
            <span className={styles.resultCountNumber}>{filtered.length}</span>
            {' '}event{filtered.length !== 1 ? 's' : ''} found
          </div>

          {/* ── 4. Events Grid ── */}
          {filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M8 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p className={styles.emptyTitle}>No events found</p>
              <p className={styles.emptyText}>
                Try broadening your search or adjusting your filters — there may be something just around the corner.
              </p>
              <button type="button" className={styles.emptyClear} onClick={clearAll}>
                Clear all filters
              </button>
            </div>
          ) : (
            <div className={styles.eventsGrid}>
              {filtered.map((event, idx) => {
                const { month, day, weekday } = formatDate(event.date)
                const seatsLeft = event.seats ? event.seats - event.registered : null
                return (
                  <article
                    key={event.id}
                    className={styles.eventCard}
                    data-emphasis={idx === 0 ? 'true' : undefined}
                  >
                    {/* Image area */}
                    <div className={styles.cardImageWrap}>
                      {event.image && (
                        <img src={event.image} alt={event.title} className={styles.cardImg} />
                      )}
                      {/* Date badge */}
                      <div className={styles.cardDateBadge}>
                        <span className={styles.cardDateMonth}>{month}</span>
                        <span className={styles.cardDateDay}>{day}</span>
                      </div>
                      {/* Category tag */}
                      <span className={styles.cardCatTag} data-cat={event.category}>
                        {event.category}
                      </span>
                      {/* Format pill */}
                      {event.format && (
                        <span className={styles.cardFormatPill} data-format={event.format}>
                          {event.format}
                        </span>
                      )}
                    </div>

                    {/* Card body */}
                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>{event.title}</h3>
                      <p className={styles.cardDesc}>{event.description}</p>

                      <div className={styles.cardMeta}>
                        <span className={styles.cardMetaItem}>
                          <svg className={styles.cardMetaIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {weekday} · {event.time}
                        </span>
                        <span className={styles.cardMetaItem}>
                          <svg className={styles.cardMetaIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 12 6 12s6-7.582 6-12c0-3.314-2.686-6-6-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                            <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                          </svg>
                          {event.location}
                        </span>
                      </div>

                      {/* Footer: seats + CTA */}
                      <div className={styles.cardFooter}>
                        {seatsLeft !== null ? (
                          <div className={styles.cardSeats}>
                            <div className={styles.seatsBar}>
                              <div
                                className={styles.seatsBarFill}
                                style={{ width: `${(event.registered / event.seats) * 100}%` }}
                              />
                            </div>
                            <span className={styles.seatsText}>
                              {seatsLeft} left
                            </span>
                          </div>
                        ) : (
                          <span className={styles.cardOpenLabel}>Open attendance</span>
                        )}
                        <button type="button" className={styles.cardBtn}>
                          {seatsLeft !== null ? 'Register' : 'Learn More'}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Voices — quote interstitial ── */}
      <section className={styles.voices}>
        <div className={styles.voicesInner}>
          <div className={styles.voicesGrid}>
            <blockquote className={styles.voiceCard}>
              <p className={styles.voiceText}>
                "The poetry evening was one of the most memorable nights of
                my time at LAU. I didn't expect to feel that connected to
                a room full of strangers — but the words made us all feel close."
              </p>
              <footer className={styles.voiceAttr}>
                <span className={styles.voiceAuthor}>Sara M.</span>
                <span className={styles.voiceRole}>English Literature, Senior</span>
              </footer>
            </blockquote>
            <blockquote className={styles.voiceCard}>
              <p className={styles.voiceText}>
                "I only came for a citation workshop, but I ended up at three
                more events that semester. Honestly, the library became my
                favorite place on campus."
              </p>
              <footer className={styles.voiceAttr}>
                <span className={styles.voiceAuthor}>Karim H.</span>
                <span className={styles.voiceRole}>Biology, Graduate Student</span>
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          {/* Left — newsletter signup */}
          <div className={styles.ctaPrimary}>
            <div className={styles.ctaIconWrap}>
              <svg className={styles.ctaIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 7l10 7 10-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className={styles.ctaTitle}>Never Miss an Event</h2>
            <p className={styles.ctaBody}>
              A short monthly note with the events worth knowing about —
              talks, workshops, exhibitions, and community gatherings at the library.
            </p>
            <form className={styles.ctaForm} onSubmit={e => e.preventDefault()}>
              <div className={styles.ctaInputWrap}>
                <input
                  type="email"
                  className={styles.ctaInput}
                  placeholder="Your email address"
                  aria-label="Email address for newsletter"
                />
                <button type="submit" className={styles.ctaSubmit}>Subscribe</button>
              </div>
              <p className={styles.ctaDisclaimer}>
                One email a month, no spam. Unsubscribe whenever you like.
              </p>
            </form>
          </div>

          {/* Right — partner / contact */}
          <div className={styles.ctaSecondary}>
            <div className={styles.ctaPartnerCard}>
              <div className={styles.ctaPartnerIconWrap}>
                <svg className={styles.ctaPartnerIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M17 20c0-2.21-2.239-4-5-4s-5 1.79-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M23 20c0-1.863-1.571-3.45-3.75-3.875" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M18 6.25A3 3 0 0 1 18 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className={styles.ctaPartnerTitle}>Host or Partner With Us</h3>
              <p className={styles.ctaPartnerBody}>
                Have an idea for an event, a workshop you'd like to lead, or
                a collaboration in mind? We're always open to new voices.
              </p>
              <a
                href="mailto:libraries@lau.edu.lb"
                className={styles.ctaPartnerBtn}
              >
                Get in Touch
                <svg className={styles.ctaPartnerArrow} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>

            <a href="/visit" className={styles.ctaVisitLink}>
              <svg className={styles.ctaVisitIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 12 6 12s6-7.582 6-12c0-3.314-2.686-6-6-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <span>Plan your visit to the library</span>
              <span className={styles.ctaVisitArrow}>&rarr;</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}

export default Events
