import { ArrowDown, ArrowUp } from 'lucide-react'

import { classNames } from '@/utils/classNames'

const iconClasses = 'size-[18px]'

export function VoteControls({
  count,
  userVote = 0,
  onVote,
  busy = false,
  orientation = 'vertical',
  size = 'md',
  className,
  ariaLabel,
}) {
  const vote = Math.max(-1, Math.min(1, Number(userVote) || 0))

  function handleVote(value) {
    if (busy || typeof onVote !== 'function') return
    onVote(value)
  }

  const buttonClasses = (active, activeColor) =>
    classNames(
      'grid place-items-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-50',
      size === 'lg' ? 'size-9' : 'size-8',
      active
        ? `bg-brand-50 ${activeColor}`
        : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700',
    )

  const countClasses = classNames(
    'font-bold tabular-nums',
    size === 'lg' ? 'text-lg' : 'text-base',
    vote > 0 ? 'text-emerald-700' : vote < 0 ? 'text-red-600' : 'text-slate-900',
  )

  const upButton = (
    <button
      type="button"
      onClick={() => handleVote(vote === 1 ? 0 : 1)}
      disabled={busy}
      className={buttonClasses(vote === 1, 'text-emerald-600')}
      aria-label={`${ariaLabel ?? 'Upvote'}${vote === 1 ? ' (remove vote)' : ''}`}
      aria-pressed={vote === 1}
      title="This content is useful"
    >
      <ArrowUp className={iconClasses} aria-hidden="true" />
    </button>
  )

  const downButton = (
    <button
      type="button"
      onClick={() => handleVote(vote === -1 ? 0 : -1)}
      disabled={busy}
      className={buttonClasses(vote === -1, 'text-red-600')}
      aria-label={`${ariaLabel ?? 'Downvote'}${vote === -1 ? ' (remove vote)' : ''}`}
      aria-pressed={vote === -1}
      title="This content is not useful"
    >
      <ArrowDown className={iconClasses} aria-hidden="true" />
    </button>
  )

  if (orientation === 'horizontal') {
    return (
      <div className={classNames('flex items-center gap-1', className)}>
        {upButton}
        <span className={classNames(countClasses, 'px-1')}>{count}</span>
        {downButton}
      </div>
    )
  }

  return (
    <div className={classNames('flex flex-col items-center gap-0.5', className)}>
      {upButton}
      <span className={countClasses}>{count}</span>
      {downButton}
    </div>
  )
}