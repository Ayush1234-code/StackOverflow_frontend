import { Link } from 'react-router-dom'

import { ChevronRight } from 'lucide-react'

export function Breadcrumbs({ items }) {
  if (!items || items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const content = isLast ? (
            <span
              aria-current="page"
              className="font-medium text-slate-700"
            >
              {item.label}
            </span>
          ) : item.to ? (
            <Link
              to={item.to}
              className="font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-slate-500">{item.label}</span>
          )

          return (
            <li key={`${item.to ?? item.label}-${index}`} className="flex items-center gap-1">
              {content}
              {!isLast && (
                <ChevronRight className="size-3.5 text-slate-400" aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
