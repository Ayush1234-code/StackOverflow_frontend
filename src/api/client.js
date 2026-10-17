import axios from 'axios'

const API_URL = resolveApiBaseUrl()

export const httpClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

httpClient.interceptors.request.use((request) => {
  const token = window.localStorage.getItem('stackflow.token')
  if (token) {
    request.headers.Authorization = `Bearer ${token}`
  }
  return request
})

httpClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const normalized = normalizeError(error)
    const url = error?.config?.url ?? ''
    // An expired/invalid session breaks *all* authenticated calls. Clear the
    // stored session and let AuthProvider know so the UI can log out — except
    // on the auth endpoints themselves, where 401 just means bad credentials.
    if (normalized.status === 401 && !/\/auth\/(login|register)$/.test(url)) {
      window.localStorage.removeItem('stackflow.token')
      window.localStorage.removeItem('stackflow.user')
      window.dispatchEvent(new window.Event('stackflow:unauthorized'))
    }
    return Promise.reject(normalized)
  },
)

function normalizeError(error) {
  if (error.response) {
    const { status, data, headers } = error.response
    const serverMessage = extractServerMessage(data)

    let fallback = `Request failed with status ${status}.`
    if (status === 404) {
      fallback =
        'API endpoint not found. Check that VITE_API_URL ends with /api and matches the backend routes.'
    } else if (status >= 500) {
      fallback = 'The server encountered an error. Please try again in a moment.'
    }

    const normalized = new Error(serverMessage || fallback)
    normalized.status = status
    normalized.response = { status, data, headers }
    return normalized
  }

  if (error.code === 'ECONNABORTED') {
    const timeout = new Error('The request timed out. Please try again.')
    timeout.status = 408
    return timeout
  }

  if (!error.response) {
    const network = new Error(describeNetworkFailure(error))
    network.status = 0
    return network
  }

  return error
}

function extractServerMessage(data) {
  if (typeof data?.message === 'string' && data.message) return data.message
  if (typeof data?.error === 'string' && data.error) return data.error
  if (Array.isArray(data?.details) && data.details.length) {
    return data.details
      .map((entry) => (typeof entry === 'string' ? entry : entry?.msg ?? entry?.message))
      .filter(Boolean)
      .join(' ')
  }
  if (Array.isArray(data?.errors) && data.errors.length) {
    return data.errors
      .map((entry) => (typeof entry === 'string' ? entry : entry?.msg ?? entry?.message))
      .filter(Boolean)
      .join(' ')
  }
  return null
}

function describeNetworkFailure(error) {
  const code = error?.code
  const message = (error?.message ?? '').toLowerCase()
  const crossOrigin = API_URL.startsWith('http')
  const looksLikeBrowserBlock =
    code === 'ERR_NETWORK' ||
    message.includes('network error') ||
    message.includes('failed to fetch')

  if (import.meta.env.PROD && crossOrigin && looksLikeBrowserBlock) {
    return (
      'The browser could not read the API response. This usually means the backend CORS allowlist ' +
      'does not include this site, or the API is unreachable. Confirm FRONTEND_URL on Render matches ' +
      'https://stack-overflow-frontend-vkd4.vercel.app and redeploy the backend.'
    )
  }

  if (import.meta.env.PROD && API_URL === '/api') {
    return (
      'Could not reach the API. VITE_API_URL was not set at build time, so requests are going to ' +
      'this site instead of Render. Set VITE_API_URL to https://stackoverflow-backend-1-uft2.onrender.com/api ' +
      'in Vercel and redeploy.'
    )
  }

  if (looksLikeBrowserBlock) {
    return 'Could not reach the server. Make sure the backend is running and VITE_API_PROXY_TARGET matches your local API port.'
  }

  return 'Could not reach the server. Make sure the backend is running.'
}

function resolveApiBaseUrl() {
  const normalized = normalizeApiUrl(import.meta.env.VITE_API_URL)
  if (import.meta.env.PROD && normalized === '/api') {
    console.error(
      '[stackflow] VITE_API_URL is missing for this production build. API calls will target the frontend host (/api) instead of Render.',
    )
  }
  return normalized
}

function normalizeApiUrl(value) {
  const raw = value?.trim()
  if (!raw) return '/api'

  try {
    const url = new URL(raw)
    const pathname = url.pathname.replace(/\/+$/, '')
    url.pathname = pathname.endsWith('/api') ? pathname : `${pathname}/api`
    url.search = ''
    url.hash = ''
    return url.toString().replace(/\/$/, '')
  } catch {
    return raw.replace(/\/+$/, '')
  }
}
