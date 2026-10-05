import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Bookmark, PenLine } from 'lucide-react'

import { previewApi } from '@/api/previewAdapter'
import { Button } from '@/components/common/Button'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Pagination } from '@/components/common/Pagination'
import { QuestionListSkeleton } from '@/components/common/Skeleton'
import { QuestionList } from '@/features/questions/QuestionList'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { pluralize } from '@/utils/format'

const PAGE_SIZE = 10

/**
 * The signed-in user's saved questions, served by `GET /api/bookmarks`.
 *
 * Un-saving a question from one of the cards refetches the page rather than
 * splicing the array locally, so the server stays the source of truth for
 * ordering, totals and pagination — including when the un-saved row was the
 * only one on the final page.
 */
export function BookmarksPage() {
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number(params.get('page')) || 1)

  useDocumentTitle('Saved questions')

  const fetchBookmarks = useCallback(
    () => previewApi.bookmarks.list({ page, limit: PAGE_SIZE }),
    [page],
  )
  const { data, error, isLoading, reload } = useApiResource(fetchBookmarks)

  const questions = data?.questions ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

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

  function handleBookmarkChange(_questionId, bookmarked) {
    if (!bookmarked) reload()
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Saved questions' }]} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Saved questions</h1>
          {!isLoading && !error ? (
            <p className="text-sm text-slate-500">
              {total === 0
                ? 'Questions you save are kept here, newest first.'
                : `${pluralize(total, 'saved question')}, newest first.`}
            </p>
          ) : null}
        </div>
        <Button to="/questions">
          <PenLine className="size-4" aria-hidden="true" />
          Browse questions
        </Button>
      </div>

      {isLoading ? (
        <QuestionListSkeleton count={5} />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : questions.length > 0 ? (
        <QuestionList questions={questions} onBookmarkChange={handleBookmarkChange} />
      ) : (
        <EmptyState
          icon={Bookmark}
          title="No saved questions yet"
          description="Tap “Save” on any question to keep it here for quick access later."
          action={<Button to="/questions">Browse questions</Button>}
        />
      )}

      {!isLoading && !error && totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={changePage} />
      )}
    </div>
  )
}
