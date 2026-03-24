function getLibraryStatus() {
  const now = new Date()
  const day = now.getDay()
  const hour = now.getHours() + now.getMinutes() / 60

  if (day >= 1 && day <= 5) {
    if (hour < 7.5) return { open: false, message: 'Opens at 7:30 AM' }
    if (hour >= 22) {
      return {
        open: false,
        message: day === 5 ? 'Opens Monday at 7:30 AM' : 'Opens tomorrow at 7:30 AM',
      }
    }
    if (hour >= 21) return { open: true, message: 'Closing at 10:00 PM' }
    return { open: true, message: 'Open until 10:00 PM' }
  }

  return { open: false, message: 'Opens Monday at 7:30 AM' }
}

const sectionTitleBar =
  'before:mb-3 before:block before:h-[3px] before:w-10 before:rounded-full before:bg-gradient-to-r before:from-[#006751] before:to-[rgba(0,103,81,0.35)] sm:before:mb-[1.15rem] dark:before:from-[#5ecba1] dark:before:to-[rgba(94,203,161,0.25)]'

const iconWrapClass =
  'mb-4 flex h-10 w-10 items-center justify-center rounded-[10px] border border-[rgba(0,103,81,0.12)] bg-[rgba(0,103,81,0.07)] text-[#006751] sm:mb-[1.15rem] sm:h-[42px] sm:w-[42px] dark:border-[rgba(94,203,161,0.16)] dark:bg-[rgba(94,203,161,0.08)] dark:text-[#5ecba1]'

