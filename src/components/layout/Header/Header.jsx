import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'

function useIsLoggedIn() {
  const getStatus = () => localStorage.getItem('isLoggedIn') === 'true' && !!localStorage.getItem('user')
  const [loggedIn, setLoggedIn] = useState(getStatus)

  useEffect(() => {
    const check = () => setLoggedIn(getStatus())
    window.addEventListener('storage', check)
    window.addEventListener('focus', check)
    return () => {
      window.removeEventListener('storage', check)
      window.removeEventListener('focus', check)
    }
  }, [])

  return loggedIn
}

function isOpenNow() {
  const now = new Date()
  const day = now.getDay()
  const hour = now.getHours() + now.getMinutes() / 60

  if (day >= 1 && day <= 5) return hour >= 7.5 && hour < 22

  return false
}

function Header() {
  const open = isOpenNow()
  const loggedIn = useIsLoggedIn()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(
    () =>
      document.body.classList.contains('dark') ||
      document.documentElement.classList.contains('dark')
  )

  useEffect(() => {
    const nextIsDark =
      document.body.classList.contains('dark') ||
      document.documentElement.classList.contains('dark')

    setIsDark(nextIsDark)
  }, [])

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  function handleToggleDark() {
    const nextIsDark = !isDark
    document.documentElement.classList.toggle('dark', nextIsDark)
    document.body.classList.toggle('dark', nextIsDark)
    localStorage.setItem('theme', nextIsDark ? 'dark' : 'light')
    setIsDark(nextIsDark)
  }

  const navItems = [
    { to: '/catalog', label: 'Catalog' },
    { to: '/visit', label: 'Visit' },
    { to: '/events', label: 'Events' },
    { to: '/services', label: 'Services' },
    { to: loggedIn ? '/dashboard' : '/login', label: loggedIn ? 'My Account' : 'Sign In' },
  ]

  return (
    <header className="relative z-[100] bg-transparent px-4 pb-[1.1rem] pt-2 sm:px-6 md:px-8 shadow-[0_1px_0_rgba(0,103,81,0.06),0_4px_16px_rgba(0,0,0,0.05),0_1px_4px_rgba(0,0,0,0.03)]">

      {/* ── Topbar (utility strip) — hidden on mobile, visible sm+ ── */}
      <div className="mx-auto mb-[0.9rem] hidden max-w-[var(--container-max)] items-center justify-between border-b border-[rgba(0,55,40,0.10)] py-[0.42rem] text-[0.67rem] font-medium tracking-[0.045em] text-[rgba(28,43,36,0.42)] sm:flex dark:border-[#333] dark:text-[#888]">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-[6px] w-[6px] flex-shrink-0 rounded-full ${
              open
                ? 'bg-[#4caf7d] shadow-[0_0_0_2px_rgba(76,175,125,0.2)]'
                : 'bg-[#c0392b] shadow-[0_0_0_2px_rgba(192,57,43,0.2)]'
            }`}
          />
          <span className={`font-semibold tracking-[0.05em] ${open ? 'text-[#3a9466] dark:text-[#5ecba1]' : 'text-[rgba(28,43,36,0.5)] dark:text-[#888]'}`}>
            {open ? 'Open Now' : 'Closed'}
          </span>
          <span className="text-[0.6rem] text-[rgba(28,43,36,0.22)] dark:text-[#888]">·</span>
          <span>Mon - Fri 7:30 - 22:00</span>
          {/* Hide the extra detail on smaller tablets to avoid overflow */}
          <span className="hidden text-[0.6rem] text-[rgba(28,43,36,0.22)] lg:inline dark:text-[#888]">·</span>
          <span className="hidden lg:inline">Sat - Sun Closed</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Address only on larger screens */}
          <span className="hidden lg:inline">Mme. Curie St, Koraytem, Beirut</span>
          <span className="hidden text-[0.6rem] text-[rgba(28,43,36,0.22)] lg:inline dark:text-[#888]">·</span>
          <button
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(0,55,40,0.10)] text-[rgba(28,43,36,0.52)] transition-colors hover:bg-[rgba(0,55,40,0.05)] dark:border-[#333] dark:text-[#888] dark:hover:bg-[#2e2e2e]"
            onClick={handleToggleDark}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <svg className="h-4 w-4" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M15.5 10.5a6.5 6.5 0 0 1-8-8A6.5 6.5 0 1 0 15.5 10.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M9 2v2M9 14v2M2 9h2M14 9h2M4.22 4.22l1.42 1.42M12.36 12.36l1.42 1.42M4.22 13.78l1.42-1.42M12.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Main header row: logo left · nav pill right (desktop) · hamburger (mobile) ── */}
      <div className="mx-auto flex max-w-[var(--container-max)] items-center justify-between">

        {/* Logo */}
        <NavLink
          to="/"
          className="flex flex-shrink-0 items-center gap-[0.85rem] text-[#006751] no-underline transition-opacity duration-[160ms] ease hover:opacity-[0.78] dark:text-[#5ecba1]"
        >
          <svg className="h-[34px] w-auto flex-shrink-0 text-[#006751] sm:h-[38px] dark:text-[#5ecba1]" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M2 15 Q14 20 26 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="14" y1="3" x2="14" y2="15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M14 3.5 L23 11 L14 14 Z" fill="currentColor" fillOpacity="0.72" />
            <line x1="8" y1="14" x2="6" y2="18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <line x1="20" y1="14" x2="22" y2="18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <line x1="14" y1="15" x2="14" y2="19" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
          </svg>
          <div className="flex flex-col gap-[0.26rem] border-l-[1.5px] border-[rgba(0,103,81,0.18)] pl-[0.9rem] dark:border-[#333]">
            <span className="text-[1.18rem] font-extrabold uppercase leading-none tracking-[0.12em] text-[#006751] sm:text-[1.32rem] dark:text-[#5ecba1]">LAU</span>
            <span className="whitespace-nowrap text-[0.58rem] font-semibold uppercase leading-none tracking-[0.11em] text-[rgba(0,103,81,0.50)] sm:text-[0.62rem] dark:text-[#888]">
              Riyad Nassar Library
            </span>
          </div>
        </NavLink>

        {/* Right side: desktop nav pill + mobile controls */}
        <div className="flex items-center gap-2">

          {/* Desktop nav pill — hidden on mobile */}
          <div className="hidden h-11 items-center rounded-xl border border-[rgba(94,203,161,0.18)] bg-[linear-gradient(165deg,#0A2E22_0%,#061C14_100%)] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_20px_rgba(0,0,0,0.24),0_1px_4px_rgba(0,0,0,0.14)] backdrop-blur-[16px] saturate-[1.4] md:flex lg:px-7">
            <nav className="flex items-center gap-5 lg:gap-9" aria-label="Main navigation">
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={`${to}-${label}`}
                  to={to}
                  className={({ isActive }) =>
                    `group relative rounded-md px-[0.55rem] py-[0.3rem] text-[0.68rem] font-medium uppercase tracking-[0.08em] no-underline whitespace-nowrap transition-all duration-[180ms] ease lg:px-[0.65rem] lg:text-[0.72rem] ${
                      isActive
                        ? 'text-[rgba(240,248,244,0.96)]'
                        : 'text-[rgba(240,248,244,0.45)] hover:-translate-y-px hover:bg-[rgba(255,255,255,0.07)] hover:text-[rgba(240,248,244,0.92)]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {label}
                      <span className={`absolute bottom-[2px] left-[0.55rem] right-[0.55rem] h-px origin-left bg-[#5ecba1] transition-transform duration-[260ms] ease lg:left-[0.65rem] lg:right-[0.65rem] ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Mobile: dark mode toggle (always visible on mobile) */}
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(0,55,40,0.10)] text-[rgba(28,43,36,0.52)] transition-colors hover:bg-[rgba(0,55,40,0.05)] sm:hidden dark:border-[#333] dark:text-[#888] dark:hover:bg-[#2e2e2e]"
            onClick={handleToggleDark}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <svg className="h-4 w-4" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M15.5 10.5a6.5 6.5 0 0 1-8-8A6.5 6.5 0 1 0 15.5 10.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M9 2v2M9 14v2M2 9h2M14 9h2M4.22 4.22l1.42 1.42M12.36 12.36l1.42 1.42M4.22 13.78l1.42-1.42M12.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            )}
          </button>

          {/* Mobile: hamburger button — hidden on desktop */}
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(0,103,81,0.18)] text-[#006751] transition-colors hover:bg-[rgba(0,103,81,0.06)] md:hidden dark:border-[#2e2e2e] dark:text-[#5ecba1] dark:hover:bg-[#1a1a1a]"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? (
              /* X icon */
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            ) : (
              /* Hamburger icon */
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            )}
          </button>

        </div>
      </div>

      {/* ── Mobile dropdown menu ── */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="mx-auto mt-3 max-w-[var(--container-max)] overflow-hidden rounded-xl border border-[rgba(0,103,81,0.14)] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.10)] md:hidden dark:border-[#2a2a2a] dark:bg-[#0d1f18]"
        >
          {/* Open/closed status strip inside menu */}
          <div className="flex items-center gap-2 border-b border-[rgba(0,103,81,0.08)] px-4 py-2.5 text-[0.67rem] font-medium tracking-[0.04em] text-[rgba(28,43,36,0.42)] dark:border-[#1e1e1e] dark:text-[#888]">
            <span
              className={`inline-block h-[6px] w-[6px] flex-shrink-0 rounded-full ${
                open
                  ? 'bg-[#4caf7d] shadow-[0_0_0_2px_rgba(76,175,125,0.2)]'
                  : 'bg-[#c0392b] shadow-[0_0_0_2px_rgba(192,57,43,0.2)]'
              }`}
            />
            <span className={`font-semibold ${open ? 'text-[#3a9466] dark:text-[#5ecba1]' : 'text-[rgba(28,43,36,0.5)]'}`}>
              {open ? 'Open Now' : 'Closed'}
            </span>
            <span className="opacity-30">·</span>
            <span>Mon–Fri 7:30–22:00</span>
          </div>

          {/* Nav links */}
          <nav aria-label="Mobile navigation">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={`mobile-${to}`}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center border-b border-[rgba(0,103,81,0.06)] px-5 py-3.5 text-[0.82rem] font-semibold uppercase tracking-[0.09em] no-underline transition-colors last:border-b-0 dark:border-[#1a1a1a] ${
                    isActive
                      ? 'bg-[rgba(0,103,81,0.05)] text-[#006751] dark:bg-[rgba(94,203,161,0.06)] dark:text-[#5ecba1]'
                      : 'text-[#1C2B24] hover:bg-[rgba(0,103,81,0.04)] dark:text-[rgba(240,248,244,0.75)] dark:hover:bg-[rgba(255,255,255,0.04)]'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

    </header>
  )
}

export default Header
