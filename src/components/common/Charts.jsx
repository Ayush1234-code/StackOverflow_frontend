import { useState } from 'react'

import { classNames } from '@/utils/classNames'

/**
 * Lightweight, dependency-free SVG chart for activity series.
 *
 * Why not a charting library: the only thing these pages need is a readable
 * trend line, and shipping a charting package for that would add a large
 * dependency to the bundle. This renders directly from the dense series the
 * backend returns.
 *
 * Two honesty rules are enforced here:
 *   - The y-axis always starts at zero, so a flat series cannot be made to look
 *     dramatic by an auto-scaled axis.
 *   - An all-zero series draws a flat line at the baseline rather than dividing
 *     by zero to produce `NaN` geometry that would blank the chart.
 */

const SERIES_COLORS = {
  questions: { stroke: '#2563eb', fill: 'rgba(37, 99, 235, 0.10)' },
  answers: { stroke: '#059669', fill: 'rgba(5, 150, 105, 0.10)' },
  comments: { stroke: '#7c3aed', fill: 'rgba(124, 58, 237, 0.10)' },
  users: { stroke: '#d97706', fill: 'rgba(217, 119, 6, 0.10)' },
  votes: { stroke: '#db2777', fill: 'rgba(219, 39, 119, 0.10)' },
  delta: { stroke: '#2563eb', fill: 'rgba(37, 99, 235, 0.10)' },
}

const LABELS = {
  questions: 'Questions',
  answers: 'Answers',
  comments: 'Comments',
  users: 'Signups',
  votes: 'Votes',
  delta: 'Reputation',
}

