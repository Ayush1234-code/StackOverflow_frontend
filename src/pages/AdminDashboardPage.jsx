import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  BookOpen,
  Flag,
  LayoutDashboard,
  MessageSquare,
  ShieldAlert,
  ThumbsUp,
  TrendingUp,
  Users,
} from 'lucide-react'

import { previewApi } from '@/api/previewAdapter'
import { Avatar } from '@/components/common/Avatar'
import { Badge } from '@/components/common/Badge'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/common/Card'
import { ActivityChart, RankedBars } from '@/components/common/Charts'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { AdminDashboardSkeleton } from '@/components/common/Skeleton'
import { StatGrid, StatTile } from '@/components/common/StatTile'
import { Tabs } from '@/components/common/Tabs'
import { TagBadge } from '@/features/tags/TagBadge'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { pluralize } from '@/utils/format'

/**
 * Admin dashboard.
 *
 * Every figure on this page comes from `GET /api/admin/analytics`, which is
 * aggregated in MongoDB at request time. Nothing here is derived from a local
 * list of loaded records, and there is no fallback data: an empty database
 * renders honest zeroes and empty states.
 *
 * Access is decided by the backend (`requireAdmin` re-reads `role` from the
 * database on every request). This page is only rendered for admins to save a
 * pointless round trip — hiding it is a usability measure, not the control.
 */

const WINDOWS = [
  { id: 7, label: '7 days' },
  { id: 30, label: '30 days' },
  { id: 90, label: '90 days' },
]

