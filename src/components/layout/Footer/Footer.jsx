import { NavLink } from 'react-router-dom'

function Footer() {
  return (
    <footer className="mt-20 border-t-2 border-[#006751] bg-[#0C1F16] dark:border-[#2e2e2e] dark:bg-[#1a1a1a]">
      <div className="mx-auto grid max-w-[var(--container-max)] grid-cols-[1.7fr_1fr_1fr_1fr] items-start gap-y-8 gap-x-10 px-8 pb-10 pt-16 max-md:grid-cols-2 max-sm:grid-cols-1">
        <div className="flex flex-col gap-[0.8rem] max-md:col-span-full">
          <NavLink to="/" className="flex items-center gap-[0.6rem] text-[rgba(246,241,231,0.88)] no-underline transition-opacity duration-150 ease hover:opacity-[0.78]">
            <svg className="h-7 w-auto flex-shrink-0 text-[#00AB8E]" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M2 15 Q14 20 26 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="14" y1="3" x2="14" y2="15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M14 3.5 L23 11 L14 14 Z" fill="currentColor" fillOpacity="0.72" />
              <line x1="8" y1="14" x2="6" y2="18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              <line x1="20" y1="14" x2="22" y2="18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              <line x1="14" y1="15" x2="14" y2="19" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
            </svg>
            <span className="text-[0.9rem] font-extrabold uppercase leading-none tracking-[0.16em] text-[rgba(246,241,231,0.92)] dark:text-[#f0ede8]">LAU</span>
          </NavLink>
          <p className="m-0 text-[0.84rem] leading-[1.8] text-[rgba(246,241,231,0.38)] dark:text-[#888]">
            Riyad Nassar Library
            <br />
            Lebanese American University
          </p>
          <p className="m-0 mt-3 text-[0.84rem] leading-[1.8] text-[rgba(246,241,231,0.38)] dark:text-[#888]">
            Advancing knowledge and fostering
            <br />
            intellectual growth since 1924.
          </p>
        </div>

        <div className="flex flex-col gap-[0.38rem]">
          <h4 className="mb-[0.65rem] text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-[rgba(246,241,231,0.32)] dark:text-[#666]">Visit</h4>
          <p className="m-0 text-[0.84rem] leading-[1.65] text-[rgba(246,241,231,0.55)] dark:text-[#aaa]">Mme. Curie Street</p>
          <p className="m-0 text-[0.84rem] leading-[1.65] text-[rgba(246,241,231,0.55)] dark:text-[#aaa]">Koraytem, Beirut</p>
          <p className="m-0 mt-3 text-[0.84rem] leading-[1.65] text-[rgba(246,241,231,0.55)] dark:text-[#aaa]">Mon - Fri 7:30 - 22:00</p>
          <p className="m-0 text-[0.84rem] leading-[1.65] text-[rgba(246,241,231,0.55)] dark:text-[#aaa]">Sat - Sun Closed</p>
        </div>

        <div className="flex flex-col gap-[0.38rem]">
          <h4 className="mb-[0.65rem] text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-[rgba(246,241,231,0.32)] dark:text-[#666]">Explore</h4>
          <NavLink to="/catalog" className="text-[0.84rem] leading-[1.65] text-[rgba(246,241,231,0.55)] no-underline transition-colors duration-150 ease hover:text-[rgba(246,241,231,0.9)] dark:text-[#aaa] dark:hover:text-[#f0ede8]">Catalog</NavLink>
          <NavLink to="/events" className="text-[0.84rem] leading-[1.65] text-[rgba(246,241,231,0.55)] no-underline transition-colors duration-150 ease hover:text-[rgba(246,241,231,0.9)] dark:text-[#aaa] dark:hover:text-[#f0ede8]">Events</NavLink>
          <NavLink to="/services" className="text-[0.84rem] leading-[1.65] text-[rgba(246,241,231,0.55)] no-underline transition-colors duration-150 ease hover:text-[rgba(246,241,231,0.9)] dark:text-[#aaa] dark:hover:text-[#f0ede8]">Services</NavLink>
          <NavLink to="/visit" className="text-[0.84rem] leading-[1.65] text-[rgba(246,241,231,0.55)] no-underline transition-colors duration-150 ease hover:text-[rgba(246,241,231,0.9)] dark:text-[#aaa] dark:hover:text-[#f0ede8]">Plan Your Visit</NavLink>
          <NavLink to="/dashboard" className="text-[0.84rem] leading-[1.65] text-[rgba(246,241,231,0.55)] no-underline transition-colors duration-150 ease hover:text-[rgba(246,241,231,0.9)] dark:text-[#aaa] dark:hover:text-[#f0ede8]">User Profile</NavLink>
        </div>

        <div className="flex flex-col gap-[0.38rem]">
          <h4 className="mb-[0.65rem] text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-[rgba(246,241,231,0.32)] dark:text-[#666]">Contact</h4>
          <a href="mailto:libraries@lau.edu.lb" className="text-[0.84rem] leading-[1.65] text-[rgba(246,241,231,0.55)] no-underline transition-colors duration-150 ease hover:text-[rgba(246,241,231,0.9)] dark:text-[#aaa] dark:hover:text-[#f0ede8]">libraries@lau.edu.lb</a>
          <a href="tel:+9611786456" className="text-[0.84rem] leading-[1.65] text-[rgba(246,241,231,0.55)] no-underline transition-colors duration-150 ease hover:text-[rgba(246,241,231,0.9)] dark:text-[#aaa] dark:hover:text-[#f0ede8]">+961 1 786 456</a>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--container-max)] border-t border-[rgba(255,255,255,0.06)] px-8 pb-[1.4rem] pt-[0.9rem] text-[0.67rem] tracking-[0.05em] text-[rgba(246,241,231,0.22)] dark:border-[#2e2e2e] dark:text-[#555]">
        <span>© {new Date().getFullYear()} Lebanese American University. All rights reserved.</span>
      </div>
    </footer>
  )
}

export default Footer
