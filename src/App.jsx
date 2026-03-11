import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom'
import { useEffect } from 'react'
import { Header, Footer } from '@components/layout'
import { Home } from '@pages'
import BookDetail from '@/pages/BookDetail/BookDetail'
import ListView from '@/pages/ListView/ListView'
import Catalog from '@/pages/Catalog/Catalog'

function ScrollToTop() {
  const { pathname } = useLocation()
  const navType = useNavigationType()

  useEffect(() => {
    if (navType !== 'POP') {
      window.scrollTo(0, 0)
    }
  }, [pathname, navType])

  return null
}

function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/books" element={<ListView />} />
          <Route path="/books/:id" element={<BookDetail />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App