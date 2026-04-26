import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom'
import { useEffect } from 'react'
import { Header, Footer } from '@components/layout'
import { Home, Login, Register, Dashboard } from '@pages'
import ProtectedRoute from '@/components/ProtectedRoute'

import BookDetail from '@/pages/BookDetail/BookDetail'
import ListView from '@/pages/ListView/ListView'
import Catalog from '@/pages/Catalog/Catalog'
import AddEditBook from '@/pages/AddEditBook/AddEditBook'
import Visit from '@/pages/Visit/Visit'
import Events from '@/pages/Events/Events'
import EventDetails from '@/pages/EventDetails/EventDetails'
import AddEditEvent from '@/pages/AddEditEvent/AddEditEvent'
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
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/catalog" element={<Catalog />} />
          <Route path="/visit" element={<Visit />} />

          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route
            path="/events/add"
            element={
              <ProtectedRoute>
                <AddEditEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/edit/:id"
            element={
              <ProtectedRoute>
                <AddEditEvent />
              </ProtectedRoute>
            }
          />

          <Route path="/books" element={<ListView />} />
          <Route
            path="/books/add"
            element={
              <ProtectedRoute>
                <AddEditBook />
              </ProtectedRoute>
            }
          />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route
            path="/books/edit/:id"
            element={
              <ProtectedRoute>
                <AddEditBook />
              </ProtectedRoute>
            }
          />

          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/circulation" element={<CirculationPage />} />
          <Route path="/services/studyrooms" element={<StudyRoomsPage />} />
          <Route path="/services/printing" element={<PrintingPage />} />
          <Route path="/services/writingcenter" element={<WritingCenterPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App