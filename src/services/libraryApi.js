const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api'
).replace(/\/$/, '')

export function isBackendConfigured() {
  return Boolean(API_BASE_URL)
}

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('token') || localStorage.getItem('authToken')
  const user = getStoredUser()

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  if (user?.email) {
    headers['X-User-Id'] = user.email
  }

  return headers
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
}

async function request(path, options = {}) {
  if (!isBackendConfigured()) {
    throw new Error('Backend API URL is not configured.')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  })

  const text = await response.text()
  let data = null

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      if (response.ok) {
        throw new Error('The backend returned a non-JSON response.')
      }
      data = { message: text }
    }
  }

  if (!response.ok) {
    const message = data?.message || data?.error || `Request failed with status ${response.status}`
    const error = new Error(message)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

async function requestFirst(paths, options) {
  let lastError

  for (const path of paths) {
    try {
      return await request(path, options)
    } catch (error) {
      if (error.status && error.status !== 404) {
        throw error
      }
      lastError = error
    }
  }

  throw lastError
}

function toQuery(params = {}) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'All' && !String(value).startsWith('All ')) {
      query.set(key, value)
    }
  })

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

function toFiniteNumber(value) {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value === 'boolean') return undefined

  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}

function toBoolean(value) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value > 0
  if (typeof value !== 'string') return undefined

  const normalized = value.trim().toLowerCase()
  if (['true', 'yes', 'available', 'in stock', 'instock'].includes(normalized)) return true
  if (['false', 'no', 'unavailable', 'borrowed', 'checked out', 'reserved', 'out of stock'].includes(normalized)) return false

  return undefined
}

export function normalizeBook(rawBook) {
  if (!rawBook) return null

  const id = rawBook.id ?? rawBook._id ?? rawBook.bookId
  const rawCopies = rawBook.copies ?? rawBook.totalCopies ?? rawBook.inventory?.total
  const rawAvailableCopies =
    rawBook.availableCopies ??
    rawBook.availableCount ??
    rawBook.inventory?.available ??
    rawBook.available
  const copies = toFiniteNumber(rawCopies)
  const availableNumber = toFiniteNumber(rawAvailableCopies)
  const availableBoolean = toBoolean(rawBook.available ?? rawBook.isAvailable ?? rawBook.availability ?? rawBook.status)
  const availableCopies =
    availableNumber ?? (availableBoolean === undefined ? undefined : availableBoolean ? copies ?? 1 : 0)

  return {
    ...rawBook,
    id,
    title: rawBook.title || rawBook.name || 'Untitled book',
    author: rawBook.author || rawBook.writer || rawBook.publisher || 'Unknown author',
    genre: rawBook.genre || rawBook.subject || rawBook.category || 'General',
    language: rawBook.language === 'French' ? 'FR' : rawBook.language || 'EN',
    year: Number(rawBook.year || rawBook.publishedYear || 0),
    pages: Number(rawBook.pages || 0),
    rating: Number(rawBook.rating || 0),
    publisher: rawBook.publisher || '',
    isbn: rawBook.isbn || '',
    description: rawBook.description || rawBook.summary || 'No description available yet.',
    cover: rawBook.cover || rawBook.coverImage || rawBook.imageUrl || '',
    copies: copies ?? rawBook.copies,
    available: availableBoolean ?? (availableCopies === undefined ? rawBook.available : availableCopies > 0),
    availableCopies: availableCopies ?? rawBook.availableCopies,
    userLoan: rawBook.userLoan || rawBook.currentUserLoan || null,
    userReservation: rawBook.userReservation || rawBook.currentUserReservation || null,
  }
}

function unwrapList(data) {
  const rows = Array.isArray(data) ? data : data?.books || data?.items || data?.results || data?.data || []
  return rows.map(normalizeBook).filter(Boolean)
}

function unwrapOne(data) {
  return normalizeBook(data?.book || data?.item || data?.data || data)
}

export async function fetchBooks(params = {}) {
  const query = toQuery(params)
  const data = await requestFirst([`/api/books${query}`, `/books${query}`])
  return unwrapList(data)
}

export async function fetchBookById(id) {
  const data = await requestFirst([`/api/books/${id}`, `/books/${id}`])
  return unwrapOne(data)
}

export async function borrowBook(bookId, payload = {}) {
  return requestFirst(
    [`/api/books/${bookId}/borrow`, `/api/loans`, `/loans`],
    {
      method: 'POST',
      body: JSON.stringify({ bookId, ...payload }),
    }
  )
}

export async function reserveBook(bookId, payload = {}) {
  return requestFirst(
    [`/api/books/${bookId}/reserve`, `/api/reservations`, `/reservations`],
    {
      method: 'POST',
      body: JSON.stringify({ bookId, ...payload }),
    }
  )
}

export async function createStudyRoomBooking(payload) {
  return requestFirst(
    ['/api/study-room-bookings', '/api/services/study-rooms', '/study-room-bookings'],
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  )
}

export async function fetchStudyRoomAvailability(params = {}) {
  const query = toQuery(params)
  return requestFirst(
    [
      `/api/study-room-bookings/availability${query}`,
      `/api/services/study-rooms/availability${query}`,
      `/study-room-bookings/availability${query}`,
    ],
    { method: 'GET' }
  )
}

export async function createHelpRequest(payload) {
  return requestFirst(
    ['/api/help-requests', '/api/services/help-requests', '/help-requests'],
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  )
}
