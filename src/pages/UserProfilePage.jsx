import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Award, CalendarDays, Link as LinkIcon, MapPin, MessageSquare, PenLine, ShieldCheck } from 'lucide-react'

import { previewApi } from '@/api/previewAdapter'
import { Avatar } from '@/components/common/Avatar'
import { Badge } from '@/components/common/Badge'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Card, CardBody } from '@/components/common/Card'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { PreviewNotice } from '@/components/common/PreviewNotice'
import { ProfileSkeleton } from '@/components/common/Skeleton'
import { Button } from '@/components/common/Button'
import { QuestionList } from '@/features/questions/QuestionList'
import { ProfileImpact } from '@/features/users/ProfileImpact'
import { useApiResource } from '@/hooks/useApiResource'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { classNames } from '@/utils/classNames'
import { excerpt, formatDate } from '@/utils/format'

const TABS = [
  { id: 'questions', label: 'Questions' },
  { id: 'answers', label: 'Answers' },
  // Only ever offered on the member's own profile: the impact numbers come
  // from an endpoint the server scopes to the signed-in user.
  { id: 'impact', label: 'Impact', ownProfileOnly: true },
]

function safeExternalUrl(value) {
  const url = String(value ?? '').trim()
  if (/^https?:\/\/\S+$/i.test(url)) return url
  return null
}

function StatTile({ value, label }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
      <p className="text-lg font-bold tabular-nums text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
}

export function UserProfilePage() {
  const { id } = useParams()
  const { user: currentUser } = useAuth()
  const [tab, setTab] = useState('questions')
  useDocumentTitle('User profile')

  const fetchProfile = useCallback(() => previewApi.users.profile(id), [id])
  const { data, error, isLoading } = useApiResource(fetchProfile)

  const user = data?.user ?? null
  const profileQuestions = data?.questions ?? []
  const profileAnswers = data?.answers ?? []
  const acceptedCount = profileAnswers.filter((answer) => answer.isAccepted).length
  const isOwnProfile = currentUser?.id === user?.id

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Users', to: '/users' }, { label: 'Profile' }]} />
        <ProfileSkeleton />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Users', to: '/users' }, { label: 'Profile' }]} />
        <ErrorState title="Could not load this profile" error={error} />
      </div>
    )
  }

  const suggestedTitle = user.name ? `${user.name}'s profile` : 'User profile'

  // The Impact tab describes the viewer, so it is hidden on anybody else's
  // profile rather than rendered empty. `activeTab` falls back to Questions if
  // the route changes to another member while Impact was selected, so the
  // rendered section can never disagree with the highlighted tab.
  const visibleTabs = isOwnProfile ? TABS : TABS.filter((item) => !item.ownProfileOnly)
  const activeTab = tab === 'impact' && !isOwnProfile ? 'questions' : tab

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Users', to: '/users' },
          { label: suggestedTitle, to: `/users/${user.id}` },
        ]}
      />
      <PreviewNotice />

      <Card>
        <CardBody>
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <Avatar name={user.name} src={user.avatar} size="lg" className="size-20 rounded-full text-2xl" />

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {user.name || 'Anonymous'}
                </h1>
                {user.role === 'admin' && (
                  <Badge tone="brand">
                    <ShieldCheck className="size-3.5" aria-hidden="true" />
                    Admin
                  </Badge>
                )}
                {isOwnProfile && <Badge tone="neutral">You</Badge>}
                {isOwnProfile && (
                  <Button to="/profile/edit" variant="secondary" size="sm" className="ml-2">
                    <PenLine className="size-4" aria-hidden="true" />
                    Edit profile
                  </Button>
                )}
              </div>
              {user.username ? (
                <p className="mt-1 text-sm font-medium text-slate-500">@{user.username}</p>
              ) : null}

              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-slate-500 sm:justify-start">
                {user.createdAt && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-4" aria-hidden="true" />
                    Member since {formatDate(user.createdAt)}
                  </span>
                )}
                {user.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4" aria-hidden="true" />
                    {user.location}
                  </span>
                )}
                {safeExternalUrl(user.website) && (
                  <a
                    href={safeExternalUrl(user.website)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 text-slate-500 transition-colors hover:text-brand-700"
                  >
                    <LinkIcon className="size-4" aria-hidden="true" />
                    Website
                  </a>
                )}
              </div>

              {user.bio && (
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{user.bio}</p>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile value={user.reputation ?? '—'} label="Reputation" />
            <StatTile value={profileQuestions.length} label="Questions" />
            <StatTile value={profileAnswers.length} label="Answers" />
            <StatTile value={acceptedCount} label="Accepted" />
          </div>
        </CardBody>
      </Card>

      <div className="flex gap-2" role="tablist" aria-label="Profile sections">
        {visibleTabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={activeTab === item.id}
            onClick={() => setTab(item.id)}
            className={classNames(
              'rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
              activeTab === item.id
                ? 'bg-brand-600 text-white'
                : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {activeTab === 'impact' ? (
        <ProfileImpact />
      ) : activeTab === 'answers' ? (
        profileAnswers.length > 0 ? (
          <div className="space-y-3">
            {profileAnswers.map((answer) => (
              <Card key={answer.id}>
                <CardBody>
                  <p className="text-sm leading-relaxed text-slate-700">
                    {excerpt(answer.body, 220)}
                  </p>
                  {answer.question && (
                    <Link
                      to={`/questions/${answer.question.id}`}
                      className="mt-3 inline-block text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
                    >
                      Answered on: {excerpt(answer.question.title, 80)}
                    </Link>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Award}
            title="No answers yet"
            description={`${user.name || 'This member'} has not answered any questions.`}
          />
        )
      ) : profileQuestions.length > 0 ? (
        <QuestionList questions={profileQuestions} />
      ) : (
        <EmptyState
          icon={MessageSquare}
          title="No questions yet"
          description={`${user.name || 'This member'} has not asked any questions.`}
        />
      )}
    </div>
  )
}
