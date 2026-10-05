import { User } from 'lucide-react'

import { classNames } from '@/utils/classNames'

const sizes = {
  sm: 'size-7 text-xs',
  md: 'size-9 text-sm',
  lg: 'size-12 text-base',
}

export function Avatar({ name, src, size = 'md', className }) {
  const initials = name
    ? name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : ''

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'User avatar'}
        className={classNames('rounded-full object-cover', sizes[size], className)}
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      className={classNames(
        'grid shrink-0 place-items-center rounded-full bg-slate-200 font-semibold text-slate-600',
        sizes[size],
        className,
      )}
    >
      {initials || <User className="size-1/2" />}
    </span>
  )
}