const spaceCards = [
  {
    title: 'Quiet Study Areas',
    body: 'Designated silent zones on upper floors with individual carrels and soft lighting, ideal for exam preparation and deep reading.',
    note: 'Floors 2 & 3 - Phones on silent',
    icon: (
      <>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="2" x2="12" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: 'Reading Rooms',
    body: 'Open reading halls with natural light, comfortable seating, and access to periodicals, newspapers, and reference materials.',
    note: 'Ground & 1st floor - No food or drinks',
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
    title: 'Group Study Rooms',
    body: 'Enclosed rooms equipped with whiteboards and display screens, suitable for group projects, study sessions, and discussions.',
    note: '4-8 people - Reservable - Leave tidy',
    icon: (
      <>
        <path d="M17 20c0-2.21-2.239-4-5-4s-5 1.79-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M23 20c0-1.863-1.571-3.45-3.75-3.875" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M18 6.25A3 3 0 0 1 18 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: 'Computer Workstations',
    body: 'Desktop stations with internet access, available on a walk-in basis for research, coursework, and academic writing.',
    note: 'Ground floor - LAU login required',
    icon: (
      <>
        <rect x="2" y="4" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 22h8M12 18v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: 'Individual Study Desks',
    body: 'Personal workspaces with power outlets spread across all floors, offering a balance of openness and privacy for focused work.',
    note: 'All floors - First come, first served',
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
    title: 'Multipurpose Hall',
    body: 'A flexible event space used for lectures, workshops, screenings, and academic presentations hosted by the library.',
    note: 'Ground floor - By reservation only',
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 15h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 3v12M16 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
  },
]

function Visit() {
  const status = getLibraryStatus()

  return (
    <div className="min-h-screen bg-[#F2F5F3] text-[#1C2B24] dark:bg-[#121212] dark:text-[#f5f7f6]">
      <section className="px-4 py-5 sm:px-6 sm:py-7 md:px-8 md:py-10">
        <div className="mx-auto max-w-[var(--container-max)]">
<h1 className={`max-w-3xl text-[clamp(1.45rem,7vw,2.25rem)] font-extrabold leading-[1.05] tracking-[-0.032em] text-[#1C2B24] dark:text-[#f5f7f6] ${sectionTitleBar}`}>
            Visit Our Libraries
          </h1>
          <p className="max-w-[52ch] text-[0.84rem] leading-[1.62] text-[#595959] sm:text-[0.9rem] sm:leading-[1.72] dark:text-[#8c9691]">
            Plan your visit, find our locations on the Beirut and Byblos campuses, and explore the spaces and resources available to you.
          </p>

          <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-[18px] border border-[#d0ddd8] bg-white px-3 py-2 text-[0.72rem] font-medium tracking-[0.02em] shadow-sm sm:mt-5 sm:rounded-full sm:px-4 dark:border-[#333333] dark:bg-[#1f1f1f]">
            <span
              className={`h-[7px] w-[7px] rounded-full ${
                status.open
                  ? 'bg-[#4caf7d] shadow-[0_0_0_2.5px_rgba(76,175,125,0.18)]'
                  : 'bg-[#c0392b] shadow-[0_0_0_2.5px_rgba(192,57,43,0.15)]'
              }`}
            />
            <span className="font-bold text-[#1C2B24] dark:text-[#f5f7f6]">{status.open ? 'Open Now' : 'Closed'}</span>
            {status.message && (
              <>
                <span className="text-[0.65rem] text-[#d0ddd8] dark:text-[#333333]">/</span>
                <span className="text-[#5a6b62] dark:text-[#8c9691]">{status.message}</span>
              </>
            )}
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-[var(--container-max)] overflow-hidden rounded-[16px] sm:mt-10 sm:h-[260px] md:h-[220px] md:rounded-[12px]">
          <img
            src="https://images.unsplash.com/photo-1568667256549-094345857637?w=1200&q=80"
            alt="University library interior"
            className="aspect-[16/10] w-full object-cover object-center [object-position:center_40%] sm:h-full sm:aspect-auto"
          />
        </div>
      </section>

      <section className="px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-8">
        <div className="mx-auto max-w-[var(--container-max)]">
          <div className="grid gap-px overflow-hidden rounded-[14px] bg-[#d0ddd8] shadow-[0_1px_0_rgba(255,255,255,0.65)_inset,0_4px_20px_rgba(0,0,0,0.07),0_1px_3px_rgba(0,0,0,0.04)] sm:grid-cols-2 sm:gap-0 lg:grid-cols-4 dark:bg-[#333333]">
            {[
              {
                title: 'Hours',
                value: 'Mon - Fri',
                detail: '7:30 AM - 10:00 PM',
                extra: 'Saturday - Sunday',
                extraDetail: 'Closed',
                icon: (
                  <>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </>
                ),
              },
              {
                title: 'Beirut Campus',
                value: 'Riyad Nassar Library',
                detail: 'Mme. Curie Street, Koraytem',
                extraDetail: 'Beirut, Lebanon',
                icon: (
                  <>
                    <path d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 12 6 12s6-7.582 6-12c0-3.314-2.686-6-6-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
                  </>
                ),
              },
              {
                title: 'Byblos/Jbeil Campus',
                value: 'Joseph G. Jabbra Library',
                detail: 'Blat, Byblos',
                extraDetail: 'Mount Lebanon, Lebanon',
                icon: (
                  <>
                    <path d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 12 6 12s6-7.582 6-12c0-3.314-2.686-6-6-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
                  </>
                ),
              },
              {
                title: 'Special Hours',
                detail:
                  'Hours may change during holidays, exam periods, and university breaks. Check LAU announcements for updates.',
                icon: (
                  <>
                    <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </>
                ),
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col bg-white px-4 py-5 sm:px-6 sm:py-[1.85rem] dark:bg-[#1f1f1f]">
                <svg className="mb-3 h-5 w-5 text-[#006751] sm:mb-4 sm:h-[22px] sm:w-[22px] dark:text-[#5ecba1]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  {item.icon}
                </svg>
                <h3 className="mb-2 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[#006751] sm:mb-3 sm:text-[0.6rem] dark:text-[#5ecba1]">
                  {item.title}
                </h3>
                {item.value && <p className="text-[0.82rem] font-bold leading-[1.35] sm:text-[0.88rem] dark:text-[#f5f7f6]">{item.value}</p>}
                {item.detail && <p className="text-[0.76rem] leading-[1.5] sm:text-[0.8rem] sm:leading-[1.6] text-[#5a6b62] dark:text-[#8c9691]">{item.detail}</p>}
                {item.extra && <p className="mt-1.5 text-[0.82rem] font-bold leading-[1.35] sm:mt-2 sm:text-[0.88rem] dark:text-[#f5f7f6]">{item.extra}</p>}
                {item.extraDetail && <p className="text-[0.76rem] leading-[1.5] sm:text-[0.8rem] sm:leading-[1.6] text-[#5a6b62] dark:text-[#8c9691]">{item.extraDetail}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
        <div className="mx-auto max-w-[var(--container-max)]">
          <div className="mb-7 sm:mb-10">
            <h2 className={`text-[clamp(1.3rem,2.6vw,1.75rem)] font-extrabold tracking-[-0.028em] text-[#1C2B24] dark:text-[#f5f7f6] ${sectionTitleBar}`}>
              Location & Directions
            </h2>
            <p className="max-w-[52ch] text-[0.84rem] leading-[1.62] sm:text-[0.9rem] sm:leading-[1.72] text-[#595959] dark:text-[#8c9691]">
              Our libraries serve both LAU campuses. Find the location nearest to you and plan your route.
            </p>
          </div>

          <div className="mx-auto grid max-w-[980px] gap-4 sm:gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-[14px] border border-[#d0ddd8] bg-white shadow-sm transition-shadow hover:shadow-[0_2px_8px_rgba(28,43,36,0.08),0_8px_24px_rgba(28,43,36,0.08)] dark:border-[#333333] dark:bg-[#1f1f1f]">
              <div className="relative aspect-[16/11] border-b border-[#d0ddd8] bg-[#EDF3F0] sm:aspect-video dark:border-[#333333] dark:bg-[#242424]">
                <iframe
                  className="absolute inset-0 h-full w-full border-0"
                  title="LAU Beirut Campus Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1656.2!2d35.47515!3d33.89415!2m3!1f0!2f0!3f0!2f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151f17215880a78f%3A0x729182bec7a0a1e3!2sLebanese%20American%20University%20-%20Beirut%20Campus!5e0!3m2!1sen!2slb!4v1"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>

              <div className="flex flex-col gap-3 px-4 py-5 sm:gap-4 sm:px-7 sm:py-7">
                <h3 className="text-[0.98rem] font-extrabold tracking-[-0.02em] sm:text-[1.05rem] text-[#1C2B24] dark:text-[#f5f7f6]">Beirut Campus</h3>

                <div className="flex items-start gap-3">
                  <svg className="mt-[2px] h-4 w-4 shrink-0 text-[#006751]/55 dark:text-[#5ecba1]/75" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 12 6 12s6-7.582 6-12c0-3.314-2.686-6-6-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <div>
                    <p className="text-[0.82rem] font-semibold leading-[1.4] sm:text-[0.86rem] text-[#1C2B24] dark:text-[#f5f7f6]">Mme. Curie Street, Koraytem</p>
                    <p className="text-[0.76rem] leading-[1.4] sm:text-[0.8rem] text-[#5a6b62] dark:text-[#8c9691]">Beirut, Lebanon</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="mt-[2px] h-4 w-4 shrink-0 text-[#006751]/55 dark:text-[#5ecba1]/75" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 9h18M9 3v18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <p className="text-[0.76rem] leading-[1.5] sm:text-[0.8rem] sm:leading-[1.55] text-[#5a6b62] dark:text-[#8c9691]">Underground parking beneath the main campus building</p>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="mt-[2px] h-4 w-4 shrink-0 text-[#006751]/55 dark:text-[#5ecba1]/75" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <p className="text-[0.76rem] leading-[1.5] sm:text-[0.8rem] sm:leading-[1.55] text-[#5a6b62] dark:text-[#8c9691]">Near Koraytem Mosque, off Clemenceau Street</p>
                </div>

                <a
                  href="https://www.google.com/maps/dir//Lebanese+American+University+Beirut+Campus,+Koraytem,+Beirut,+Lebanon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-md border border-transparent bg-[#1a6644] px-[1.15rem] py-[0.6rem] text-[0.8rem] font-semibold tracking-[0.03em] text-white shadow-[0_1px_3px_rgba(26,102,68,0.3)] transition hover:bg-[#14533a] hover:shadow-[0_2px_8px_rgba(26,102,68,0.3)] dark:bg-[#1a6644] dark:text-white dark:hover:bg-[#14533a] max-[480px]:w-full"
                >
                  <svg className="h-[14px] w-[14px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 12 6 12s6-7.582 6-12c0-3.314-2.686-6-6-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  Get Directions
                </a>
              </div>

              <div className="border-t border-black/5 px-4 py-2.5 text-[0.64rem] leading-[1.35] tracking-[0.01em] text-[#5a6b62]/50 sm:px-7 sm:py-3 sm:text-[0.67rem] dark:border-white/5 dark:text-[#8c9691]/65">
                ID required for entry - Bags may be checked
              </div>
            </div>

            <div className="overflow-hidden rounded-[14px] border border-[#d0ddd8] bg-white shadow-sm transition-shadow hover:shadow-[0_2px_8px_rgba(28,43,36,0.08),0_8px_24px_rgba(28,43,36,0.08)] dark:border-[#333333] dark:bg-[#1f1f1f]">
              <div className="relative aspect-[16/11] border-b border-[#d0ddd8] bg-[#EDF3F0] sm:aspect-video dark:border-[#333333] dark:bg-[#242424]">
                <iframe
                  className="absolute inset-0 h-full w-full border-0"
                  title="LAU Byblos Campus Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3311.184779367851!2d35.648267!3d34.121757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1521f5d6d6f8db8f%3A0x1e0cb1f6ccf9f1cb!2sLebanese%20American%20University%20-%20Byblos%20Campus!5e0!3m2!1sen!2slb!4v1"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>

              <div className="flex flex-col gap-3 px-4 py-5 sm:gap-4 sm:px-7 sm:py-7">
                <h3 className="text-[0.98rem] font-extrabold tracking-[-0.02em] sm:text-[1.05rem] text-[#1C2B24] dark:text-[#f5f7f6]">Byblos Campus</h3>

                <div className="flex items-start gap-3">
                  <svg className="mt-[2px] h-4 w-4 shrink-0 text-[#006751]/55 dark:text-[#5ecba1]/75" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 12 6 12s6-7.582 6-12c0-3.314-2.686-6-6-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <div>
                    <p className="text-[0.82rem] font-semibold leading-[1.4] sm:text-[0.86rem] text-[#1C2B24] dark:text-[#f5f7f6]">Blat, Byblos</p>
                    <p className="text-[0.76rem] leading-[1.4] sm:text-[0.8rem] text-[#5a6b62] dark:text-[#8c9691]">Mount Lebanon, Lebanon</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="mt-[2px] h-4 w-4 shrink-0 text-[#006751]/55 dark:text-[#5ecba1]/75" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 9h18M9 3v18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <p className="text-[0.76rem] leading-[1.5] sm:text-[0.8rem] sm:leading-[1.55] text-[#5a6b62] dark:text-[#8c9691]">Visitor parking available near the main campus entrance</p>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="mt-[2px] h-4 w-4 shrink-0 text-[#006751]/55 dark:text-[#5ecba1]/75" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <p className="text-[0.76rem] leading-[1.5] sm:text-[0.8rem] sm:leading-[1.55] text-[#5a6b62] dark:text-[#8c9691]">Inside LAU Byblos campus, a short walk from the main academic buildings</p>
                </div>

                <a
                  href="https://www.google.com/maps/dir//Lebanese+American+University+Byblos+Campus,+Blat,+Lebanon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-md border border-transparent bg-[#1a6644] px-[1.15rem] py-[0.6rem] text-[0.8rem] font-semibold tracking-[0.03em] text-white shadow-[0_1px_3px_rgba(26,102,68,0.3)] transition hover:bg-[#14533a] hover:shadow-[0_2px_8px_rgba(26,102,68,0.3)] dark:bg-[#1a6644] dark:text-white dark:hover:bg-[#14533a] max-[480px]:w-full"
                >
                  <svg className="h-[14px] w-[14px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 12 6 12s6-7.582 6-12c0-3.314-2.686-6-6-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  Get Directions
                </a>
              </div>

              <div className="border-t border-black/5 px-4 py-2.5 text-[0.64rem] leading-[1.35] tracking-[0.01em] text-[#5a6b62]/50 sm:px-7 sm:py-3 sm:text-[0.67rem] dark:border-white/5 dark:text-[#8c9691]/65">
                ID required for entry - Visitor guidance available at the gate
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
        <div className="mx-auto max-w-[var(--container-max)]">
          <div className="mb-7 sm:mb-10">
            <h2 className={`text-[clamp(1.3rem,2.6vw,1.75rem)] font-extrabold tracking-[-0.028em] text-[#1C2B24] dark:text-[#f5f7f6] ${sectionTitleBar}`}>
              Library Spaces
            </h2>
            <p className="max-w-[52ch] text-[0.84rem] leading-[1.62] sm:text-[0.9rem] sm:leading-[1.72] text-[#595959] dark:text-[#8c9691]">
              Whether you need silence to focus or a room to collaborate, the library offers a variety of spaces designed for every kind of work.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-6">
            {spaceCards.map((space) => (
              <div
                key={space.title}
                className="flex flex-col rounded-[14px] border border-[#d0ddd8] bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-[3px] hover:shadow-[0_2px_8px_rgba(28,43,36,0.08),0_12px_32px_rgba(28,43,36,0.09)] sm:p-6 dark:border-[#333333] dark:bg-[#1f1f1f] max-[768px]:hover:translate-y-0"
              >
                <div className={iconWrapClass}>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    {space.icon}
                  </svg>
                </div>
                <h3 className="mb-1.5 text-[0.9rem] font-bold tracking-[-0.01em] sm:mb-2 sm:text-[0.94rem] text-[#1C2B24] dark:text-[#f5f7f6]">{space.title}</h3>
                <p className="flex-1 text-[0.78rem] leading-[1.58] sm:text-[0.82rem] sm:leading-[1.7] text-[#5a6b62] dark:text-[#8c9691]">{space.body}</p>
                <p className="mt-3 border-t border-[rgba(0,103,81,0.08)] pt-2.5 text-[0.68rem] font-semibold tracking-[0.02em] sm:mt-[0.85rem] sm:pt-3 sm:text-[0.7rem] text-[#006751]/60 dark:border-[rgba(94,203,161,0.12)] dark:text-[#5ecba1]/75">
                  {space.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[rgba(0,103,81,0.06)] px-4 py-5 text-center sm:px-6 sm:py-6 md:px-8 md:py-7 dark:border-[rgba(94,203,161,0.12)]">
        <div className="mx-auto flex max-w-[460px] flex-col items-center justify-center">
          <h2 className="mb-2 text-[clamp(1.2rem,2.4vw,1.5rem)] font-extrabold tracking-[-0.025em] text-[#1C2B24] dark:text-[#f5f7f6]">
            Need Help Planning Your Visit?
          </h2>
          <p className="mb-4 max-w-[42ch] text-center text-[0.82rem] leading-[1.58] sm:mb-3 sm:text-[0.86rem] sm:leading-[1.68] text-[#595959] dark:text-[#8c9691]">
            Our staff is happy to assist with directions, accessibility needs, or any questions before you arrive.
          </p>
          <div className="flex w-full flex-col items-stretch justify-center gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
            <a
              href="mailto:libraries@lau.edu.lb"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#d0ddd8] bg-white px-4 py-3 text-[0.82rem] font-semibold text-[#006751] transition-opacity hover:opacity-70 sm:min-h-0 sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:text-[0.84rem] dark:border-[#333333] dark:bg-[#1f1f1f] dark:text-[#5ecba1] sm:dark:bg-transparent"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2 7l10 7 10-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              libraries@lau.edu.lb
            </a>
            <span className="hidden h-[1.1rem] w-px bg-[#d0ddd8] sm:block dark:bg-[#333333]" />
            <a
              href="tel:+9611786456"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#d0ddd8] bg-white px-4 py-3 text-[0.82rem] font-semibold text-[#006751] transition-opacity hover:opacity-70 sm:min-h-0 sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:text-[0.84rem] dark:border-[#333333] dark:bg-[#1f1f1f] dark:text-[#5ecba1] sm:dark:bg-transparent"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              +961 1 786 456
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Visit
