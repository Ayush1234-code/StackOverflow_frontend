import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * State for a popover that closes on outside click and on Escape.
 *
 * Both dismiss behaviours live here because every dropdown in the app needs
 * them, and getting the Escape handler wrong is what traps keyboard users in an
 * open menu. The ref it returns must be attached to the element wrapping the
 * trigger and the panel, so a click on the trigger does not read as "outside".
 *
 * @param {{ onOpenChange?: (open: boolean) => void }} options
 * @returns {{ open: boolean, setOpen: Function, toggle: Function, close: Function, containerRef: object }}
 */
export function useDismissable({ onOpenChange } = {}) {
  const [open, setOpenState] = useState(false)
  const containerRef = useRef(null)
  const onOpenChangeRef = useRef(onOpenChange)

  // Kept in a ref so a caller passing an inline arrow does not re-run the
  // effect (and re-bind the listeners) on every render.
  useEffect(() => {
    onOpenChangeRef.current = onOpenChange
  }, [onOpenChange])

  const setOpen = useCallback((next) => {
    setOpenState((current) => {
      const value = typeof next === 'function' ? next(current) : next
      if (value !== current) onOpenChangeRef.current?.(value)
      return value
    })
  }, [])

  const close = useCallback(() => setOpen(false), [setOpen])
  const toggle = useCallback(() => setOpen((current) => !current), [setOpen])

  useEffect(() => {
    if (!open) return undefined

    function handlePointerDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpenState(false)
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpenState(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return { open, setOpen, toggle, close, containerRef }
}
