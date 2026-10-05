import { ChevronLeft, ChevronRight } from 'lucide-react'

import { classNames } from '@/utils/classNames'

function pageItems(page, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const set = new Set([1, totalPages, page - 1, page, page + 1])
  const items = []
  let previous = 0
  for (const value of [...set].filter((v) => v >= 1 && v <= totalPages).sort((a, b) => a - b)) {
    if (previous && value - previous > 1) items.push('ellipsis')
    items.push(value)
    previous = value
  }
  return items
}

export function Pagination({ page = 1, totalPages = 1, onPageChange, className }) {
  if (totalPages <= 1) return null

  const current = Math.max(1, Math.min(page, totalPages))

  const navButtonClasses = (disabled) =>
    classNames(
      'inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-sm font-medium transition-colors',
      disabled
        ? 'cursor-not-allowed border-slate-200 text-slate-300'
        : 'border-slate-300 bg-white text-slate-600 shadow-sm hover:bg-slate-50',
    )

  return (
    <nav
      aria-label="Pagination"
      className={classNames('flex flex-wrap items-center gap-1.5', className)}
    >
      <button
        type="button"
        onClick={() => onPageChange(current - 1)}
        disabled={current <= 1}
        className={navButtonClasses(current <= 1)}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      <span className="hidden gap-1.5 sm:inline-flex">
        {pageItems(current, totalPages).map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`e-${index}`} className="px-1.5 py-1.5 text-sm text-slate-400" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === current ? 'page' : undefined}
              aria-label={`Page ${item}`}
              className={classNames(
                'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2.5 text-sm font-medium transition-colors',
                item === current
                  ? 'bg-brand-600 font-semibold text-white'
                  : 'border border-slate-300 bg-white text-slate-600 shadow-sm hover:bg-slate-50',
              )}
            >
              {item}
            </button>
          ),
        )}
      </span>

      <span className="px-2 text-sm text-slate-500 sm:hidden">
        Page {current} of {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(current + 1)}
        disabled={current >= totalPages}
        className={navButtonClasses(current >= totalPages)}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  )
}