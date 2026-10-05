import { classNames } from '@/utils/classNames'

export function Card({ className, children, ...props }) {
  return (
    <div
      className={classNames(
        'rounded-xl border border-slate-200 bg-white shadow-card',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children }) {
  return (
    <div className={classNames('border-b border-slate-200 px-5 py-4', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children }) {
  return (
    <h2 className={classNames('text-base font-semibold text-slate-900', className)}>
      {children}
    </h2>
  )
}

export function CardBody({ className, children }) {
  return <div className={classNames('p-5', className)}>{children}</div>
}

export function CardFooter({ className, children }) {
  return (
    <div className={classNames('border-t border-slate-200 bg-slate-50/60 p-4', className)}>
      {children}
    </div>
  )
}