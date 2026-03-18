import { NavLink } from 'react-router-dom'
import styles from './Header.module.css'

function isOpenNow() {
  const now  = new Date()
  const day  = now.getDay()
  const hour = now.getHours() + now.getMinutes() / 60
  if (day >= 1 && day <= 5) return hour >= 7.5 && hour < 22
  return false
}

function toggleDark() {
  document.body.classList.toggle('dark')
}

function Header() {
  const open = isOpenNow()

  return (
    <header className={styles.header}>

      {/* ── Utility strip ── */}
      <div className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <span className={styles.statusDot} data-open={open} />
          <span className={styles.statusLabel} data-open={open}>
            {open ? 'Open Now' : 'Closed'}
          </span>
          <span className={styles.topbarSep}>·</span>
          <span>Mon – Fri &nbsp;7:30 – 22:00</span>
          <span className={styles.topbarSep}>·</span>
          <span>Sat – Sun &nbsp;Closed</span>
        </div>
        <div className={styles.topbarRight}>
          <span>Mme. Curie St, Koraytem, Beirut</span>
        </div>
      </div>

      {/* ── Logo left · Nav pill right ── */}
      <div className={styles.headerMain}>

        <NavLink to="/" className={styles.logo}>
          <svg className={styles.logoIcon} viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M2 15 Q14 20 26 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <line x1="14" y1="3"  x2="14" y2="15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M14 3.5 L23 11 L14 14 Z" fill="currentColor" fillOpacity="0.72"/>
            <line x1="8"  y1="14" x2="6"  y2="18" stroke="currentColor" strokeWidth="1"   strokeLinecap="round"/>
            <line x1="20" y1="14" x2="22" y2="18" stroke="currentColor" strokeWidth="1"   strokeLinecap="round"/>
            <line x1="14" y1="15" x2="14" y2="19" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
          </svg>
          <div className={styles.logoText}>
            <span className={styles.logoName}>LAU</span>
            <span className={styles.logoSub}>Riyad Nassar Library</span>
          </div>
        </NavLink>

        {/* Nav pill */}
        <div className={styles.inner}>
          <nav className={styles.nav}>
            <NavLink to="/catalog"   className={({ isActive }) => isActive ? styles.active : ''}>Catalog</NavLink>
            <NavLink to="/visit"     className={({ isActive }) => isActive ? styles.active : ''}>Visit</NavLink>
            <NavLink to="/events"    className={({ isActive }) => isActive ? styles.active : ''}>Events</NavLink>
            <NavLink to="/services"  className={({ isActive }) => isActive ? styles.active : ''}>Services</NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? styles.active : ''}>User Profile</NavLink>
          </nav>
        </div>

        {/* Dark mode toggle */}
        <button
          className={styles.themeToggle}
          onClick={toggleDark}
          aria-label="Toggle dark mode"
        >
          🌙
        </button>

      </div>
    </header>
  )
}

export default Header