export function getCampus(id) {
  return id % 3 === 0 ? 'both' : id % 2 === 0 ? 'Byblos' : 'Beirut'
}

export function getAvailability(id) {
  const total = 3 + (id % 4)
  const borrowed = id % 3
  return (total - borrowed) > 0
}

export function getCopies(id) {
  const total = 3 + (id % 4)
  const borrowed = id % 3
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








