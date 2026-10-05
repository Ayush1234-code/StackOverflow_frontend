import { Trophy } from 'lucide-react'

import { classNames } from '@/utils/classNames'

export function Reputation({ value, className }) {
  if (typeof value !== 'number') return null

  return (
    <span
      title={`${value} reputation`}
      className={classNames(
        'inline-flex items-center gap-1 font-medium tabular-nums text-slate-500',
        className,
      )}
    >
      <Trophy className="size-3.5 text-amber-500" aria-hidden="true" />
      {value.toLocaleString('en-US')}
    </span>
  )
}