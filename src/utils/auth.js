const DEFAULT_ADMIN_EMAILS = 'admin@lau.edu,superadmin@lau.edu'

export const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || DEFAULT_ADMIN_EMAILS)
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

// Backwards compat — first email in the list is treated as the canonical admin
export const ADMIN_EMAIL = ADMIN_EMAILS[0]

export function isLoggedInUser() {
  return localStorage.getItem('isLoggedIn') === 'true'
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

export function isAdminUser() {
  if (!isLoggedInUser()) return false
  const email = getStoredUser()?.email
  return Boolean(email) && ADMIN_EMAILS.includes(email.toLowerCase())
}
