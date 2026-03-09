import { NavLink } from 'react-router-dom'
import styles from './Footer.module.css'

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {/* Brand column */}
        <div className={styles.brand}>
          <NavLink to="/" className={styles.logo}>
            <svg className={styles.logoIcon} viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M2 15 Q14 20 26 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <line x1="14" y1="3"  x2="14" y2="15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M14 3.5 L23 11 L14 14 Z" fill="currentColor" fillOpacity="0.72"/>
              <line x1="8"  y1="14" x2="6"  y2="18" stroke="currentColor" strokeWidth="1"   strokeLinecap="round"/>
              <line x1="20" y1="14" x2="22" y2="18" stroke="currentColor" strokeWidth="1"   strokeLinecap="round"/>
              <line x1="14" y1="15" x2="14" y2="19" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/>
            </svg>
            <span className={styles.logoName}>LAU</span>
          </NavLink>
          <p className={styles.tagline}>
            Riyad Nassar Library<br />
            Lebanese American University
          </p>
          <p className={styles.tagline} style={{ marginTop: '0.5rem' }}>
            Advancing knowledge and fostering<br />intellectual growth since 1924.
          </p>
        </div>

        {/* Visit column */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Visit</h4>
          <p className={styles.colLine}>Mme. Curie Street</p>
          <p className={styles.colLine}>Koraytem, Beirut</p>
          <p className={styles.colLine} style={{ marginTop: '0.75rem' }}>Mon – Fri &nbsp;7:30 – 22:00</p>
          <p className={styles.colLine}>Sat – Sun &nbsp;Closed</p>
        </div>

        {/* Explore column */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Explore</h4>
          <NavLink to="/catalog" className={styles.colLink}>Catalog</NavLink>
          <NavLink to="/events" className={styles.colLink}>Events</NavLink>
          <NavLink to="/services" className={styles.colLink}>Services</NavLink>
          <NavLink to="/visit" className={styles.colLink}>Plan Your Visit</NavLink>
        </div>

        {/* Contact column */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Contact</h4>
          <a href="mailto:libraries@lau.edu.lb" className={styles.colLink}>libraries@lau.edu.lb</a>
          <a href="tel:+9611786456" className={styles.colLink}>+961 1 786 456</a>
        </div>

      </div>

      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()} Lebanese American University. All rights reserved.</span>
      </div>
    </footer>
  )
}

export default Footer
