import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/**
 * Loads a resource from the API.
 *
 * The request starts whenever `fetcher` changes identity (wrap it in
 * useCallback) or when `reload` is invoked. Pass `null` to keep the hook idle.
 *
 * @param {Function|null} fetcher - Function returning a promise for the resource.
 * @param {{ enabled?: boolean }} options
 * @returns {{ data: any, error: Error|null, isLoading: boolean, reload: Function }}
 */

export function useApiResource(fetcher, { enabled = true } = {}) {
  const [data, setData] = useState(undefined)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(Boolean(fetcher) && enabled)

  const mountedRef = useRef(true)
  const runIdRef = useRef(0)

  const start = useCallback(() => {
    if (typeof fetcher !== 'function') return

    const runId = ++runIdRef.current
    setIsLoading(true)
    setError(null)

    fetcher()
      .then((result) => {
        if (mountedRef.current && runIdRef.current === runId) {
          setData(result)
        }
      })
      .catch((err) => {
        if (mountedRef.current && runIdRef.current === runId) {
          setData(undefined)
          setError(err)
        }
      })
      .finally(() => {
        if (mountedRef.current && runIdRef.current === runId) {
          setIsLoading(false)
        }
      })
  }, [fetcher])

  useEffect(() => {
    mountedRef.current = true

    if (!enabled || typeof fetcher !== 'function') return undefined

    Promise.resolve().then(start)

    return () => {
      mountedRef.current = false
      runIdRef.current += 1
    }
  }, [enabled, fetcher, start])

  const result = useMemo(
    () => ({ data, error, isLoading, reload: start }),
    [data, error, isLoading, start],
  )

  return result
}
