import { NavLink } from 'react-router-dom'
import styles from './Header.module.css'

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <span className={styles.logo}>Library</span>
        <nav className={styles.nav}>
          <NavLink to="/" className={({ isActive }) => isActive ? styles.active : ''}>
            Home
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Header
