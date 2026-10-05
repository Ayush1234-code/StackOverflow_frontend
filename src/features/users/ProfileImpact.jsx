import { useCallback, useState } from 'react'
import { Award, TrendingDown, TrendingUp } from 'lucide-react'

import { previewApi } from '@/api/previewAdapter'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/common/Card'
import { ActivityChart, RankedBars } from '@/components/common/Charts'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Select } from '@/components/common/Select'
import { Skeleton } from '@/components/common/Skeleton'
import { StatGrid, StatTile } from '@/components/common/StatTile'
import { TagBadge } from '@/features/tags/TagBadge'
import { useApiResource } from '@/hooks/useApiResource'
import { classNames } from '@/utils/classNames'
import { compactNumber, pluralize, timeAgo } from '@/utils/format'

/** The windows the API accepts, mirroring the server's own bounds. */
const WINDOWS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
]

/**
 * Ledger reasons are stable server-side keys. Anything unrecognised is
 * humanised rather than hidden, so a new reason shows up honestly instead of
 * rendering as an empty row.
 */
const REASON_LABELS = {
  question_upvoted: 'Question upvoted',
  question_downvoted: 'Question downvoted',
  answer_upvoted: 'Answer upvoted',
  answer_downvoted: 'Answer downvoted',
  answer_accepted: 'Answer accepted',
  answer_unaccepted: 'Answer unaccepted',
}

function reasonLabel(reason) {
  if (!reason) return 'Reputation change'
  return REASON_LABELS[reason] ?? reason.replace(/_/g, ' ').replace(/^./, (letter) => letter.toUpperCase())
}

const TIER_STYLES = {
  gold: 'bg-amber-50 text-amber-700 border-amber-200',
  silver: 'bg-slate-100 text-slate-600 border-slate-200',
  bronze: 'bg-orange-50 text-orange-700 border-orange-200',
}

/**
 * A member's own contribution record.
 *
 * Every figure comes from `GET /api/analytics/me`, which the server scopes to
 * the signed-in user — there is no client-sent user id, so this panel can only
 * ever describe the person looking at it. The caller is responsible for
 * rendering it on the member's own profile only.
 */
