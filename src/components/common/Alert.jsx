import { CheckCircle2, Info, XCircle } from 'lucide-react'

import { classNames } from '@/utils/classNames'

const tones = {
  success: {
    icon: CheckCircle2,
    classes: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    iconClasses: 'text-emerald-600',
  },
  danger: {
    icon: XCircle,
    classes: 'border-red-200 bg-red-50 text-red-800',
    iconClasses: 'text-red-600',
  },
  info: {
    icon: Info,
    classes: 'border-sky-200 bg-sky-50 text-sky-900',
    iconClasses: 'text-sky-600',
  },
}

export function Alert({ tone = 'info', className, children, role = 'status' }) {
  const config = tones[tone] ?? tones.info
  const Icon = config.icon

  return (
    <div
      role={role}
      className={classNames(
        'flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm leading-relaxed',
        config.classes,
        className,
      )}
    >
      <Icon className={classNames('mt-0.5 size-4 shrink-0', config.iconClasses)} aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  )
}