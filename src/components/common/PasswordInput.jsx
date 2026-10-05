import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { Input } from '@/components/common/Input'
import { classNames } from '@/utils/classNames'

export const PasswordInput = forwardRef(function PasswordInput({ error, className, ...props }, ref) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={classNames('relative', className)}>
      <Input
        ref={ref}
        error={error}
        type={visible ? 'text' : 'password'}
        className="pr-11"
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        tabIndex={-1}
        className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/40"
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden="true" />
        ) : (
          <Eye className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  )
})