import { useEffect, useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'

import { Button } from '@/components/common/Button'

export function ConfirmButton({
  children,
  confirmLabel = 'Are you sure? Click again to confirm',
  onConfirm,
  loading = false,
  size = 'sm',
  className,
  icon: Icon = Trash2,
}) {
  const [armed, setArmed] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!armed) return undefined
    timerRef.current = window.setTimeout(() => setArmed(false), 3500)
    return () => window.clearTimeout(timerRef.current)
  }, [armed])

  function handleClick() {
    if (armed) {
      setArmed(false)
      onConfirm?.()
    } else {
      setArmed(true)
    }
  }

  return (
    <Button
      variant={armed ? 'danger' : 'secondary'}
      size={size}
      className={className}
      onClick={handleClick}
      loading={loading}
      icon={Icon}
    >
      {armed ? confirmLabel : children}
    </Button>
  )
}