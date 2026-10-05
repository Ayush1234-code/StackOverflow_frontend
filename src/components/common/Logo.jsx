import { Code2 } from 'lucide-react'

import { classNames } from '@/utils/classNames'
import { APP_NAME } from '@/utils/constants'

export function Logo({ className, showWordmark = true }) {
  return (
    <span className={classNames('inline-flex items-center gap-2', className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-brand-600 text-white">
        <Code2 className="size-5" strokeWidth={2.2} aria-hidden="true" />
      </span>
      {showWordmark && (
        <span className="text-lg font-bold tracking-tight text-slate-900">
          {APP_NAME}
        </span>
      )}
    </span>
  )
}