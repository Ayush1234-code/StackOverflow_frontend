import { forwardRef } from 'react'
import { Search, X } from 'lucide-react'

import { classNames } from '@/utils/classNames'

/**
 * The single search control used by the header, home page, tag filters, search
 * results and the 404 page. Previously this markup was copy-pasted into five
 * places with slightly different focus rings and padding.
 */
export const SearchInput = forwardRef(function SearchInput(
  {
    value,
    onChange,
    onClear,
    onSubmit,
    size = 'md',
    className,
    inputClassName,
    busy = false,
    ...props
  },
  ref,
) {
  const sizes = {
    sm: 'h-8 pl-8 pr-8 text-sm',
    md: 'h-10 pl-9 pr-9 text-sm',
    lg: 'h-12 pl-11 pr-24 text-[15px]',
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape' && value) {
      event.preventDefault()
      onClear?.()
    }
  }

  return (
    <div className={classNames('relative', className)}>
      <Search
        className={classNames(
          'pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400',
          size === 'lg' ? 'left-3.5 size-5' : size === 'sm' ? 'left-2.5 size-3.5' : 'left-3 size-4',
        )}
        aria-hidden="true"
      />
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        onSubmit={onSubmit}
        className={classNames(
          'w-full rounded-lg border border-slate-300 bg-slate-50 text-slate-900 shadow-xs transition-colors',
          'placeholder:text-slate-400',
          'hover:border-slate-400',
          'focus:border-brand-600 focus:bg-white focus:ring-0 focus:outline-none focus-visible:ring-0',
          // Hide the WebKit "x" so clearing is a single, predictable control.
          '[&::-webkit-search-cancel-button]:appearance-none',
          sizes[size],
          inputClassName,
        )}
        {...props}
      />
      {value && onClear ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
          style={{ right: size === 'lg' ? '5.5rem' : '0.5rem' }}
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      ) : null}
      {busy ? (
        <span
          className={classNames(
            'absolute top-1/2 size-3.5 -translate-y-1/2 animate-pulse rounded-full bg-slate-300',
            size === 'lg' ? 'right-3' : 'right-2.5',
          )}
          aria-hidden="true"
        />
      ) : null}
    </div>
  )
})
