import { classNames } from '@/utils/classNames'

/**
 * Underlined tab bar for in-page sections (profile activity, moderation
 * queues). Used wherever a `role="tablist"` switches views of the same data set.
 */
export function Tabs({ tabs, value, onChange, className, children }) {
  return (
    <div className={className}>
      <div role="tablist" className="flex items-center gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map((tab) => {
          const isActive = tab.id === value
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={classNames(
                'relative -mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-brand-600 text-slate-900'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800',
              )}
            >
              {tab.icon ? <tab.icon className="size-4" aria-hidden="true" /> : null}
              {tab.label}
              {typeof tab.count === 'number' ? (
                <span
                  className={classNames(
                    'rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular',
                    isActive ? 'bg-brand-50 text-brand-700' : 'bg-slate-200/70 text-slate-600',
                  )}
                >
                  {tab.count}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
      {children}
    </div>
  )
}
