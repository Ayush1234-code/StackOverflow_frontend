import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

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
    const serverMessage =
      typeof data?.message === 'string' && data.message
        ? data.message
        : typeof data?.error === 'string' && data.error
          ? data.error
          : null

    const normalized = new Error(
      serverMessage || `Request failed with status ${status}.`,
    )
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
    const network = new Error(
      'Could not reach the server. Make sure the backend is running.',
    )
    network.status = 0
    return network
  }

  return error
}