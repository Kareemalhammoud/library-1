import styles from './Visit.module.css'

function getLibraryStatus() {
  const now  = new Date()
  const day  = now.getDay()          // 0 Sun … 6 Sat
  const hour = now.getHours() + now.getMinutes() / 60

  if (day >= 1 && day <= 5) {
    if (hour < 7.5)  return { open: false, message: 'Opens at 7:30 AM' }
    if (hour >= 22)  return { open: false, message: 'Opens tomorrow at 7:30 AM' }
    if (hour >= 21)  return { open: true,  message: 'Closing at 10:00 PM' }
    return { open: true, message: 'Open until 10:00 PM' }
  }

  if (day === 5 && hour >= 22) return { open: false, message: 'Opens Monday at 7:30 AM' }
  if (day === 6)               return { open: false, message: 'Opens Monday at 7:30 AM' }
  /* Sunday */                 return { open: false, message: 'Opens tomorrow at 7:30 AM' }
}

function Visit() {
  const status = getLibraryStatus()

  return (
    <div className={styles.page}>

      {/* ── Intro ── */}
      <section className={styles.intro}>
        <div className={styles.introInner}>
          <p className={styles.introEyebrow}>Riyad Nassar Library</p>
          <h1 className={styles.introTitle}>Visit Riyad Nassar Library</h1>
          <p className={styles.introSub}>
            Plan your visit, find our locations on the Beirut and Byblos campuses,
            and explore the spaces and resources available to you.
          </p>
          <div className={styles.statusPill} data-open={status.open}>
            <span className={styles.statusDot} data-open={status.open} />
            <span className={styles.statusLabel}>
              {status.open ? 'Open Now' : 'Closed'}
            </span>
            {status.message && (
              <>
                <span className={styles.statusSep}>·</span>
                <span className={styles.statusMessage}>{status.message}</span>
              </>
            )}
          </div>
        </div>
        <div className={styles.introStrip}>
          <img
            src="https://images.unsplash.com/photo-1568667256549-094345857637?w=1200&q=80"
            alt="University library interior"
            className={styles.introStripImg}
          />
        </div>
      </section>

      {/* ── At a Glance ── */}
      <section className={styles.glance}>
        <div className={styles.glanceInner}>
        <div className={styles.glanceGrid}>

          <div className={styles.glanceCard}>
            <svg className={styles.glanceIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3 className={styles.glanceLabel}>Hours</h3>
            <p className={styles.glanceValue}>Mon – Fri</p>
            <p className={styles.glanceDetail}>7:30 AM – 10:00 PM</p>
            <p className={styles.glanceValue} style={{ marginTop: '0.5rem' }}>Saturday – Sunday</p>
            <p className={styles.glanceDetail}>Closed</p>
          </div>

          <div className={styles.glanceCard}>
            <svg className={styles.glanceIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 12 6 12s6-7.582 6-12c0-3.314-2.686-6-6-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <h3 className={styles.glanceLabel}>Beirut Campus</h3>
            <p className={styles.glanceValue}>Riyad Nassar Library</p>
            <p className={styles.glanceDetail}>Mme. Curie Street, Koraytem</p>
            <p className={styles.glanceDetail}>Beirut, Lebanon</p>
          </div>

          <div className={styles.glanceCard}>
            <svg className={styles.glanceIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 12 6 12s6-7.582 6-12c0-3.314-2.686-6-6-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <h3 className={styles.glanceLabel}>Byblos Campus</h3>
            <p className={styles.glanceValue}>Riyad Nassar Library</p>
            <p className={styles.glanceDetail}>Blat, Byblos</p>
            <p className={styles.glanceDetail}>Mount Lebanon, Lebanon</p>
          </div>

          <div className={styles.glanceCard}>
            <svg className={styles.glanceIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <h3 className={styles.glanceLabel}>Special Hours</h3>
            <p className={styles.glanceDetail}>
              Hours may change during holidays, exam periods, and university
              breaks. Check LAU announcements for updates.
            </p>
          </div>

        </div>
        </div>
      </section>

      {/* ── 1. Location & Directions ── */}
      <section className={styles.section} data-warm="true">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Location & Directions</h2>
            <p className={styles.sectionSubtitle}>
              The Riyad Nassar Library serves both LAU campuses. Find the
              location nearest to you and plan your route.
            </p>
          </div>

          <div className={styles.locationGrid}>

            {/* Beirut */}
            <div className={styles.locationCard}>
              <div className={styles.mapWrap}>
                <iframe
                  className={styles.map}
                  title="LAU Beirut Campus Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1656.2!2d35.47515!3d33.89415!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151f17215880a78f%3A0x729182bec7a0a1e3!2sLebanese%20American%20University%20-%20Beirut%20Campus!5e0!3m2!1sen!2slb!4v1"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <div className={styles.locationInfo}>
                <h3 className={styles.locationCampus}>Beirut Campus</h3>
                <div className={styles.locationDetail}>
                  <svg className={styles.locationDetailIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 12 6 12s6-7.582 6-12c0-3.314-2.686-6-6-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  <div>
                    <p className={styles.locationAddress}>Mme. Curie Street, Koraytem</p>
                    <p className={styles.locationCity}>Beirut, Lebanon</p>
                  </div>
                </div>
                <div className={styles.locationDetail}>
                  <svg className={styles.locationDetailIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M3 9h18M9 3v18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <div>
                    <p className={styles.locationMeta}>Underground parking beneath the main campus building</p>
                  </div>
                </div>
                <div className={styles.locationDetail}>
                  <svg className={styles.locationDetailIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <div>
                    <p className={styles.locationMeta}>Near Koraytem Mosque, off Clemenceau Street</p>
                  </div>
                </div>
                <a
                  href="https://www.google.com/maps/dir//Lebanese+American+University+Beirut+Campus,+Koraytem,+Beirut,+Lebanon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.directionsBtn}
                >
                  <svg className={styles.directionsBtnIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 12 6 12s6-7.582 6-12c0-3.314-2.686-6-6-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  Get Directions
                </a>
              </div>
              <div className={styles.locationFooter}>
                <p className={styles.locationFooterText}>ID required for entry · Bags may be checked</p>
              </div>
            </div>


          </div>
        </div>
      </section>

      {/* ── 2. Library Spaces ── */}
      <section className={styles.section} data-alt="true">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Library Spaces</h2>
            <p className={styles.sectionSubtitle}>
              Whether you need silence to focus or a room to collaborate,
              the library offers a variety of spaces designed for every kind of work.
            </p>
          </div>

          <div className={styles.spacesGrid}>
            <div className={styles.spaceCard}>
              <div className={styles.spaceIconWrap}>
                <svg className={styles.spaceIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="12" y1="2" x2="12" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className={styles.spaceTitle}>Quiet Study Areas</h3>
              <p className={styles.spaceBody}>
                Designated silent zones on upper floors with individual carrels
                and soft lighting, ideal for exam preparation and deep reading.
              </p>
              <p className={styles.spaceNote}>Floors 2 & 3 · Phones on silent</p>
            </div>

            <div className={styles.spaceCard}>
              <div className={styles.spaceIconWrap}>
                <svg className={styles.spaceIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 19V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M4 19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M4 19a2 2 0 0 1 2-2h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M9 8h6M9 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className={styles.spaceTitle}>Reading Rooms</h3>
              <p className={styles.spaceBody}>
                Open reading halls with natural light, comfortable seating,
                and access to periodicals, newspapers, and reference materials.
              </p>
              <p className={styles.spaceNote}>Ground & 1st floor · No food or drinks</p>
            </div>

            <div className={styles.spaceCard}>
              <div className={styles.spaceIconWrap}>
                <svg className={styles.spaceIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M17 20c0-2.21-2.239-4-5-4s-5 1.79-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M23 20c0-1.863-1.571-3.45-3.75-3.875" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M18 6.25A3 3 0 0 1 18 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className={styles.spaceTitle}>Group Study Rooms</h3>
              <p className={styles.spaceBody}>
                Enclosed rooms equipped with whiteboards and display screens,
                suitable for group projects, study sessions, and discussions.
              </p>
              <p className={styles.spaceNote}>4–8 people · Reservable · Leave tidy</p>
            </div>

            <div className={styles.spaceCard}>
              <div className={styles.spaceIconWrap}>
                <svg className={styles.spaceIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 22h8M12 18v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className={styles.spaceTitle}>Computer Workstations</h3>
              <p className={styles.spaceBody}>
                Desktop stations with internet access, available on a
                walk-in basis for research, coursework, and academic writing.
              </p>
              <p className={styles.spaceNote}>Ground floor · LAU login required</p>
            </div>

            <div className={styles.spaceCard}>
              <div className={styles.spaceIconWrap}>
                <svg className={styles.spaceIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 14h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M5 14V9a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M6 14v3M18 14v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M9 8V6M15 8V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className={styles.spaceTitle}>Individual Study Desks</h3>
              <p className={styles.spaceBody}>
                Personal workspaces with power outlets spread across all floors,
                offering a balance of openness and privacy for focused work.
              </p>
              <p className={styles.spaceNote}>All floors · First come, first served</p>
            </div>

            <div className={styles.spaceCard}>
              <div className={styles.spaceIconWrap}>
                <svg className={styles.spaceIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M3 15h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M8 3v12M16 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className={styles.spaceTitle}>Multipurpose Hall</h3>
              <p className={styles.spaceBody}>
                A flexible event space used for lectures, workshops, screenings,
                and academic presentations hosted by the library.
              </p>
              <p className={styles.spaceNote}>Ground floor · By reservation only</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section className={styles.contact}>
        <div className={styles.contactInner}>
          <h2 className={styles.contactTitle}>Need Help Planning Your Visit?</h2>
          <p className={styles.contactBody}>
            Our staff is happy to assist with directions, accessibility needs,
            or any questions before you arrive.
          </p>
          <div className={styles.contactLinks}>
            <a href="mailto:libraries@lau.edu.lb" className={styles.contactLink}>
              <svg className={styles.contactIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 7l10 7 10-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              libraries@lau.edu.lb
            </a>
            <span className={styles.contactSep} />
            <a href="tel:+9611786456" className={styles.contactLink}>
              <svg className={styles.contactIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" stroke="currentColor" strokeWidth="1.5"/>
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
