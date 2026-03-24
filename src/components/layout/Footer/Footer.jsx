import { NavLink } from 'react-router-dom'

function Footer() {
  return (
    <footer className="border-t-2 border-[#006751] bg-[#0C1F16] dark:border-[#333] dark:bg-[#1a1a1a]">
      <div className="mx-auto max-w-[var(--container-max)] px-4 pb-7 pt-8 sm:px-8 sm:pb-10 sm:pt-16">
        <div className="flex flex-col gap-3 border-b border-[rgba(255,255,255,0.06)] pb-5 text-left md:hidden">
          <NavLink to="/" className="flex items-center gap-[0.6rem] text-[rgba(246,241,231,0.88)] no-underline transition-opacity duration-150 ease hover:opacity-[0.78]">
            <svg className="h-7 w-auto flex-shrink-0 text-[#5ecba1]" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M2 15 Q14 20 26 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="14" y1="3" x2="14" y2="15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M14 3.5 L23 11 L14 14 Z" fill="currentColor" fillOpacity="0.72" />
              <line x1="8" y1="14" x2="6" y2="18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              <line x1="20" y1="14" x2="22" y2="18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              <line x1="14" y1="15" x2="14" y2="19" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
            </svg>
            <span className="text-[0.9rem] font-extrabold uppercase leading-none tracking-[0.16em] text-[rgba(246,241,231,0.92)] dark:text-white">LAU</span>
          </NavLink>
          <div className="max-w-[18rem]">
            <p className="m-0 text-[0.78rem] leading-[1.55] text-[rgba(246,241,231,0.38)] sm:text-[0.84rem] sm:leading-[1.8] dark:text-[#888]">
              Riyad Nassar Library
              <br />
              Lebanese American University
            </p>
            <p className="m-0 mt-2 text-[0.78rem] leading-[1.5] text-[rgba(246,241,231,0.38)] sm:mt-3 sm:text-[0.84rem] sm:leading-[1.8] dark:text-[#888]">
              Advancing knowledge and fostering intellectual growth since 1924.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-x-4 text-center md:hidden">
          <div className="flex flex-col gap-[0.2rem] items-center md:items-start sm:gap-[0.38rem]">
            <h4 className="mb-[0.35rem] text-[0.52rem] font-semibold uppercase tracking-[0.12em] text-[rgba(246,241,231,0.32)] sm:mb-[0.65rem] sm:text-[0.62rem] dark:text-[#888]">Visit</h4>
            <p className="m-0 text-[0.68rem] leading-[1.4] sm:text-[0.84rem] sm:leading-[1.65] text-[rgba(246,241,231,0.55)] dark:text-[#888]">Mme. Curie Street</p>
            <p className="m-0 text-[0.68rem] leading-[1.4] sm:text-[0.84rem] sm:leading-[1.65] text-[rgba(246,241,231,0.55)] dark:text-[#888]">Koraytem, Beirut</p>
            <p className="m-0 mt-1 text-[0.68rem] leading-[1.4] sm:mt-3 sm:text-[0.84rem] sm:leading-[1.65] text-[rgba(246,241,231,0.55)] dark:text-[#888]">Mon - Fri 7:30 - 22:00</p>
            <p className="m-0 text-[0.68rem] leading-[1.4] sm:text-[0.84rem] sm:leading-[1.65] text-[rgba(246,241,231,0.55)] dark:text-[#888]">Sat - Sun Closed</p>
          </div>

          <div className="flex flex-col gap-[0.2rem] items-center md:items-start sm:gap-[0.38rem]">
            <h4 className="mb-[0.35rem] text-[0.52rem] font-semibold uppercase tracking-[0.12em] text-[rgba(246,241,231,0.32)] sm:mb-[0.65rem] sm:text-[0.62rem] dark:text-[#888]">Explore</h4>
            <NavLink to="/catalog" className="text-[0.68rem] leading-[1.4] sm:text-[0.84rem] sm:leading-[1.65] text-[rgba(246,241,231,0.55)] no-underline transition-colors duration-150 ease hover:text-[rgba(246,241,231,0.9)] dark:text-[#888] dark:hover:text-white">Catalog</NavLink>
            <NavLink to="/events" className="text-[0.68rem] leading-[1.4] sm:text-[0.84rem] sm:leading-[1.65] text-[rgba(246,241,231,0.55)] no-underline transition-colors duration-150 ease hover:text-[rgba(246,241,231,0.9)] dark:text-[#888] dark:hover:text-white">Events</NavLink>
            <NavLink to="/services" className="text-[0.68rem] leading-[1.4] sm:text-[0.84rem] sm:leading-[1.65] text-[rgba(246,241,231,0.55)] no-underline transition-colors duration-150 ease hover:text-[rgba(246,241,231,0.9)] dark:text-[#888] dark:hover:text-white">Services</NavLink>
            <NavLink to="/visit" className="text-[0.68rem] leading-[1.4] sm:text-[0.84rem] sm:leading-[1.65] text-[rgba(246,241,231,0.55)] no-underline transition-colors duration-150 ease hover:text-[rgba(246,241,231,0.9)] dark:text-[#888] dark:hover:text-white">Plan Your Visit</NavLink>
            <NavLink to="/dashboard" className="text-[0.68rem] leading-[1.4] sm:text-[0.84rem] sm:leading-[1.65] text-[rgba(246,241,231,0.55)] no-underline transition-colors duration-150 ease hover:text-[rgba(246,241,231,0.9)] dark:text-[#888] dark:hover:text-white">User Profile</NavLink>
          </div>

          <div className="flex flex-col gap-[0.2rem] items-center md:items-start sm:gap-[0.38rem]">
            <h4 className="mb-[0.35rem] text-[0.52rem] font-semibold uppercase tracking-[0.12em] text-[rgba(246,241,231,0.32)] sm:mb-[0.65rem] sm:text-[0.62rem] dark:text-[#888]">Contact</h4>
            <a href="mailto:libraries@lau.edu.lb" className="text-[0.68rem] leading-[1.4] sm:text-[0.84rem] sm:leading-[1.65] text-[rgba(246,241,231,0.55)] no-underline transition-colors duration-150 ease hover:text-[rgba(246,241,231,0.9)] dark:text-[#888] dark:hover:text-white">libraries@lau.edu.lb</a>
            <a href="tel:+9611786456" className="text-[0.68rem] leading-[1.4] sm:text-[0.84rem] sm:leading-[1.65] text-[rgba(246,241,231,0.55)] no-underline transition-colors duration-150 ease hover:text-[rgba(246,241,231,0.9)] dark:text-[#888] dark:hover:text-white">+961 1 786 456</a>
          </div>
        </div>

        <div className="hidden md:grid md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-x-10 md:gap-y-8">
          <div className="flex flex-col gap-[0.8rem]">
            <NavLink to="/" className="flex items-center gap-[0.6rem] text-[rgba(246,241,231,0.88)] no-underline transition-opacity duration-150 ease hover:opacity-[0.78]">
              <svg className="h-7 w-auto flex-shrink-0 text-[#5ecba1]" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M2 15 Q14 20 26 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="14" y1="3" x2="14" y2="15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M14 3.5 L23 11 L14 14 Z" fill="currentColor" fillOpacity="0.72" />
                <line x1="8" y1="14" x2="6" y2="18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                <line x1="20" y1="14" x2="22" y2="18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                <line x1="14" y1="15" x2="14" y2="19" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
              </svg>
              <span className="text-[0.9rem] font-extrabold uppercase leading-none tracking-[0.16em] text-[rgba(246,241,231,0.92)] dark:text-white">LAU</span>
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
            <h4 className="mb-[0.65rem] text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-[rgba(246,241,231,0.32)] dark:text-[#888]">Visit</h4>
            <p className="m-0 text-[0.84rem] leading-[1.65] text-[rgba(246,241,231,0.55)] dark:text-[#888]">Mme. Curie Street</p>
            <p className="m-0 text-[0.84rem] leading-[1.65] text-[rgba(246,241,231,0.55)] dark:text-[#888]">Koraytem, Beirut</p>
            <p className="m-0 mt-3 text-[0.84rem] leading-[1.65] text-[rgba(246,241,231,0.55)] dark:text-[#888]">Mon - Fri 7:30 - 22:00</p>
            <p className="m-0 text-[0.84rem] leading-[1.65] text-[rgba(246,241,231,0.55)] dark:text-[#888]">Sat - Sun Closed</p>
          </div>

          <div className="flex flex-col gap-[0.38rem]">
            <h4 className="mb-[0.65rem] text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-[rgba(246,241,231,0.32)] dark:text-[#888]">Explore</h4>
            <NavLink to="/catalog" className="text-[0.84rem] leading-[1.65] text-[rgba(246,241,231,0.55)] no-underline transition-colors duration-150 ease hover:text-[rgba(246,241,231,0.9)] dark:text-[#888] dark:hover:text-white">Catalog</NavLink>
            <NavLink to="/events" className="text-[0.84rem] leading-[1.65] text-[rgba(246,241,231,0.55)] no-underline transition-colors duration-150 ease hover:text-[rgba(246,241,231,0.9)] dark:text-[#888] dark:hover:text-white">Events</NavLink>
            <NavLink to="/services" className="text-[0.84rem] leading-[1.65] text-[rgba(246,241,231,0.55)] no-underline transition-colors duration-150 ease hover:text-[rgba(246,241,231,0.9)] dark:text-[#888] dark:hover:text-white">Services</NavLink>
            <NavLink to="/visit" className="text-[0.84rem] leading-[1.65] text-[rgba(246,241,231,0.55)] no-underline transition-colors duration-150 ease hover:text-[rgba(246,241,231,0.9)] dark:text-[#888] dark:hover:text-white">Plan Your Visit</NavLink>
            <NavLink to="/dashboard" className="text-[0.84rem] leading-[1.65] text-[rgba(246,241,231,0.55)] no-underline transition-colors duration-150 ease hover:text-[rgba(246,241,231,0.9)] dark:text-[#888] dark:hover:text-white">User Profile</NavLink>
          </div>

          <div className="flex flex-col gap-[0.38rem]">
            <h4 className="mb-[0.65rem] text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-[rgba(246,241,231,0.32)] dark:text-[#888]">Contact</h4>
            <a href="mailto:libraries@lau.edu.lb" className="text-[0.84rem] leading-[1.65] text-[rgba(246,241,231,0.55)] no-underline transition-colors duration-150 ease hover:text-[rgba(246,241,231,0.9)] dark:text-[#888] dark:hover:text-white">libraries@lau.edu.lb</a>
            <a href="tel:+9611786456" className="text-[0.84rem] leading-[1.65] text-[rgba(246,241,231,0.55)] no-underline transition-colors duration-150 ease hover:text-[rgba(246,241,231,0.9)] dark:text-[#888] dark:hover:text-white">+961 1 786 456</a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--container-max)] border-t border-[rgba(255,255,255,0.06)] px-5 pb-4 pt-3 text-center text-[0.64rem] tracking-[0.04em] text-[rgba(246,241,231,0.22)] dark:border-[#333] dark:text-[#888] sm:px-8 sm:pb-[1.4rem] sm:pt-[0.9rem] sm:text-left sm:text-[0.67rem] sm:tracking-[0.05em]">
        <span>&copy; {new Date().getFullYear()} Lebanese American University. All rights reserved.</span>
      </div>
    </footer>
  )
}

export default Footer
