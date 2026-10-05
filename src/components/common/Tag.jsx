import { Link } from 'react-router-dom'

import { classNames } from '@/utils/classNames'

export function Tag({ label, to, className }) {
  const classes = classNames(
    'inline-flex items-center rounded-md bg-brand-50 px-1.5 py-0.5 text-xs font-medium text-brand-800 transition-colors hover:bg-brand-100 hover:text-brand-900',
    className,
  )

  if (to) {
    return (
      <Link to={to}>
        <span className={classes}>{label}</span>
      </Link>
    )
  }
  return <span className={classes}>{label}</span>
}