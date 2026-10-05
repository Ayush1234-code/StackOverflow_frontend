import { classNames } from '@/utils/classNames'

/**
 * Bordered block used in the right rail and sidebar. A deliberately small set
 * of surface primitives keeps the whole product visually consistent.
 */
export function Panel({ title, action, description, children, className, bodyClassName, as: Tag = 'section' }) {
  return (
    <Tag className={classNames('overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card', className)}>
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 px-4 py-2.5">
          <h2 className="text-[13px] font-semibold tracking-tight text-slate-900">{title}</h2>
          {action}
        </div>
      ) : null}
      {description ? <p className="px-4 pt-3 text-xs leading-relaxed text-slate-500">{description}</p> : null}
      <div className={classNames('p-4', title ? 'pt-3.5' : null, bodyClassName)}>{children}</div>
    </Tag>
  )
}

/** Row used inside panels: a label on the left, a value on the right. */
export function PanelRow({ label, value, icon: Icon, to, active = false }) {
  const content = (
    <>
      <span className="flex min-w-0 items-center gap-2">
        {Icon ? <Icon className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" /> : null}
        <span className="truncate">{label}</span>
      </span>
      <span className="shrink-0 font-semibold text-slate-900 tabular">{value}</span>
    </>
  )

  const classes = classNames(
    'flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-[13px] transition-colors',
    active ? 'bg-brand-50 font-medium text-brand-800' : 'text-slate-600 hover:bg-slate-50',
  )

  return to ? (
    <a href={to} className={classes}>
      {content}
    </a>
  ) : (
    <div className={classes}>{content}</div>
  )
}
