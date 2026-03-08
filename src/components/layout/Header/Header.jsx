import { NavLink } from 'react-router-dom'
import styles from './Header.module.css'

function isOpenNow() {
  const now = new Date()
  const day = now.getDay()   // 0 Sun, 1-5 Mon-Fri, 6 Sat
  const hour = now.getHours() + now.getMinutes() / 60
  if (day >= 1 && day <= 5) return hour >= 9 && hour < 20
  if (day === 0 || day === 6) return hour >= 10 && hour < 17
  return false
}

function Header() {
  const open = isOpenNow()

  return (
    <header className={styles.header}>
      <div className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <span className={styles.statusDot} data-open={open} />
          <span className={styles.statusLabel} data-open={open}>
            {open ? 'Open Now' : 'Closed'}
          </span>
          <span className={styles.topbarSep}>·</span>
          <span>Mon – Fri &nbsp;9:00 – 20:00</span>
          <span className={styles.topbarSep}>·</span>
          <span>Sat – Sun &nbsp;10:00 – 17:00</span>
        </div>
        <div className={styles.topbarRight}>
          <span>12 Aldwych Lane, London</span>
        </div>
      </div>

      <div className={styles.inner}>
        <NavLink to="/" className={styles.logo}>Library</NavLink>
        <nav className={styles.nav}>
          <NavLink to="/catalog" className={({ isActive }) => isActive ? styles.active : ''}>Catalog</NavLink>
          <NavLink to="/visit" className={({ isActive }) => isActive ? styles.active : ''}>Visit</NavLink>
          <NavLink to="/events" className={({ isActive }) => isActive ? styles.active : ''}>Events</NavLink>
          <NavLink to="/services" className={({ isActive }) => isActive ? styles.active : ''}>Services</NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Header
