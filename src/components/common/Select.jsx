import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

import { classNames } from '@/utils/classNames'

const baseClasses =
  'block w-full appearance-none rounded-lg border bg-white py-2 pl-3 pr-9 text-sm text-slate-900 shadow-sm transition-colors focus:outline-none focus:ring-2'

/**
 * A native `<select>` styled to match Input.
 *
 * Native is deliberate: a custom listbox would have to reimplement keyboard
 * navigation, type-ahead, screen-reader announcements and the mobile picker for
 * no gain. The chevron is decorative and hidden from assistive tech, because the
 * native control already announces itself correctly.
 */
export const Select = forwardRef(function Select(
  { error, className, children, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={error ? true : undefined}
        className={classNames(
          baseClasses,
          error
            ? 'border-red-400 focus:border-red-400 focus:ring-red-600/20'
            : 'border-slate-300 focus:border-brand-600 focus:ring-brand-600/20',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
      />
    </div>
  )
})
