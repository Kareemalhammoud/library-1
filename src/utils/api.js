// Thin wrapper around `fetch` that prepends the API base URL and throws
// on non-2xx responses, so each page can just `await` and handle errors
// with a single try/catch. Used by the books and events pages to replace
// the old static imports from src/data/*.

const RAW_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  'http://localhost:5000/api'

const BASE_URL = RAW_BASE_URL.replace(/\/$/, '').endsWith('/api')
  ? RAW_BASE_URL.replace(/\/$/, '')
  : `${RAW_BASE_URL.replace(/\/$/, '')}/api`

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {}

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (auth) {
    const token = localStorage.getItem('token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(data.message || `Request failed (${response.status})`)
    error.status = response.status
    throw error
  }

  return data
}

function collectionFromResponse(data, key) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.[key])) return data[key]
  return []
}

// --- Books ---

export function getBooks(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value)
    }
  })
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return request(`/books${suffix}`).then((data) => collectionFromResponse(data, 'books'))
}

export function getBook(id) {
  return request(`/books/${id}`)
}

export function createBook(payload) {
  return request('/books', { method: 'POST', body: payload, auth: true })
}

export function updateBook(id, payload) {
  return request(`/books/${id}`, { method: 'PUT', body: payload, auth: true })
}

export function deleteBook(id) {
  return request(`/books/${id}`, { method: 'DELETE', auth: true })
}

// --- Events ---

export function getEvents(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value)
    }
  })
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return request(`/events${suffix}`).then((data) => collectionFromResponse(data, 'events'))
}

export function getEvent(id) {
  return request(`/events/${id}`)
}

export function createEvent(payload) {
  return request('/events', { method: 'POST', body: payload, auth: true })
}

export function updateEvent(id, payload) {
  return request(`/events/${id}`, { method: 'PUT', body: payload, auth: true })
}

export function deleteEvent(id) {
  return request(`/events/${id}`, { method: 'DELETE', auth: true })
}

export function getMyEventRegistrations() {
  return request('/events/registrations/me', { auth: true })
}

export function registerForEvent(id) {
  return request(`/events/${id}/register`, { method: 'POST', auth: true })
}

export function cancelEventRegistration(id) {
  return request(`/events/${id}/register`, { method: 'DELETE', auth: true })
}

// --- Favorites ---

export function getFavorites() {
  return request('/favorites', { auth: true })
}

export function addFavorite(bookId) {
  return request(`/favorites/${bookId}`, { method: 'POST', auth: true })
}

export function removeFavorite(bookId) {
  return request(`/favorites/${bookId}`, { method: 'DELETE', auth: true })
}

// --- Loans ---

export function getActiveLoans() {
  return request('/loans', { auth: true })
}

export function createLoan(bookId) {
  return request(`/books/${bookId}/borrow`, { method: 'POST', body: { bookId }, auth: true })
}

export function createReservation(bookId) {
  return request(`/books/${bookId}/reserve`, { method: 'POST', body: { bookId }, auth: true })
}

export function returnLoan(loanId) {
  return request(`/loans/${loanId}/return`, { method: 'POST', auth: true })
}

// --- Reading progress ---

export function getReadingProgress(bookId) {
  return request(`/reading-progress/${bookId}`, { auth: true })
}

export function updateReadingProgress(bookId, progress) {
  return request(`/reading-progress/${bookId}`, {
    method: 'PUT',
    body: { progress },
    auth: true,
  })
}

// --- Reviews ---

export function getReviewsForBook(bookId) {
  return request(`/reviews/book/${bookId}`)
}

export function submitReview(bookId, { rating, comment }) {
  return request(`/reviews/book/${bookId}`, {
    method: 'POST',
    body: { rating, comment },
    auth: true,
  })
}

export function deleteReview(reviewId) {
  return request(`/reviews/${reviewId}`, { method: 'DELETE', auth: true })
}
