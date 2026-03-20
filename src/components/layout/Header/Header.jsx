import './Header.css'
import { NavLink } from 'react-router-dom'

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
    <header className="bg-transparent relative z-[100] px-8 pt-2 pb-[1.1rem] shadow-[0_1px_0_rgba(0,103,81,0.06),0_4px_16px_rgba(0,0,0,0.05),0_1px_4px_rgba(0,0,0,0.03)]">

      {/* ── Utility strip ── */}
      <div className="flex justify-between items-center py-[0.42rem] mx-auto mb-[0.9rem] max-w-[var(--container-max)] border-b border-[rgba(0,55,40,0.10)] text-[0.67rem] font-medium tracking-[0.045em] text-[rgba(28,43,36,0.42)]">
        <div className="flex items-center gap-2">
          {/* Status dot */}
          <span className={`inline-block w-[6px] h-[6px] rounded-full flex-shrink-0 ${
            open
              ? 'bg-[#4caf7d] shadow-[0_0_0_2px_rgba(76,175,125,0.2)]'
              : 'bg-[#c0392b] shadow-[0_0_0_2px_rgba(192,57,43,0.2)]'
          }`} />
          <span className={`font-semibold tracking-[0.05em] ${open ? 'text-[#3a9466]' : 'text-[rgba(28,43,36,0.5)]'}`}>
            {open ? 'Open Now' : 'Closed'}
          </span>
          <span className="text-[rgba(28,43,36,0.22)] text-[0.6rem]">·</span>
          <span>Mon – Fri &nbsp;7:30 – 22:00</span>
          <span className="text-[rgba(28,43,36,0.22)] text-[0.6rem]">·</span>
          <span>Sat – Sun &nbsp;Closed</span>
        </div>
        <div className="flex items-center">
          <span>Mme. Curie St, Koraytem, Beirut</span>
        </div>
      </div>

      {/* ── Logo left · Nav pill right ── */}
      <div className="flex items-center justify-between max-w-[var(--container-max)] mx-auto">

        {/* Logo */}
        <NavLink
          to="/"
          className="flex items-center gap-[0.85rem] no-underline text-[#006751] flex-shrink-0 transition-opacity duration-[160ms] ease hover:opacity-[0.78]"
        >
          <svg className="w-auto h-[38px] flex-shrink-0 text-[#006751]" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M2 15 Q14 20 26 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <line x1="14" y1="3"  x2="14" y2="15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M14 3.5 L23 11 L14 14 Z" fill="currentColor" fillOpacity="0.72"/>
            <line x1="8"  y1="14" x2="6"  y2="18" stroke="currentColor" strokeWidth="1"   strokeLinecap="round"/>
            <line x1="20" y1="14" x2="22" y2="18" stroke="currentColor" strokeWidth="1"   strokeLinecap="round"/>
            <line x1="14" y1="15" x2="14" y2="19" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
          </svg>
          <div className="flex flex-col gap-[0.26rem] border-l-[1.5px] border-[rgba(0,103,81,0.18)] pl-[0.9rem]">
            <span className="text-[1.32rem] font-extrabold tracking-[0.12em] uppercase text-[#006751] leading-none">LAU</span>
            <span className="text-[0.62rem] font-semibold tracking-[0.11em] uppercase text-[rgba(0,103,81,0.50)] leading-none whitespace-nowrap">Riyad Nassar Library</span>
          </div>
        </NavLink>

        {/* Nav pill */}
        <div className="px-7 h-11 flex items-center bg-[rgba(6,26,18,0.84)] backdrop-blur-[16px] saturate-[1.4] border border-[rgba(255,255,255,0.08)] rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_20px_rgba(0,0,0,0.24),0_1px_4px_rgba(0,0,0,0.14)]">
          <nav className="flex items-center gap-9">
            {[
              { to: '/catalog',   label: 'Catalog'      },
              { to: '/visit',     label: 'Visit'        },
              { to: '/events',    label: 'Events'       },
              { to: '/services',  label: 'Services'     },
              { to: '/dashboard', label: 'User Profile' },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `header-nav-link relative text-[rgba(240,248,244,0.45)] no-underline text-[0.72rem] font-medium tracking-[0.08em] uppercase px-[0.65rem] py-[0.3rem] rounded-md whitespace-nowrap transition-all duration-[180ms] ease hover:text-[rgba(240,248,244,0.92)] hover:bg-[rgba(255,255,255,0.07)] hover:-translate-y-px${isActive ? ' header-nav-active text-[rgba(240,248,244,0.96)]' : ''}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Dark mode toggle */}
        <button
          className="bg-transparent border border-[#e0ddd8] rounded-lg px-[0.6rem] py-[0.4rem] cursor-pointer text-base transition-colors hover:bg-[#f0ede8] dark:border-[#3a3a3a] dark:hover:bg-[#2a2a2a]"
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