import { useState } from 'react'
import styles from './Services.module.css'

const SERVICES = [
  {
    icon: 'borrow',
    title: 'Borrowing & Returns',
    description: 'Borrow items for 14 days. Renew online or return at the circulation desk.',
    details: 'Renewable once if no holds exist. Late fees are 500,000 LBP per day per item. Lost items incur the replacement cost plus a processing fee. Returns are accepted at either campus.',
    link: { label: 'View borrowing policy', href: '/catalog' },
  },
  {
    icon: 'spaces',
    title: 'Study Spaces',
    description: 'Quiet areas, group study rooms, and individual workstations — reservable up to 3 hours per day.',
    details: 'Group rooms seat 4–8 people and include a display screen. Individual carrels are first-come, first-served. Quiet zones are enforced on the upper floors.',
    link: { label: 'Explore spaces', href: '/visit' },
  },
  {
    icon: 'research',
    title: 'Research Support',
    description: 'One-on-one guidance from librarians for literature reviews, citations, and thesis research.',
    details: 'Walk in during open hours or book a 30-minute consultation. We can help with database strategy, Zotero setup, APA/MLA/Chicago formatting, and systematic review methodology.',
    link: null,
  },
  {
    icon: 'digital',
    title: 'Digital Resources',
    description: 'Access 185+ databases, e-journals, and e-books on campus or remotely via your LAU credentials.',
    details: 'Includes JSTOR, Scopus, IEEE Xplore, ProQuest, and Web of Science. Off-campus access is available through the LAU VPN or EZproxy. Contact us if you need a resource we don\'t carry.',
    link: { label: 'Browse databases', href: '/catalog' },
  },
  {
    icon: 'printing',
    title: 'Printing & Scanning',
    description: 'Self-service stations on all floors for printing, copying, and scanning. Color printing by request.',
    details: 'Students receive semesterly print credits. Black-and-white printing is available at all stations. Color and large-format printing can be requested at the circulation desk.',
    link: null,
  },
  {
    icon: 'membership',
    title: 'Membership & Access',
    description: 'Students and faculty have full access. Alumni and visitors can apply for a library card.',
    details: 'Current LAU ID required for entry. Alumni cards are issued at the circulation desk with a valid alumni ID. Community borrower cards are available for a yearly fee.',
    link: { label: 'Learn more', href: '/visit' },
  },
]

const ICONS = {
  borrow: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 19V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4 19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4 19a2 2 0 0 1 2-2h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 8h6M9 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  spaces: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 14h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5 14V9a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M6 14v3M18 14v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 8V6M15 8V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  research: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 11h6M11 8v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  digital: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 20h8M12 16v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  printing: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 9V3h12v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="4" y="9" width="16" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 17v4h12v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="16" cy="12" r="1" fill="currentColor"/>
    </svg>
  ),
  membership: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="9" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M14 9h4M14 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5 16c0-1.5 1.79-2.5 4-2.5s4 1 4 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
}

const POLICIES = [
  { label: 'Loan period', value: '14 days (renewable once)' },
  { label: 'Late returns', value: '500,000 LBP / day per item' },
  { label: 'Lost items', value: 'Replacement cost + processing fee' },
  { label: 'Remote access', value: 'Full database access via LAU VPN' },
  { label: 'Study rooms', value: 'Reserve up to 3 hours per day' },
]

export default function Services() {
  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Services</span>
          <h1 className={styles.heroTitle}>How We Support Your Work</h1>
          <p className={styles.heroBody}>
            From research guidance to borrowing and digital access — everything you need to study, create, and discover.
          </p>
        </div>
      </section>

      {/* ── Core Services Grid ── */}
      <section className={styles.servicesSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Core Services</h2>
            <p className={styles.sectionSub}>The essentials, available to all students and faculty.</p>
          </div>

          <div className={styles.grid}>
            {SERVICES.map(service => (
              <ServiceCard key={service.title} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick Reference ── */}
      <section className={styles.policiesSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Quick Reference</h2>
            <p className={styles.sectionSub}>Key policies and limits at a glance.</p>
          </div>

          <div className={styles.policiesGrid}>
            {POLICIES.map(p => (
              <div key={p.label} className={styles.policyItem}>
                <span className={styles.policyLabel}>{p.label}</span>
                <span className={styles.policyValue}>{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <p className={styles.ctaBody}>
            Need something else? <a href="/visit" className={styles.ctaLink}>Visit the library</a>, <a href="/catalog" className={styles.ctaLink}>explore the catalog</a>, or <a href="/events" className={styles.ctaLink}>see upcoming events</a>.
          </p>
        </div>
      </section>

    </div>
  )
}

function ServiceCard({ service }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={styles.card}>
      <div className={styles.cardIcon}>
        {ICONS[service.icon]}
      </div>
      <h3 className={styles.cardTitle}>{service.title}</h3>
      <p className={styles.cardDesc}>{service.description}</p>

      {service.details && (
        <>
          <button
            className={styles.expandBtn}
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
          >
            {open ? 'Less' : 'More details'}
            <svg
              className={`${styles.expandChevron} ${open ? styles.expandChevronOpen : ''}`}
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className={`${styles.expandPanel} ${open ? styles.expandPanelOpen : ''}`}>
            <div>
              <p className={styles.expandText}>{service.details}</p>
              {service.link && service.link.href && (
                <a href={service.link.href} className={styles.cardLink}>
                  {service.link.label}
                  <span aria-hidden="true"> &rarr;</span>
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
