/* global process */
import http from 'node:http'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { BOOKS } from '../src/data/bookData.js'

const PORT = Number(process.env.PORT || 5000)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const STATE_FILE = path.join(DATA_DIR, 'library-state.json')

const state = await loadState()

function getCampus(id) {
  return id % 3 === 0 ? 'both' : id % 2 === 0 ? 'Byblos' : 'Beirut'
}

function getBaseCopies(id) {
  const total = 3 + (id % 4)
  const borrowed = id % 3
  return { total, available: total - borrowed }
}

async function loadState() {
  try {
    const data = JSON.parse(await readFile(STATE_FILE, 'utf8'))
    return {
      loans: Array.isArray(data.loans) ? data.loans : [],
      reservations: Array.isArray(data.reservations) ? data.reservations : [],
    }
  } catch {
    return { loans: [], reservations: [] }
  }
}

async function saveState() {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2))
}

function getUserId(req) {
  const explicitUser = req.headers['x-user-id']
  if (explicitUser) return String(explicitUser)

  const auth = req.headers.authorization || ''
  if (auth.startsWith('Bearer ')) return auth.slice(7)

  return 'local-user'
}

function getBookById(id) {
  return BOOKS.find((book) => String(book.id) === String(id))
}

function getBookInventory(book) {
  const base = getBaseCopies(Number(book.id) || 0)
  const activeLoans = state.loans.filter((loan) => String(loan.bookId) === String(book.id) && loan.status === 'active')
  const availableCopies = Math.max(base.available - activeLoans.length, 0)

  return {
    copies: base.total,
    availableCopies,
    available: availableCopies > 0,
  }
}

function toApiBook(book) {
  return {
    ...book,
    campus: book.campus || getCampus(Number(book.id) || 0),
    ...getBookInventory(book),
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-User-Id',
    'Content-Type': 'application/json; charset=utf-8',
  })
  res.end(JSON.stringify(payload))
}

function sendNotFound(res, message = 'Not found') {
  sendJson(res, 404, { message })
}

async function readJson(req) {
  let body = ''
  for await (const chunk of req) {
    body += chunk
  }

  if (!body) return {}
  return JSON.parse(body)
}

function filterBooks(books, params) {
  const search = params.get('search')?.trim().toLowerCase()
  const genre = params.get('genre')
  const language = params.get('language')
  const campus = params.get('campus')
  const availability = params.get('availability')
  const sort = params.get('sort')

  const filtered = books.filter((book) => {
    const apiBook = toApiBook(book)
    const bookLanguage = apiBook.language === 'FR' ? 'French' : 'English'
    const matchesSearch =
      !search ||
      apiBook.title.toLowerCase().includes(search) ||
      apiBook.author.toLowerCase().includes(search)

    if (!matchesSearch) return false
    if (genre && genre !== 'All' && apiBook.genre !== genre) return false
    if (language && !language.startsWith('All ') && bookLanguage !== language) return false
    if (campus && !campus.startsWith('All ') && apiBook.campus !== 'both' && apiBook.campus !== campus) return false
    if (availability === 'Available' && !apiBook.available) return false
    if (availability === 'Unavailable' && apiBook.available) return false

    return true
  })

  switch (sort) {
    case 'title-asc':
      filtered.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'title-desc':
      filtered.sort((a, b) => b.title.localeCompare(a.title))
      break
    case 'year-desc':
      filtered.sort((a, b) => b.year - a.year)
      break
    case 'year-asc':
      filtered.sort((a, b) => a.year - b.year)
      break
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating)
      break
    default:
      break
  }

  return filtered.map(toApiBook)
}

async function handleBorrow(req, res, bookId) {
  const book = getBookById(bookId)
  if (!book) {
    sendNotFound(res, 'Book not found.')
    return
  }

  const apiBook = toApiBook(book)
  if (apiBook.availableCopies < 1) {
    sendJson(res, 409, { message: 'No copies are currently available. Reserve this book instead.' })
    return
  }

  const payload = await readJson(req)
  const userId = getUserId(req)
  const existingLoan = state.loans.find(
    (loan) => String(loan.bookId) === String(book.id) && loan.userId === userId && loan.status === 'active'
  )

  if (existingLoan) {
    sendJson(res, 409, { message: 'This user already has an active loan for this book.', loan: existingLoan })
    return
  }

  const borrowedAt = payload.borrowedAt || new Date().toISOString()
  const dueAt = payload.dueAt || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
  const loan = {
    id: `loan-${Date.now()}`,
    bookId: book.id,
    userId,
    borrowedAt,
    dueAt,
    status: 'active',
  }

  state.loans.push(loan)
  await saveState()

  sendJson(res, 201, {
    message: 'Book borrowed successfully.',
    loan,
    book: toApiBook(book),
  })
}

async function handleReserve(req, res, bookId) {
  const book = getBookById(bookId)
  if (!book) {
    sendNotFound(res, 'Book not found.')
    return
  }

  const payload = await readJson(req)
  const userId = getUserId(req)
  const existingReservation = state.reservations.find(
    (reservation) => String(reservation.bookId) === String(book.id) &&
      reservation.userId === userId &&
      reservation.status === 'active'
  )

  if (existingReservation) {
    sendJson(res, 409, {
      message: 'This user already has an active reservation for this book.',
      reservation: existingReservation,
    })
    return
  }

  const reservation = {
    id: `reservation-${Date.now()}`,
    bookId: book.id,
    userId,
    reservedAt: payload.reservedAt || new Date().toISOString(),
    status: 'active',
  }

  state.reservations.push(reservation)
  await saveState()

  sendJson(res, 201, {
    message: 'Book reserved successfully.',
    reservation,
    book: toApiBook(book),
  })
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const pathParts = url.pathname.split('/').filter(Boolean)

  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {})
    return
  }

  if (req.method === 'GET' && url.pathname === '/api/health') {
    sendJson(res, 200, { ok: true })
    return
  }

  if (req.method === 'GET' && url.pathname === '/api/books') {
    sendJson(res, 200, { books: filterBooks(BOOKS, url.searchParams) })
    return
  }

  if (pathParts[0] === 'api' && pathParts[1] === 'books' && pathParts[2]) {
    const bookId = decodeURIComponent(pathParts[2])

    if (req.method === 'GET' && pathParts.length === 3) {
      const book = getBookById(bookId)
      if (!book) {
        sendNotFound(res, 'Book not found.')
        return
      }

      sendJson(res, 200, { book: toApiBook(book) })
      return
    }

    if (req.method === 'POST' && pathParts[3] === 'borrow') {
      await handleBorrow(req, res, bookId)
      return
    }

    if (req.method === 'POST' && pathParts[3] === 'reserve') {
      await handleReserve(req, res, bookId)
      return
    }
  }

  if (req.method === 'POST' && url.pathname === '/api/loans') {
    const payload = await readJson(req)
    await handleBorrow(req, res, payload.bookId)
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/reservations') {
    const payload = await readJson(req)
    await handleReserve(req, res, payload.bookId)
    return
  }

  sendNotFound(res)
}

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    sendJson(res, 500, { message: error.message || 'Internal server error.' })
  })
})

server.listen(PORT, () => {
  console.log(`Library API running at http://localhost:${PORT}`)
})