export function AdminDashboardPage() {
  useDocumentTitle('Admin dashboard')
  const [days, setDays] = useState(30)
  const [tab, setTab] = useState('activity')

  const fetchData = useCallback(() => previewApi.moderation.analytics({ days }), [days])
  const { data, error, isLoading, reload } = useApiResource(fetchData)

  if (isLoading) return <AdminDashboardSkeleton />
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeading />
        <ErrorState error={error} onRetry={reload} />
      </div>
    )
  }
  if (!data) return <EmptyState icon={LayoutDashboard} title="No analytics available" />

  const { totals, engagement, moderation, quality, votes, activity, topTags, topContributors, mostActiveUsers } = data

  return (
    <div className="space-y-6">
      <PageHeading days={days} onDaysChange={setDays} />

      <StatGrid>
        <StatTile icon={Users} label="Members" value={totals.users} hint={`${totals.newUsers} in the last 30 days`} />
        <StatTile icon={MessageSquare} label="Questions" value={totals.questions} hint={`${quality.unansweredQuestions} unanswered`} tone="brand" />
        <StatTile icon={BookOpen} label="Answers" value={totals.answers} hint={`${quality.acceptedAnswers} accepted`} tone="success" />
        <StatTile icon={Activity} label="Comments" value={totals.comments} hint={`${totals.votes} votes cast`} />
        <StatTile icon={Flag} label="Open reports" value={moderation.openReports} hint={`${moderation.removals} content removals`} tone={moderation.openReports > 0 ? 'warning' : 'neutral'} />
        <StatTile icon={ShieldAlert} label="Suspended" value={moderation.suspendedUsers} hint={`${moderation.admins} administrator${moderation.admins === 1 ? '' : 's'}`} tone={moderation.suspendedUsers > 0 ? 'danger' : 'neutral'} />
        <StatTile icon={TrendingUp} label="Active (30d)" value={engagement.activeUsers30} hint={`${engagement.participationRate}% of members took part`} tone="brand" />
        <StatTile icon={ThumbsUp} label="Upvotes" value={votes.upvotes} hint={`${votes.downvotes} downvotes`} tone="success" />
      </StatGrid>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'activity', label: 'Activity', icon: BarChart3 },
          { id: 'community', label: 'Community', icon: Users },
          { id: 'moderation', label: 'Moderation', icon: ShieldAlert },
        ]}
      >
        <div className="pt-6">
          {tab === 'activity' ? (
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Questions, answers and signups</CardTitle>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Daily counts over the last {days} days. Days without activity are shown as zero rather than omitted.
                  </p>
                </CardHeader>
                <CardBody>
                  <ActivityChart
                    series={activity}
                    keys={['questions', 'answers', 'users']}
                    emptyLabel="No questions, answers or signups in this period"
                  />
                </CardBody>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Popular tags</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <RankedBars items={topTags} emptyLabel="No tags in use yet" />
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Answer health</CardTitle>
                  </CardHeader>
                  <CardBody className="space-y-3">
                    <RatioRow label="Questions answered" value={quality.answerRate} detail={`${quality.answeredQuestions} of ${totals.questions}`} />
                    <RatioRow label="Answers accepted" value={quality.acceptanceRate} detail={`${quality.acceptedAnswers} of ${totals.answers}`} />
                    <RatioRow label="Member participation" value={engagement.participationRate} detail={`${engagement.activeUsers30} active in 30 days`} />
                    <p className="border-t border-slate-100 pt-3 text-xs text-slate-500">
                      {pluralize(totals.totalViews, 'view')} across all questions, {pluralize(totals.bookmarks, 'bookmark')}.
                    </p>
                  </CardBody>
                </Card>
              </div>
            </div>
          ) : null}

          {tab === 'community' ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top contributors</CardTitle>
                  <p className="mt-0.5 text-xs text-slate-500">Ranked by score earned on their own questions.</p>
                </CardHeader>
                <CardBody>
                  {topContributors.length > 0 ? (
                    <ul className="divide-y divide-slate-100">
                      {topContributors.map((row) => (
                        <li key={row.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                          <Avatar name={row.name} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900">{row.name}</p>
                            <p className="text-xs text-slate-500">
                              {pluralize(row.questions, 'question')} · score {row.score}
                            </p>
                          </div>
                          <span className="text-sm font-medium tabular-nums text-slate-600">{row.reputation}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyState icon={Users} title="No contributors yet" />
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Most active members</CardTitle>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Total actions taken: questions, answers, comments and votes combined.
                  </p>
                </CardHeader>
                <CardBody>
                  <RankedBars items={mostActiveUsers} valueKey="actions" emptyLabel="No activity recorded yet" />
                </CardBody>
              </Card>
            </div>
          ) : null}

          {tab === 'moderation' ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Report outcomes</CardTitle>
                </CardHeader>
                <CardBody className="space-y-4">
                  <OutcomeRow label="Open" value={moderation.openReports} tone="warning" />
                  <OutcomeRow label="Resolved" value={moderation.resolvedReports} tone="success" />
                  <OutcomeRow label="Dismissed" value={moderation.dismissedReports} tone="neutral" />
                  <OutcomeRow label="Content removed" value={moderation.removals} tone="danger" />
                  <p className="border-t border-slate-100 pt-3 text-xs text-slate-500">
                    {pluralize(totals.reports, 'report')} filed in total. “Content removed” counts reports where the
                    moderator actually deleted something, not every decision.
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Moderation tools</CardTitle>
                </CardHeader>
                <CardBody className="space-y-3">
                  <p className="text-sm text-slate-600">
                    Review the queue, decide on each report and moderate member accounts.
                  </p>
                  <Link
                    to="/admin/moderation"
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                  >
                    <ShieldAlert className="size-4" aria-hidden="true" />
                    Open moderation
                  </Link>
                </CardBody>
              </Card>
            </div>
          ) : null}
        </div>
      </Tabs>
    </div>
  )
}

function PageHeading({ days, onDaysChange }) {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Admin', to: '/admin' },
          { label: 'Dashboard', to: '/admin' },
        ]}
      />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
            <LayoutDashboard className="size-6 text-brand-600" aria-hidden="true" />
            Admin dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Community metrics aggregated live from the database.
          </p>
        </div>

        {onDaysChange ? (
          <div className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white p-1">
            {WINDOWS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onDaysChange(option.id)}
                aria-pressed={days === option.id}
                className={
                  days === option.id
                    ? 'rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors'
                    : 'rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50'
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </>
  )
}

function RatioRow({ label, value, detail }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm font-semibold tabular-nums text-slate-900">{clamped}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-500 transition-[width] duration-500"
          style={{ width: `${Math.max(clamped, clamped > 0 ? 2 : 0)}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  )
}

function OutcomeRow({ label, value, tone }) {
  const tones = {
    neutral: 'text-slate-900',
    success: 'text-emerald-700',
    warning: 'text-amber-700',
    danger: 'text-red-700',
  }
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
        {label}
        {tone === 'warning' && value > 0 ? <Badge tone="warning">Needs attention</Badge> : null}
      </span>
      <span className={`text-lg font-semibold tabular-nums ${tones[tone]}`}>{value ?? 0}</span>
    </div>
  )
}

/** Kept for the sidebar/rail, which renders tag counts next to each tag. */
export function AdminTagList({ tags = [] }) {
  if (!tags.length) return null
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span key={tag.name} className="inline-flex items-center gap-2">
          <TagBadge name={tag.name} />
          <span className="text-xs text-slate-400">{tag.count}</span>
        </span>
      ))}
    </div>
  )
}
