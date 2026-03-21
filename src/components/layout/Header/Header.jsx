import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import styles from './Header.module.css'

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  })

  useEffect(() => {
    document.body.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return [dark, () => setDark(d => !d)]
}

function useIsLoggedIn() {
  const [loggedIn, setLoggedIn] = useState(() => !!localStorage.getItem('user'))

  useEffect(() => {
    const check = () => setLoggedIn(!!localStorage.getItem('user'))
    window.addEventListener('storage', check)
    // Re-check on focus (same-tab login/logout won't fire 'storage')
    window.addEventListener('focus', check)
    return () => {
      window.removeEventListener('storage', check)
      window.removeEventListener('focus', check)
    }
  }, [])

  return loggedIn
}

function isOpenNow() {
  const now  = new Date()
  const day  = now.getDay()
  const hour = now.getHours() + now.getMinutes() / 60
  if (day >= 1 && day <= 5) return hour >= 7.5 && hour < 22
  return false
}

function Header() {
  const open = isOpenNow()
  const loggedIn = useIsLoggedIn()
  const [dark, toggleDark] = useDarkMode()

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
          <span className={styles.topbarSep}>·</span>
          <button
            className={styles.themeToggle}
            onClick={toggleDark}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? (
              <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M9 2v2M9 14v2M2 9h2M14 9h2M4.22 4.22l1.42 1.42M12.36 12.36l1.42 1.42M4.22 13.78l1.42-1.42M12.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M15.5 10.5a6.5 6.5 0 0 1-8-8A6.5 6.5 0 1 0 15.5 10.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
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
            <NavLink
              to={loggedIn ? '/dashboard' : '/login'}
              className={({ isActive }) =>
                `${styles.accountLink} ${isActive ? styles.active : ''}`
              }
            >
              <svg className={styles.accountIcon} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="10" cy="7" r="3.25" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M3.5 17.5c0-2.9 2.91-5.25 6.5-5.25s6.5 2.35 6.5 5.25" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              {loggedIn ? 'My Account' : 'Sign In'}
            </NavLink>
          </nav>
        </div>

      </div>
    </header>
  )
}

export default Header
