import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom'
import { useEffect } from 'react'
import { Header, Footer } from '@components/layout'
import { Home, Login, Register, Dashboard } from '@pages'

import BookDetail from '@/pages/BookDetail/BookDetail'
import ListView from '@/pages/ListView/ListView'
import Catalog from '@/pages/Catalog/Catalog'
import AddEditBook from '@/pages/AddEditBook/AddEditBook'
import Visit from '@/pages/Visit/Visit'
import ServicesPage from '@/pages/Services/Services'  
import CirculationPage from '@/pages/Services/Circulation'
import StudyRoomsPage from '@/pages/Services/StudyRooms'
import PrintingPage from '@/pages/Services/Printing'
import WritingCenterPage from '@/pages/Services/WritingCenter'


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

          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Catalog / Books */}
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/visit" element={<Visit />} />
          <Route path="/books" element={<ListView />} />
          <Route path="/books/add" element={<AddEditBook />} />
          <Route path="/books/:id" element={<BookDetail />} />
         {/*Add/Edit book*/} 
          <Route path="/books/:id/edit" element={<AddEditBook />} />
        {/* Services */}
          <Route path="/Services" element={<ServicesPage />} />
          <Route path="/Services/Circulation" element={<CirculationPage />} />
          <Route path="/Services/StudyRooms" element={<StudyRoomsPage />} />
          <Route path="/Services/Printing" element={<PrintingPage />} />
          <Route path="/Services/WritingCenter" element={<WritingCenterPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App