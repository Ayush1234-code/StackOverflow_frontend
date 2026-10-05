import { Loader2 } from 'lucide-react'

import { classNames } from '@/utils/classNames'

export function Spinner({ className, ...props }) {
  return (
    <Loader2
      className={classNames('size-5 animate-spin text-brand-600', className)}
      aria-label="Loading"
      {...props}
    />
  )
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <Spinner className="size-7" />
      <p className="text-sm">{label}</p>
    </div>
  )
}