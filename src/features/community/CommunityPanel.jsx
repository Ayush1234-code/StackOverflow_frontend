import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Activity, MessageSquare, CheckCircle2, Eye, Tags as TagsIcon, Users } from 'lucide-react'

import { statsApi } from '@/api'
import { Panel, PanelRow } from '@/components/common/Panel'
import { Reputation } from '@/components/common/Reputation'
import { Skeleton } from '@/components/common/Skeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { classNames } from '@/utils/classNames'

import { compactNumber } from '@/utils/format'

function RailSkeleton() {
  return (
    <div className="space-y-4">
      <Panel title="Community">
        <div className="space-y-2.5">
          {[0, 1, 2, 3, 4].map((index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
      </Panel>
      <Panel title="Top tags">
        <div className="space-y-2.5">
          {[0, 1, 2, 3, 4].map((index) => (
            <Skeleton key={index} className="h-6 w-full rounded" />
          ))}
        </div>
      </Panel>
    </div>
  )
}

/**
 * Right-rail community panel. Every figure comes from GET /api/stats, which
 * aggregates MongoDB directly — nothing here is a hardcoded placeholder.
 */
export function CommunityPanel({ className }) {
  const fetchStats = useCallback(() => statsApi.get(), [])
  const { data, error, isLoading } = useApiResource(fetchStats)

  if (isLoading) return <RailSkeleton />

  if (error) {
    return (
      <Panel title="Community" className={className}>
        <p className="text-[13px] leading-relaxed text-slate-500">
          Community statistics are unavailable right now.
        </p>
      </Panel>
    )
  }

  const counts = data?.counts ?? {}
  const questions = data?.questions ?? {}
  const topTags = data?.topTags ?? []
  const topUsers = data?.topUsers ?? []

  return (
    <div className={classNames('flex flex-col gap-4', className)}>
      <Panel title="Community" bodyClassName="p-2">
        <div className="grid grid-cols-2 gap-1">
          <RailStat icon={MessageSquare} label="Questions" value={compactNumber(counts.questions)} />
          <RailStat icon={CheckCircle2} label="Answers" value={compactNumber(counts.answers)} />
          <RailStat icon={Users} label="Members" value={compactNumber(counts.users)} />
          <RailStat icon={TagsIcon} label="Tags" value={compactNumber(counts.tags)} />
        </div>

        <div className="mt-2 space-y-0.5 border-t border-slate-200/80 pt-2">
          <PanelRow label="Answered" value={`${questions.answerRate ?? 0}%`} icon={Activity} />
          <PanelRow label="Unanswered" value={compactNumber(questions.unanswered)} />
          <PanelRow label="Total views" value={compactNumber(questions.totalViews)} icon={Eye} />
        </div>
      </Panel>

      {topTags.length > 0 ? (
        <Panel title="Popular tags" bodyClassName="pt-3.5">
          <ul className="-mt-0.5 space-y-0.5">
            {topTags.slice(0, 6).map((tag) => (
              <li key={tag.name}>
                <Link
                  to={`/questions?tag=${encodeURIComponent(tag.name)}`}
                  className="group flex items-center justify-between gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-slate-50"
                >
                  <span className="min-w-0 truncate rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-medium text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-700">
                    {tag.name}
                  </span>
                  <span className="shrink-0 text-xs text-slate-400 tabular">{tag.count}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/tags"
            className="mt-2 block rounded-md px-2 py-1.5 text-[13px] font-medium text-brand-700 transition-colors hover:bg-brand-50"
          >
            Browse all tags
          </Link>
        </Panel>
      ) : null}

      {topUsers.length > 0 ? (
        <Panel title="Top contributors" bodyClassName="pt-3.5">
          <ul className="space-y-2.5">
            {topUsers.slice(0, 4).map((entry) => (
              <li key={entry.user.id} className="flex items-center gap-2.5">
                <span className="w-4 shrink-0 text-center text-xs font-semibold text-slate-300 tabular">
                  {entry.answerCount}
                </span>
                <Link
                  to={`/users/${entry.user.id}`}
                  className="min-w-0 flex-1 truncate text-[13px] font-medium text-slate-700 transition-colors hover:text-brand-700"
                >
                  {entry.user.name}
                </Link>
                <Reputation value={entry.user.reputation} className="text-[11px]" />
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </div>
  )
}

function RailStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-md px-2 py-1.5">
      <div className="flex items-center gap-1.5">
        <Icon className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
        <span className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </span>
      </div>
      <p className="mt-1 text-lg font-semibold leading-none tracking-tight text-slate-900 tabular">
        {value}
      </p>
    </div>
  )
}

/**
 * Shown on the home page under the latest questions. Reuses the same endpoint
 * as the rail so the two can never disagree.
 */
export function CommunityHighlights({ className }) {
  const fetchStats = useCallback(() => statsApi.get(), [])
  const { data, isLoading } = useApiResource(fetchStats)
  const counts = data?.counts ?? {}
  const questions = data?.questions ?? {}

  if (isLoading) {
    return (
      <Panel className={className}>
        <Skeleton className="h-4 w-32" />
      </Panel>
    )
  }

  return (
    <Panel title="At a glance" className={className}>
      <p className="text-[13px] leading-relaxed text-slate-500">
        {counts.questions ?? 0} questions asked by {counts.users ?? 0} members, answered with{' '}
        {counts.answers ?? 0} replies across {counts.tags ?? 0} tags.
      </p>
      <p className="mt-2.5 text-[13px] leading-relaxed text-slate-500">
        {questions.accepted ?? 0} questions have an accepted answer
        {typeof questions.answerRate === 'number' ? ` (${questions.answerRate}% of all questions)` : ''}.
      </p>
    </Panel>
  )
}
