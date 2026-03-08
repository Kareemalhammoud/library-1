import { Routes, Route } from 'react-router-dom'
import { Header, Footer } from '@components/layout'
import { Home } from '@pages'

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
