export function getCampus(id) {
  return id % 3 === 0 ? 'both' : id % 2 === 0 ? 'Byblos' : 'Beirut'
}

function getUserBorrow(id) {
  try {
    const u = JSON.parse(localStorage.getItem('user'))
    const prefix = u?.email ? `${u.email}:` : ''
    return !!localStorage.getItem(`${prefix}borrowed-${id}`)
  } catch { return false }
}

export function getAvailability(id) {
  const { available } = getCopies(id)
  return available > 0
}

export function getCopies(id) {
  const total = 3 + (id % 4)
  const baseBorrowed = id % 3
  const userBorrowed = getUserBorrow(id) ? 1 : 0
  const borrowed = Math.min(baseBorrowed + userBorrowed, total)
  return { total, borrowed, available: total - borrowed }
}

const RESOURCE_TYPES = ['Book', 'Book', 'Book', 'Journal', 'Thesis', 'Book', 'Reference', 'Book', 'Conference Paper', 'Book', 'E-Book', 'Book']

export function getResourceType(id) {
  return RESOURCE_TYPES[id % RESOURCE_TYPES.length]
}

export function getCallNumber(book) {
  const prefix = book.genre.substring(0, 2).toUpperCase()
  const authorCode = book.author.split(' ').pop().substring(0, 3).toUpperCase()
  const num = 100 + (book.id * 17) % 900
  return `${prefix}${num}.${authorCode} ${book.year}`
}








