import { classNames } from '@/utils/classNames'

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={classNames(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center',
        className,
      )}
    >
      <div className="grid size-12 place-items-center rounded-full bg-slate-100 text-slate-400">
        <Icon className="size-6" strokeWidth={1.8} aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}