import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MessageSquare, PenLine, X } from 'lucide-react'

import { previewApi } from '@/api/previewAdapter'
import { Button } from '@/components/common/Button'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { PreviewNotice } from '@/components/common/PreviewNotice'
import { QuestionListSkeleton } from '@/components/common/Skeleton'
import { Pagination } from '@/components/common/Pagination'
import { QuestionList } from '@/features/questions/QuestionList'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { classNames } from '@/utils/classNames'

const SORT_OPTIONS = ['newest', 'active', 'unanswered']
const PAGE_SIZE = 10

export function QuestionsPage() {
  const [params, setParams] = useSearchParams()
  const sort = SORT_OPTIONS.includes(params.get('sort')) ? params.get('sort') : 'newest'
  const q = params.get('q')?.trim() || ''
  const tag = params.get('tag')?.trim() || ''
  const page = Math.max(1, Number(params.get('page')) || 1)

  const title = tag ? `Questions tagged ${tag}` : q ? `Search: ${q}` : 'Questions'
  useDocumentTitle(title)

  const fetchQuestions = useCallback(
    () => previewApi.questions.list({ sort, q, tag, page, limit: PAGE_SIZE }),
    [sort, q, tag, page],
  )
  const { data, error, isLoading } = useApiResource(fetchQuestions)

  const questions = data?.questions ?? []
  const totalPages = data?.totalPages ?? 1

  function changeSort(nextSort) {
    const nextParams = new URLSearchParams(params)
    nextParams.delete('page')
    if (nextSort === 'newest') {
      nextParams.delete('sort')
    } else {
      nextParams.set('sort', nextSort)
    }
    setParams(nextParams)
  }

  function changePage(nextPage) {
    const nextParams = new URLSearchParams(params)
    if (nextPage <= 1) {
      nextParams.delete('page')
    } else {
      nextParams.set('page', String(nextPage))
    }
    setParams(nextParams, { preventScrollReset: false })
    window.scrollTo({ top: 0 })
  }

  function clearFilter() {
    const nextParams = new URLSearchParams(params)
    nextParams.delete('q')
    nextParams.delete('tag')
    nextParams.delete('page')
    setParams(nextParams)
  }

  const tabClasses = (active) =>
    classNames(
      'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
      active
        ? 'bg-brand-600 text-white'
        : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50',
    )

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Questions', to: '/questions' },
          ...(tag ? [{ label: `tagged ${tag}`, to: `/questions?tag=${encodeURIComponent(tag)}` }] : []),
        ]}
      />
      <PreviewNotice />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <Button to="/questions/ask">
          <PenLine className="size-4" aria-hidden="true" />
          Ask question
        </Button>
      </div>

      {(q || tag) && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-500">
            Showing results{q ? ` for “${q}”` : ''}
            {tag ? ` tagged “${tag}”` : ''}
          </span>
          {tag ? (
            <span className="inline-flex items-center rounded-md bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">
              {tag}
            </span>
          ) : null}
          <button
            type="button"
            onClick={clearFilter}
            className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-800 transition-colors hover:bg-brand-100"
          >
            <X className="size-3.5" aria-hidden="true" />
            Clear filter
          </button>
        </div>
      )}

      <div className="inline-flex gap-2" role="tablist" aria-label="Sort questions">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={sort === option}
            onClick={() => changeSort(option)}
            className={tabClasses(sort === option)}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <QuestionListSkeleton count={6} />
      ) : error ? (
        <ErrorState error={error} />
      ) : questions.length > 0 ? (
        <QuestionList questions={questions} />
      ) : (
        <EmptyState
          icon={MessageSquare}
          title="No questions found"
          description={
            tag
              ? `No real questions currently use the "${tag}" tag.`
              : q
                ? 'Try a different search term.'
              : 'The community has not posted any questions yet.'
          }
          action={<Button to="/questions/ask">Ask a question</Button>}
        />
      )}

      {!isLoading && !error && totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={changePage} />
      )}
    </div>
  )
}
