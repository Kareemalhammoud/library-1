import styles from './Footer.module.css'

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.text}>© {new Date().getFullYear()} Library</p>
      </div>
    </footer>
  )
}

export default Footer
