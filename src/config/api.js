const rawApiUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE

if (!rawApiUrl) {
  throw new Error('VITE_API_URL is not configured.')
}

const parsedApiUrl = new URL(rawApiUrl)
if (!['http:', 'https:'].includes(parsedApiUrl.protocol)) {
  throw new Error('VITE_API_URL must use HTTP or HTTPS.')
}

const normalizedApiUrl = rawApiUrl.replace(/\/+$/, '')

export const API_BASE_URL = normalizedApiUrl.endsWith('/api')
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`

export const API_ORIGIN = API_BASE_URL.slice(0, -4)
