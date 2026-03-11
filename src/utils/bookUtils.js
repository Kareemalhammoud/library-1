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








