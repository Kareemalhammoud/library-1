import { Button } from '@components/ui'
import styles from './Home.module.css'

function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to Library</h1>
      <p className={styles.subtitle}>Start building your application here.</p>
      <Button>Get Started</Button>
    </div>
  )
}

export default Home
