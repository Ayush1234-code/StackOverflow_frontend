import { useEffect, useMemo, useState } from 'react'

import { previewApi } from '@/api/previewAdapter'

import { AuthContext } from './auth'

const TOKEN_KEY = 'stackflow.token'
const USER_KEY = 'stackflow.user'

function readStoredUser() {
  try {
    const stored = window.localStorage.getItem(USER_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function persistAuth(token, user) {
  window.localStorage.setItem(TOKEN_KEY, token)
  window.localStorage.setItem(USER_KEY, JSON.stringify(user))
}

function clearStoredAuth() {
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(readStoredUser)
  const hasToken = Boolean(token)
  const [restoring, setRestoring] = useState(hasToken)

  // A 401 on any authenticated API call means the session expired or was
  // revoked on the server. Interceptor in src/api/client.js clears storage and
  // dispatches this event so the UI drops the stale user state immediately.
  useEffect(() => {
    function handleUnauthorized() {
      setUser(null)
      setToken(null)
      setRestoring(false)
    }
    window.addEventListener('stackflow:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('stackflow:unauthorized', handleUnauthorized)
  }, [])

  useEffect(() => {
    if (!hasToken) return undefined

    let active = true
    previewApi.auth
      .me()
      .then((data) => {
        if (!active) return
        setUser(data.user ?? null)
        window.localStorage.setItem(USER_KEY, JSON.stringify(data.user ?? null))
      })
      .catch(() => {
        if (!active) return
        clearStoredAuth()
        setUser(null)
        setToken(null)
      })
      .finally(() => {
        if (active) setRestoring(false)
      })

    return () => {
      active = false
    }
  }, [hasToken])

  const login = useMemo(
    () =>
      async function login(credentials) {
        const data = await previewApi.auth.login(credentials)
        const nextToken = data.token ?? data.accessToken
        if (!nextToken) throw new Error('Login failed: no token returned.')

        if (data.user) {
          persistAuth(nextToken, data.user)
          setToken(nextToken)
          setUser(data.user)
          return data.user
        }

        setToken(nextToken)
        return null
      },
    [],
  )

  const register = useMemo(
    () =>
      async function register(payload) {
        const data = await previewApi.auth.register(payload)
        const nextToken = data.token ?? data.accessToken
        if (!nextToken) throw new Error('Signup failed: no token returned.')

        if (data.user) {
          persistAuth(nextToken, data.user)
          setToken(nextToken)
          setUser(data.user)
          return data.user
        }

        setToken(nextToken)
        return null
      },
    [],
  )

  function logout() {
    // Sign out locally first so the UI reacts immediately, then tell the
    // server to revoke the token. The request is fire-and-forget: a failure
    // here must not trap the user in a signed-in state, and the token is
    // already gone from this browser either way.
    //
    // The token is captured before it is cleared and handed to the API
    // explicitly — otherwise the request interceptor would find nothing in
    // localStorage and the call would 401 without revoking anything.
    const tokenToRevoke = window.localStorage.getItem(TOKEN_KEY)
    clearStoredAuth()
    setUser(null)
    setToken(null)
    if (tokenToRevoke) previewApi.auth.logout(tokenToRevoke).catch(() => {})
  }

  function updateUser(nextUser) {
    if (!nextUser) return
    setUser(nextUser)
    window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading: hasToken && restoring,
      login,
      register,
      logout,
      updateUser,
    }),
    [user, token, hasToken, restoring, login, register],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}