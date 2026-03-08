import { NavLink } from 'react-router-dom'
import styles from './Footer.module.css'

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {/* Brand column */}
        <div className={styles.brand}>
          <NavLink to="/" className={styles.logo}>Library</NavLink>
          <p className={styles.tagline}>
            A place for knowledge, community,<br />and discovery.
          </p>
        </div>

        {/* Visit column */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Visit</h4>
          <p className={styles.colLine}>12 Aldwych Lane</p>
          <p className={styles.colLine}>London, WC2B 4LP</p>
          <p className={styles.colLine} style={{ marginTop: '0.75rem' }}>Mon – Fri &nbsp;9:00 – 20:00</p>
          <p className={styles.colLine}>Sat – Sun &nbsp;10:00 – 17:00</p>
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
          <p className={styles.colLine}>info@library.org</p>
          <p className={styles.colLine}>+44 20 7946 0123</p>
        </div>

      </div>

      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()} Library. All rights reserved.</span>
      </div>
    </footer>
  )
}

export default Footer