export function ProfileImpact() {
  const [days, setDays] = useState('30')

  const fetchAnalytics = useCallback(() => previewApi.analytics.me({ days }), [days])
  const fetchBadges = useCallback(() => previewApi.analytics.myBadgeProgress(), [])

  const analytics = useApiResource(fetchAnalytics)
  const badges = useApiResource(fetchBadges)

  if (analytics.isLoading) {
    return (
      <div className="space-y-4" aria-label="Loading your impact">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (analytics.error) {
    return <ErrorState title="Could not load your impact" error={analytics.error} onRetry={analytics.reload} />
  }

  const totals = analytics.data?.totals ?? {}
  const votes = analytics.data?.votes ?? {}
  const rates = analytics.data?.rates ?? {}
  const reputation = analytics.data?.reputation ?? {}
  const topTags = analytics.data?.topTags ?? []

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Your impact</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Read live from the database across the last {pluralize(Number(days), 'day')}.
          </p>
        </div>
        <div className="min-w-44">
          <label htmlFor="impact-window" className="sr-only">
            Reporting window
          </label>
          <Select id="impact-window" value={days} onChange={(event) => setDays(event.target.value)}>
            {WINDOWS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <StatGrid>
        <StatTile
          value={compactNumber(totals.questions ?? 0)}
          label="Questions asked"
          hint={`${rates.answerRate ?? 0}% of them got an answer`}
        />
        <StatTile
          value={compactNumber(totals.answers ?? 0)}
          label="Answers posted"
          hint={`${rates.acceptanceRate ?? 0}% were accepted`}
        />
        <StatTile value={compactNumber(totals.comments ?? 0)} label="Comments written" />
        <StatTile value={compactNumber(totals.bookmarks ?? 0)} label="Bookmarks saved" />
        <StatTile
          value={compactNumber(totals.votesReceived ?? 0)}
          label="Votes received"
          hint={`${pluralize(votes.up ?? 0, 'upvote')} on questions`}
        />
        <StatTile
          value={compactNumber(totals.viewsReceived ?? 0)}
          label="Views received"
          hint={`Best question ${votes.bestQuestionScore ?? 0} votes`}
        />
      </StatGrid>

      <Card>
        <CardHeader>
          <CardTitle>Your activity</CardTitle>
        </CardHeader>
        <CardBody>
          <ActivityChart
            title="Contributions per day"
            series={analytics.data?.activity?.series ?? []}
            keys={['questions', 'answers', 'comments', 'votes']}
            height={220}
          />
        </CardBody>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reputation</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex flex-wrap items-baseline gap-3">
              <p className="text-3xl font-bold tabular-nums text-slate-900">{reputation.current ?? 0}</p>
              <p
                className={classNames(
                  'inline-flex items-center gap-1 text-sm font-medium tabular',
                  (reputation.netGained ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600',
                )}
              >
                {(reputation.netGained ?? 0) >= 0 ? (
                  <TrendingUp className="size-4" aria-hidden="true" />
                ) : (
                  <TrendingDown className="size-4" aria-hidden="true" />
                )}
                {reputation.netGained ?? 0} in the ledger
              </p>
            </div>

            <ActivityChart
              title="Reputation per day"
              series={analytics.data?.reputationSeries ?? []}
              keys={['delta']}
              height={140}
              emptyLabel="No reputation movement in this period"
            />

            <div>
              <h3 className="text-[13px] font-semibold tracking-tight text-slate-900">Recent changes</h3>
              {reputation.recent?.length ? (
                <ul className="mt-2 divide-y divide-slate-100">
                  {reputation.recent.map((entry) => (
                    <li key={entry.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <span className="min-w-0">
                        <span className="block truncate text-slate-800">{reasonLabel(entry.reason)}</span>
                        <span className="text-xs text-slate-400">{timeAgo(entry.createdAt)}</span>
                      </span>
                      <span
                        className={classNames(
                          'shrink-0 font-semibold tabular',
                          entry.delta >= 0 ? 'text-emerald-600' : 'text-rose-600',
                        )}
                      >
                        {entry.delta > 0 ? '+' : ''}
                        {entry.delta}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-500">No recorded reputation changes yet.</p>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <CardBody>
            {badges.isLoading ? (
              <div className="space-y-2" aria-label="Loading badges">
                {[0, 1, 2].map((index) => (
                  <Skeleton key={index} className="h-14 w-full" />
                ))}
              </div>
            ) : badges.error ? (
              <ErrorState error={badges.error} onRetry={badges.reload} />
            ) : (
              <BadgeWall badges={badges.data?.badges ?? []} />
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your most used tags</CardTitle>
        </CardHeader>
        <CardBody>
          {topTags.length > 0 ? (
            <div className="space-y-4">
              <RankedBars items={topTags} valueKey="count" labelKey="name" />
              <div className="flex flex-wrap gap-1.5">
                {topTags.map((tag) => (
                  <TagBadge key={tag.name} name={tag.name} />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No tagged posts yet.</p>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

/**
 * Every badge in the catalogue, earned or not. The unearned ones carry their
 * criteria, which is what makes the wall something to act on rather than a
 * row of greyed-out icons.
 */
function BadgeWall({ badges }) {
  const earned = badges.filter((badge) => badge.earned)
  const inProgress = badges.filter((badge) => !badge.earned && badge.nextGoal)

  if (badges.length === 0) {
    return <EmptyState icon={Award} title="No badges defined" description="The badge catalogue is empty." />
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900 tabular">{earned.length}</span> of{' '}
          {pluralize(badges.length, 'badge')} earned
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {earned.map((badge) => (
            <span
              key={badge.key}
              className={classNames(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                TIER_STYLES[badge.tier] ?? TIER_STYLES.silver,
              )}
            >
              <Award className="size-3.5" aria-hidden="true" />
              {badge.name}
            </span>
          ))}
        </div>
      </div>

      {inProgress.length > 0 ? (
        <div>
          <h3 className="text-[13px] font-semibold tracking-tight text-slate-900">Closest to earning</h3>
          <ul className="mt-2 space-y-2.5">
            {inProgress.slice(0, 5).map((badge) => {
              const goal = badge.nextGoal
              const ratio = goal.threshold > 0 ? Math.min(goal.current / goal.threshold, 1) : 0

              return (
                <li key={badge.key}>
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="font-medium text-slate-700">{badge.name}</span>
                    <span className="text-slate-500 tabular">
                      {goal.current} / {goal.threshold} {goal.key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                  </div>
                  <div
                    className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100"
                    role="progressbar"
                    aria-valuenow={goal.current}
                    aria-valuemin={0}
                    aria-valuemax={goal.threshold}
                    aria-label={badge.name}
                  >
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${ratio * 100}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}