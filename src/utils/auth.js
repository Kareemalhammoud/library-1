export const ADMIN_EMAIL = 'admin@lau.edu'

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
  return isLoggedInUser() && getStoredUser()?.email === ADMIN_EMAIL
}
