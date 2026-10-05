import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { classNames } from '@/utils/classNames'

/**
 * The standard page frame.
 *
 * Replaces the hand-rolled `<div className="space-y-6">` + `<h1 className="text-2xl">`
 * + `max-w-*` wrapper that every page had grown on its own. The important part
 * is the grid: the main column is `minmax(0, 1fr)` so it absorbs every pixel
 * the sidebar and rail don't need, and only the rail has a fixed width.
 */
export function PageShell({
  title,
  description,
  icon: Icon,
  actions,
  breadcrumb,
  filters,
  aside,
  asideWidth = '20rem',
  children,
  className,
  bodyClassName,
}) {
  return (
    <div className={classNames('flex flex-col gap-5', className)}>
      {breadcrumb ? <Breadcrumbs items={breadcrumb} /> : null}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2.5 text-[1.375rem] font-semibold leading-tight tracking-tight text-slate-900 sm:text-2xl">
            {Icon ? <Icon className="size-6 shrink-0 text-slate-400" aria-hidden="true" /> : null}
            <span className="min-w-0 truncate">{title}</span>
          </h1>
          {description ? (
            <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-500">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </header>

      {filters}

      <div
        className={classNames(
          'grid min-w-0 items-start gap-6',
          aside
            ? 'grid-cols-1 xl:grid-cols-[minmax(0,1fr)_var(--rail)] 2xl:gap-8'
            : 'grid-cols-1',
        )}
        style={aside ? { '--rail': asideWidth } : undefined}
      >
        <div className={classNames('min-w-0', bodyClassName)}>{children}</div>
        {aside ? (
          <aside className="flex min-w-0 flex-col gap-4">{aside}</aside>
        ) : null}
      </div>
    </div>
  )
}
