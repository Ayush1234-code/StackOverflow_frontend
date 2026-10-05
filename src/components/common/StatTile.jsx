import { classNames } from '@/utils/classNames'

/**
 * Compact metric tile. Every value is passed in by the caller — the component
 * never invents a number, it only formats one.
 */
export function StatTile({ icon: Icon, label, value, hint, tone = 'neutral', className }) {
  const tones = {
    neutral: 'text-slate-500',
    brand: 'text-brand-600',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
  }

  return (
    <div
      className={classNames(
        'flex min-w-0 flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-card',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {Icon ? <Icon className={classNames('size-4 shrink-0', tones[tone])} aria-hidden="true" /> : null}
        <p className="truncate text-[13px] font-medium text-slate-500">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-semibold leading-none tracking-tight text-slate-900 tabular">
        {value}
      </p>
      {hint ? <p className="mt-1.5 truncate text-xs text-slate-400">{hint}</p> : null}
    </div>
  )
}

export function StatGrid({ className, children }) {
  return (
    <div
      className={classNames(
        'grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4',
        className,
      )}
    >
      {children}
    </div>
  )
}
