import { Link, useParams } from 'react-router-dom'
import { EVENTS } from '@/data/eventsData'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function formatEventDate(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`)

  return {
    month: MONTH_NAMES[date.getMonth()],
    day: date.getDate(),
    fullDate: `${DAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`,
  }
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

function EventDetails() {
  const { id } = useParams()
  const event = EVENTS.find((item) => String(item.id) === id)

  if (!event) {
    return (
      <main className="min-h-screen bg-[#F2F5F3] px-5 py-20 text-[#1C2B24] dark:bg-[#121212] dark:text-[#f5f7f6]">
        <div className="mx-auto max-w-[760px] rounded-[18px] border border-[#d0ddd8] bg-white p-8 text-center shadow-sm dark:border-[#333333] dark:bg-[#1f1f1f]">
          <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#006751] dark:text-[#5ecba1]">Event Not Found</p>
          <h1 className="mb-4 text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold tracking-[-0.03em]">We could not find that event.</h1>
          <p className="mx-auto mb-6 max-w-[42ch] text-[0.92rem] leading-[1.7] text-[#5a6b62] dark:text-[#8c9691]">
            The event link may be outdated, or the event may have been removed from the current schedule.
          </p>
          <Link to="/events" className="inline-flex rounded-lg bg-[#1a6644] px-5 py-2.5 text-[0.82rem] font-semibold text-white transition hover:bg-[#14533a]">
            Back to Events
          </Link>
        </div>
      </main>
    )
  }

  const { month, day, fullDate } = formatEventDate(event.date)
  const seatsLeft = event.seats ? event.seats - event.registered : null
  const relatedEvents = EVENTS.filter((item) => item.id !== event.id && item.category === event.category).slice(0, 3)

  return (
    <main className="min-h-screen bg-[#F2F5F3] text-[#1C2B24] dark:bg-[#121212] dark:text-[#f5f7f6]">
      <section className="relative overflow-hidden bg-[linear-gradient(165deg,#0A2E22_0%,#061C14_100%)] px-5 py-14 sm:px-6 md:px-10 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_80%,rgba(0,171,142,0.08)_0%,transparent_70%),radial-gradient(ellipse_40%_40%_at_80%_20%,rgba(196,112,95,0.06)_0%,transparent_70%)]" />
        <div className="relative mx-auto max-w-[var(--container-max)]">
          <Link to="/events" className="mb-6 inline-flex items-center gap-2 text-[0.78rem] font-semibold text-[rgba(240,248,244,0.72)] transition hover:text-white">
            <span aria-hidden="true">&larr;</span>
            Back to events
          </Link>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_360px] lg:items-center">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className={`rounded-full bg-white/10 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] backdrop-blur-sm ${categoryColor(event.category)}`}>
                  {event.category}
                </span>
                {event.format && (
                  <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[rgba(240,248,244,0.72)]">
                    {event.format}
                  </span>
                )}
              </div>

              <h1 className="mb-4 max-w-[16ch] text-[clamp(2rem,4.2vw,3.4rem)] font-extrabold leading-[1.04] tracking-[-0.05em] text-[rgba(240,248,244,0.96)]">
                {event.title}
              </h1>
              <p className="mb-7 max-w-[58ch] text-[0.96rem] leading-[1.8] text-[rgba(240,248,244,0.58)]">
                {event.longDescription || event.description}
              </p>

              <div className="grid gap-4 rounded-[18px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Date', fullDate],
                  ['Time', event.time],
                  ['Location', event.location],
                  ['Speaker', event.speaker || 'Library team'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span className="mb-1 block text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[rgba(240,248,244,0.4)]">{label}</span>
                    <span className="text-[0.82rem] font-semibold text-[rgba(240,248,244,0.92)]">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[24px] border border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.22)]">
              <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
              <div className="absolute left-4 top-4 flex w-16 flex-col items-center rounded-[12px] border border-white/12 bg-[rgba(6,26,18,0.8)] py-2 shadow-[0_4px_16px_rgba(0,0,0,0.28)] backdrop-blur-[10px]">
                <span className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[#5ecba1]">{month}</span>
                <span className="text-[1.65rem] font-extrabold leading-none text-[rgba(240,248,244,0.95)]">{day}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-6 md:px-10">
        <div className="mx-auto grid max-w-[var(--container-max)] gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-8">
            <article className="rounded-[18px] border border-[#d0ddd8] bg-white p-6 shadow-sm dark:border-[#333333] dark:bg-[#1f1f1f]">
              <h2 className="mb-4 text-[1.2rem] font-extrabold tracking-[-0.02em]">About This Event</h2>
              <p className="mb-5 text-[0.9rem] leading-[1.85] text-[#5a6b62] dark:text-[#8c9691]">{event.longDescription || event.description}</p>

              {event.highlights?.length > 0 && (
                <div>
                  <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#5a6b62]/60 dark:text-[#8c9691]">What to Expect</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {event.highlights.map((item) => (
                      <div key={item} className="rounded-[14px] bg-[#F2F5F3] px-4 py-3 text-[0.82rem] leading-[1.7] text-[#355246] dark:bg-[#121212] dark:text-[#c5cec9]">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>

            <article className="grid gap-4 rounded-[18px] border border-[#d0ddd8] bg-[linear-gradient(160deg,rgba(253,250,244,1)_0%,rgba(247,242,232,1)_100%)] p-6 shadow-sm md:grid-cols-2 dark:border-[#333333] dark:bg-[#1f1f1f] dark:[background-image:none]">
              <div>
                <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#5a6b62]/60 dark:text-[#8c9691]">Who It&apos;s For</p>
                <p className="text-[0.86rem] leading-[1.8] text-[#4f6158] dark:text-[#c5cec9]">{event.audience || 'Students, faculty, researchers, and community members interested in the topic.'}</p>
              </div>
              <div>
                <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#5a6b62]/60 dark:text-[#8c9691]">Why Attend</p>
                <p className="text-[0.86rem] leading-[1.8] text-[#4f6158] dark:text-[#c5cec9]">{event.takeaway || 'A focused session with practical insight, useful conversation, and time to connect with others.'}</p>
              </div>
            </article>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[18px] border border-[#d0ddd8] bg-white p-6 shadow-sm dark:border-[#333333] dark:bg-[#1f1f1f]">
              <h2 className="mb-4 text-[1rem] font-extrabold tracking-[-0.02em]">Attendance</h2>
              {seatsLeft !== null ? (
                <>
                  <div
                    className="mb-3 h-[7px] overflow-hidden rounded-full bg-[#d0ddd8] dark:bg-[#333333]"
                    role="progressbar"
                    aria-label={`Registration progress for ${event.title}`}
                    aria-valuemin={0}
                    aria-valuemax={event.seats}
                    aria-valuenow={event.registered}
                  >
                    <div className="h-full rounded-full bg-[#006751] dark:bg-[#5ecba1]" style={{ width: `${(event.registered / event.seats) * 100}%` }} />
                  </div>
                  <p className="mb-5 text-[0.84rem] leading-[1.7] text-[#5a6b62] dark:text-[#8c9691]">
                    <span className="font-semibold text-[#1C2B24] dark:text-[#f5f7f6]">{seatsLeft}</span> seats left out of {event.seats}.
                  </p>
                </>
              ) : (
                <p className="mb-5 text-[0.84rem] leading-[1.7] text-[#5a6b62] dark:text-[#8c9691]">This event is open attendance, so you can simply drop in during the scheduled hours.</p>
              )}

              <button type="button" className="mb-3 w-full rounded-lg bg-[#1a6644] px-5 py-3 text-[0.82rem] font-semibold text-white transition hover:bg-[#14533a]">
                {seatsLeft !== null ? 'Reserve a Spot' : 'Add to Your Plans'}
              </button>
            </div>

            <div className="rounded-[18px] border border-[#d0ddd8] bg-white p-6 shadow-sm dark:border-[#333333] dark:bg-[#1f1f1f]">
              <h2 className="mb-4 text-[1rem] font-extrabold tracking-[-0.02em]">Event Snapshot</h2>
              <div className="space-y-4 text-[0.82rem]">
                {[
                  ['Format', event.format || 'In-Person'],
                  ['Category', event.category],
                  ['Campus', event.location.includes('Byblos') ? 'Byblos' : 'Beirut'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4 border-b border-[#eef2ef] pb-3 last:border-b-0 last:pb-0 dark:border-[#2b2b2b]">
                    <span className="text-[#5a6b62] dark:text-[#8c9691]">{label}</span>
                    <span className="text-right font-semibold text-[#1C2B24] dark:text-[#f5f7f6]">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {relatedEvents.length > 0 && (
              <div className="rounded-[18px] border border-[#d0ddd8] bg-white p-6 shadow-sm dark:border-[#333333] dark:bg-[#1f1f1f]">
                <h2 className="mb-4 text-[1rem] font-extrabold tracking-[-0.02em]">More Like This</h2>
                <div className="space-y-4">
                  {relatedEvents.map((item) => (
                    <Link key={item.id} to={`/events/${item.id}`} className="block rounded-[14px] bg-[#F2F5F3] p-4 transition hover:bg-[#e8eeea] dark:bg-[#121212] dark:hover:bg-[#171717]">
                      <p className="mb-1 text-[0.8rem] font-bold leading-[1.45] text-[#1C2B24] dark:text-[#f5f7f6]">{item.title}</p>
                      <p className="text-[0.72rem] text-[#5a6b62] dark:text-[#8c9691]">{formatEventDate(item.date).fullDate}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  )
}

export default EventDetails
