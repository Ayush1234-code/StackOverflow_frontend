import { forwardRef } from 'react'

import { classNames } from '@/utils/classNames'

export const Textarea = forwardRef(function Textarea({ error, className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={5}
      aria-invalid={error ? true : undefined}
      className={classNames(
        'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2',
        error
          ? 'border-red-400 focus:border-red-400 focus:ring-red-600/20'
          : 'border-slate-300 focus:border-brand-600 focus:ring-brand-600/20',
        className,
      )}
      {...props}
    />
  )
})