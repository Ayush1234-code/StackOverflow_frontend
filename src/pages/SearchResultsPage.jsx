import { useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MessageSquare, RotateCcw, SearchX, Users } from 'lucide-react'

import { previewApi } from '@/api/previewAdapter'
import { Avatar } from '@/components/common/Avatar'
import { Badge } from '@/components/common/Badge'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Field } from '@/components/common/Field'
import { Input } from '@/components/common/Input'
import { Pagination } from '@/components/common/Pagination'
import { PreviewNotice } from '@/components/common/PreviewNotice'
import { Select } from '@/components/common/Select'
import { QuestionListSkeleton, Skeleton } from '@/components/common/Skeleton'
import { SortTabs } from '@/components/common/SortTabs'
import { QuestionList } from '@/features/questions/QuestionList'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { classNames } from '@/utils/classNames'
import { excerpt, pluralize, timeAgo } from '@/utils/format'

const PAGE_SIZE = 10

const SCOPES = [
  { value: 'questions', label: 'Questions' },
  { value: 'answers', label: 'Answers' },
  { value: 'users', label: 'Users' },
]

/**
 * Sort options differ per scope, because "unanswered" is a question concept and
 * "relevance" means something different for users (reputation) than for posts.
 */
const SORTS = {
  questions: [
    { value: 'relevance', label: 'Relevance' },
    { value: 'newest', label: 'Newest' },
    { value: 'active', label: 'Active' },
    { value: 'votes', label: 'Votes' },
    { value: 'answers', label: 'Answers' },
    { value: 'unanswered', label: 'Unanswered' },
    { value: 'answered', label: 'Answered' },
  ],
  answers: [{ value: 'newest', label: 'Newest' }],
  users: [{ value: 'relevance', label: 'Reputation' }],
}

/** Short label shown on a filter chip. */
const FILTER_LABELS = { tag: 'Tag', user: 'Asked by', sort: 'Sort' }

export function SearchResultsPage() {
  const [params, setParams] = useSearchParams()

  const q = params.get('q')?.trim() || ''
  const scope = SCOPES.some((option) => option.value === params.get('scope'))
    ? params.get('scope')
    : 'questions'
  const tag = params.get('tag')?.trim().toLowerCase() || ''
  const user = params.get('user')?.trim() || ''

  const sortOptions = SORTS[scope]
  const sort = sortOptions.some((option) => option.value === params.get('sort'))
    ? params.get('sort')
    : q
      ? 'relevance'
      : 'newest'

  const page = Math.max(1, Number(params.get('page')) || 1)

  useDocumentTitle(q ? `Search: ${q}` : 'Search')

  // Real tag names power the suggestions, so a typo is visible as "no such tag"
  // rather than silently matching nothing.
  const fetchTags = useCallback(() => previewApi.tags.list({ limit: 60 }), [])
  const tags = useApiResource(fetchTags)

  /**
   * Every filter is sent to the database. The client never filters, sorts or
   * ranks a page of results itself, so the counts, ordering and totals always
   * match what the server returns for the same URL.
   */
  const fetchResults = useCallback(
    () => previewApi.search.query({ q, scope, tag, user, sort, page, limit: PAGE_SIZE }),
    [q, scope, tag, user, sort, page],
  )

  const { data, error, isLoading, reload } = useApiResource(fetchResults)

  const questions = data?.questions ?? []
  const answers = data?.answers ?? []
  const users = data?.users ?? []
  const totalPages = data?.totalPages ?? 1
  const totalResults = data?.total

  const results = scope === 'questions' ? questions : scope === 'answers' ? answers : users
  const hasFilters = Boolean(q || tag || user)

  /** Writes one filter into the URL and resets paging, because results move. */
  function setParam(key, value) {
    const next = new URLSearchParams(params)
    next.delete('page')
    if (!value) {
      next.delete(key)
    } else {
      next.set(key, String(value))
    }
    setParams(next)
  }

  /** Switching scope invalidates the current sort, so both are written together. */
  function changeScope(nextScope) {
    const next = new URLSearchParams(params)
    next.delete('page')
    next.delete('sort')
    if (nextScope === 'questions') {
      next.delete('scope')
    } else {
      next.set('scope', nextScope)
    }
    setParams(next)
  }

  function changePage(nextPage) {
    const next = new URLSearchParams(params)
    if (nextPage <= 1) {
      next.delete('page')
    } else {
      next.set('page', String(nextPage))
    }
    setParams(next)
    window.scrollTo({ top: 0 })
  }

  function resetFilters() {
    // The term is what the user typed, so it survives clearing the refinements.
    const next = new URLSearchParams()
    if (q) next.set('q', q)
    setParams(next)
  }

  const chips = [
    tag ? { key: 'tag', label: FILTER_LABELS.tag, value: tag } : null,
    user ? { key: 'user', label: FILTER_LABELS.user, value: user } : null,
  ].filter(Boolean)

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Search', to: '/search' },
        ]}
      />
      <PreviewNotice />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Search results</h1>
          {!isLoading && !error && hasFilters && typeof totalResults === 'number' ? (
            <p className="mt-1 text-sm text-slate-500">
              {pluralize(totalResults, scope === 'users' ? 'member' : 'result')}
              {q ? (
                <>
                  {' '}
                  for “
                  <span className="font-medium text-slate-700">{q}</span>”
                </>
              ) : null}
            </p>
          ) : null}
        </div>
        <Button to="/questions/ask" size="sm">
          <MessageSquare className="size-4" aria-hidden="true" />
          Ask a question
        </Button>
      </div>

          <section
        aria-label="Search filters"
        className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Search in" htmlFor="search-scope">
            <Select id="search-scope" value={scope} onChange={(event) => changeScope(event.target.value)}>
              {SCOPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Tag" htmlFor="search-tag" hint="An exact tag name">
            <Input
              id="search-tag"
              list="search-tag-suggestions"
              placeholder="react"
              autoComplete="off"
              value={tag}
              onChange={(event) => setParam('tag', event.target.value.trim().toLowerCase())}
            />
            <datalist id="search-tag-suggestions">
              {(tags.data?.tags ?? []).map((option) => (
                <option key={option.id ?? option.name} value={option.name} />
              ))}
            </datalist>
          </Field>

          <Field label="Asked by" htmlFor="search-user" hint="A display name">
            <Input
              id="search-user"
              placeholder="Member name"
              autoComplete="off"
              value={user}
              onChange={(event) => setParam('user', event.target.value.trim())}
            />
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-44">
            <SortTabs
              label="Sort"
              options={sortOptions}
              value={sort}
              onChange={(next) => setParam('sort', next)}
            />
          </div>
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={resetFilters}>
            Clear
          </Button>
        </div>
      </section>

      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => setParam(chip.key, '')}
              className={classNames(
                'inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-2.5 py-1',
                'text-xs font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900',
              )}
            >
              <span className="text-slate-400">{chip.label}:</span>
              <span>{chip.value}</span>
              <span aria-hidden="true" className="text-slate-400">
                ✕
              </span>
              <span className="sr-only">Remove {chip.label.toLowerCase()} filter</span>
            </button>
          ))}
        </div>
      ) : null}

      {!hasFilters ? (
        <EmptyState
          icon={SearchX}
          title="Enter a search term"
          description="Use the search bar in the header to find questions by title, body, tag or author — or pick a tag above to browse without a term."
          action={
            <Button to="/questions" variant="secondary">
              Browse all questions
            </Button>
          }
        />
      ) : isLoading ? (
        scope === 'users' ? (
          <UserResultSkeleton />
        ) : (
          <QuestionListSkeleton count={6} />
        )
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : results.length > 0 ? (
        <>
          {scope === 'questions' ? <QuestionList questions={questions} /> : null}
          {scope === 'answers' ? <AnswerResultList answers={answers} /> : null}
          {scope === 'users' ? <UserResultList users={users} /> : null}
        </>
      ) : (
        <EmptyState
          icon={scope === 'users' ? Users : SearchX}
          title={
            scope === 'users'
              ? 'No matching members'
              : scope === 'answers'
                ? 'No matching answers'
                : 'No matching questions'
          }
          description="Nothing matched this search. Try fewer keywords, a different spelling, or clear a filter."
          action={
            <Button to="/questions/ask" variant="secondary">
              Ask this question yourself
            </Button>
          }
        />
      )}

      {!isLoading && !error && totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={changePage} />
      )}
    </div>
  )
}

