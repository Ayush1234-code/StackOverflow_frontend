import { classNames } from '@/utils/classNames'

/**
 * Segmented control used for sorting questions, tags, members and search
 * results. Replaces four near-identical inline "tablist" implementations.
 */
export function SortTabs({ options, value, onChange, label = 'Sort', className }) {
  if (!options?.length) return null

  return (
    <div
      role="tablist"
      aria-label={label}
      className={classNames(
        'inline-flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-100/80 p-0.5',
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={classNames(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors',
              isActive
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800',
            )}
          >
            {option.icon ? <option.icon className="size-3.5" aria-hidden="true" /> : null}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