/** Rounds an axis maximum up to a readable step (1/2/5 × 10ⁿ). */
function niceMax(value) {
  if (value <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalized = value / magnitude
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return step * magnitude
}

export function ActivityChart({
  series = [],
  keys = ['questions', 'answers'],
  height = 200,
  title,
  emptyLabel = 'No activity in this period',
  className,
}) {
  const [hidden, setHidden] = useState(() => new Set())

  const rows = series ?? []
  const visibleKeys = keys.filter((key) => !hidden.has(key))

  // Computed inline rather than memoized. A series is at most a few hundred
  // rows of trivial arithmetic, so caching it would trade a real correctness
  // hazard (a stale chart when the caller passes a fresh array of equal contents)
  // for no measurable gain.
  const chart = (() => {
    if (rows.length === 0) {
      return { paths: [], max: 1, totalFor: () => 0 }
    }

    const width = 100
    const stepX = rows.length > 1 ? width / (rows.length - 1) : width
    const ceiling = niceMax(Math.max(...rows.flatMap((row) => keys.map((key) => Number(row[key]) || 0))))

    const build = (key) => {
      const points = rows.map((row, index) => {
        const value = Number(row[key]) || 0
        // `ceiling` is never 0, so this cannot divide by zero.
        const x = index * stepX
        const y = height - (value / ceiling) * (height - 16) - 8
        return { x, y, value }
      })

      const line = points
        .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
        .join(' ')
      const baseline = height
      const area = `${line} L${points[points.length - 1].x.toFixed(2)} ${baseline} L${points[0].x.toFixed(2)} ${baseline} Z`

      return { line, area, points }
    }

    const built = visibleKeys.map((key) => ({ key, ...build(key) }))
    const totals = Object.fromEntries(
      keys.map((key) => [key, rows.reduce((sum, row) => sum + (Number(row[key]) || 0), 0)]),
    )

    return { paths: built, max: ceiling, totalFor: (key) => totals[key] ?? 0 }
  })()

  const { paths, max, totalFor } = chart

  const hasAnyValue = rows.some((row) => keys.some((key) => Number(row[key])))

  function toggle(key) {
    setHidden((previous) => {
      const next = new Set(previous)
      if (next.has(key)) next.delete(key)
      // Never leave every series hidden — an empty chart looks broken.
      else if (next.size < keys.length - 1) next.add(key)
      return next
    })
  }

  if (rows.length === 0) {
    return (
      <div className={classNames('grid place-items-center rounded-lg border border-dashed border-slate-300 py-12 text-sm text-slate-500', className)}>
        {emptyLabel}
      </div>
    )
  }

  return (
    <figure className={classNames('space-y-3', className)}>
      {title ? <figcaption className="text-sm font-semibold text-slate-900">{title}</figcaption> : null}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {keys.map((key) => {
          const isHidden = hidden.has(key)
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              aria-pressed={!isHidden}
              className={classNames(
                'inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs font-medium transition-colors',
                isHidden ? 'text-slate-400 line-through' : 'text-slate-700',
              )}
            >
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full"
                style={{ backgroundColor: isHidden ? '#cbd5e1' : SERIES_COLORS[key]?.stroke ?? '#64748b' }}
              />
              {LABELS[key] ?? key}
              <span className="tabular-nums text-slate-400">{totalFor(key)}</span>
            </button>
          )
        })}
        <span className="ml-auto text-xs text-slate-400">peak {max}</span>
      </div>

      {hasAnyValue ? (
        <svg
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          className="h-48 w-full overflow-visible"
          role="img"
          aria-label={`${keys.map((key) => LABELS[key] ?? key).join(' and ')} over the last ${rows.length} days`}
        >
          {[0, 0.5, 1].map((ratio) => (
            <line
              key={ratio}
              x1="0"
              x2="100"
              y1={height - ratio * (height - 16) - 8}
              y2={height - ratio * (height - 16) - 8}
              stroke="#e2e8f0"
              strokeWidth="0.4"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {paths.map(({ key, area }) => (
            <path key={`area-${key}`} d={area} fill={SERIES_COLORS[key]?.fill ?? 'transparent'} />
          ))}

          {paths.map(({ key, line, points }) => (
            <g key={`line-${key}`}>
              <path
                d={line}
                fill="none"
                stroke={SERIES_COLORS[key]?.stroke ?? '#64748b'}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              {points.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="1.1"
                  fill={SERIES_COLORS[key]?.stroke ?? '#64748b'}
                  vectorEffect="non-scaling-stroke"
                >
                  <title>{`${rows[index]?.date ?? ''}: ${point.value}`}</title>
                </circle>
              ))}
            </g>
          ))}
        </svg>
      ) : (
        <div className="grid h-48 place-items-center rounded-lg border border-dashed border-slate-300 text-sm text-slate-500">
          {emptyLabel}
        </div>
      )}

      <div className="flex justify-between text-[11px] text-slate-400">
        <span>{rows[0]?.date}</span>
        <span>{rows[rows.length - 1]?.date}</span>
      </div>
    </figure>
  )
}

/**
 * Horizontal ranked bars for tag/contributor lists.
 *
 * The bar length is a share of the largest value in the set, not of an invented
 * maximum, so the leading entry is always full width and the ordering is the
 * only thing the encoding adds.
 */
export function RankedBars({ items = [], valueKey = 'count', labelKey = 'name', className, emptyLabel = 'Nothing to show yet' }) {
  const rows = Array.isArray(items) ? items : []
  const max = Math.max(...rows.map((row) => Number(row[valueKey]) || 0), 0)

  if (rows.length === 0 || max === 0) {
    return (
      <p className={classNames('rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500', className)}>
        {emptyLabel}
      </p>
    )
  }

  return (
    <ul className={classNames('space-y-2.5', className)}>
      {rows.map((row, index) => {
        const value = Number(row[valueKey]) || 0
        const share = max === 0 ? 0 : Math.round((value / max) * 100)
        return (
          <li key={row.id ?? row[labelKey] ?? index} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1">
            <span className="truncate text-sm font-medium text-slate-700">{row[labelKey]}</span>
            <span className="text-sm tabular-nums text-slate-500">{value}</span>
            <span className="col-span-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <span
                className="block h-full rounded-full bg-brand-500 transition-[width] duration-500"
                style={{ width: `${Math.max(share, 2)}%` }}
              />
            </span>
          </li>
        )
      })}
    </ul>
  )
}