/** Answers found by the answer scope, each linked back to its question. */
function AnswerResultList({ answers }) {
  return (
    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
      {answers.map((answer) => {
        const author = answer.author
        return (
          <li key={answer.id} className="px-4 py-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              {answer.isAccepted ? <Badge tone="success">Accepted</Badge> : null}
              <span className="font-medium text-slate-900">{answer.voteCount ?? 0} votes</span>
              <span aria-hidden="true">·</span>
              <span>answered {timeAgo(answer.createdAt)}</span>
              {answer.questionId ? (
                <>
                  <span aria-hidden="true">·</span>
                  <Link
                    to={`/questions/${answer.questionId}`}
                    className="font-medium text-brand-700 hover:underline"
                  >
                    View the question
                  </Link>
                </>
              ) : null}
            </div>

            {author ? (
              <div className="mt-2 flex items-center gap-2">
                <Avatar name={author.name} size="sm" />
                <Link
                  to={`/users/${author.id}`}
                  className="text-[13px] font-medium text-brand-700 hover:underline"
                >
                  {author.name}
                </Link>
              </div>
            ) : null}

            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {excerpt(answer.body, 220)}
            </p>
          </li>
        )
      })}
    </ul>
  )
}

/** Members found by the user scope. */
function UserResultList({ users }) {
  return (
    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
      {users.map((user) => (
        <li key={user.id} className="flex items-start gap-3 px-4 py-4">
          <Avatar name={user.name} src={user.avatar} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/users/${user.id}`}
                className="text-sm font-semibold text-brand-700 hover:underline"
              >
                {user.name}
              </Link>
              {user.username ? (
                <span className="text-xs font-medium text-slate-500">@{user.username}</span>
              ) : null}
              <span className="text-xs font-medium text-slate-500">
                {Number(user.reputation ?? 0).toLocaleString('en-US')} reputation
              </span>
            </div>
            {user.bio ? (
              <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
                {excerpt(user.bio, 160)}
              </p>
            ) : null}
            {user.location ? (
              <p className="mt-1 text-xs text-slate-400">{user.location}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  )
}

function UserResultSkeleton() {
  return (
    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex items-center gap-3 px-4 py-4">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3 rounded" />
            <Skeleton className="h-3 w-2/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
