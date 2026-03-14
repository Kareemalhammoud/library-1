import { Routes, Route } from 'react-router-dom'
import { Header, Footer } from '@components/layout'
import { Home, Login, Register, Dashboard } from '@pages'

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
