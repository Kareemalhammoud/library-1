import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'auto'
}

const savedTheme = localStorage.getItem('theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const shouldUseDark = savedTheme ? savedTheme === 'dark' : prefersDark

document.documentElement.classList.toggle('dark', shouldUseDark)
document.body.classList.toggle('dark', shouldUseDark)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
