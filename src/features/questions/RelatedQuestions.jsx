import { useCallback } from 'react'
import { Link } from 'react-router-dom'

import { previewApi } from '@/api/previewAdapter'
import { ErrorState } from '@/components/common/ErrorState'
import { QuestionListSkeleton } from '@/components/common/Skeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { classNames } from '@/utils/classNames'
import { excerpt } from '@/utils/format'

/**
 * Other questions that share tags with the one being viewed. Rendered as a
 * lightweight list rather than full QuestionCards: the reader is already on a
 * question page, so these are pointers, not the page's main content.
 *
 * Renders nothing at all when the API finds no related questions — an empty
 * heading is worse than no section.
 */
export function RelatedQuestions({ questionId, limit = 5 }) {
  const fetchRelated = useCallback(
    () => previewApi.questions.related(questionId, { limit }),
    [questionId, limit],
  )
  const { data, error, isLoading, reload } = useApiResource(fetchRelated, {
    enabled: Boolean(questionId),
  })

  const questions = data?.questions ?? []

  if (isLoading) {
    return (
      <section aria-labelledby="related-heading" className="space-y-3">
        <h2 id="related-heading" className="text-base font-semibold text-slate-900">
          Related questions
        </h2>
        <QuestionListSkeleton count={2} />
      </section>
    )
  }

  // A failure here must not interrupt reading the question itself, so the
  // error is shown inline and quietly retryable rather than thrown.
  if (error) {
    return (
      <section aria-labelledby="related-heading" className="space-y-3">
        <h2 id="related-heading" className="text-base font-semibold text-slate-900">
          Related questions
        </h2>
        <ErrorState
          title="Could not load related questions"
          error={error}
          onRetry={reload}
          className="py-4"
        />
      </section>
    )
  }

  if (questions.length === 0) return null

  return (
    <section aria-labelledby="related-heading" className="space-y-3">
      <h2 id="related-heading" className="text-base font-semibold text-slate-900">
        Related questions
      </h2>
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {questions.map((question) => (
          <li key={question.id} className="px-4 py-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              <span
                className={classNames(
                  'rounded-full px-1.5 py-0.5',
                  question.voteCount > 0
                    ? 'border border-emerald-600 text-emerald-700'
                    : 'border border-slate-200',
                )}
              >
                {question.voteCount} votes
              </span>
              <span
                className={classNames(
                  'rounded-full px-1.5 py-0.5',
                  question.acceptedAnswerId
                    ? 'bg-emerald-600 font-medium text-white'
                    : 'border border-slate-200',
                )}
              >
                {question.answerCount} answers
              </span>
            </div>
            <Link
              to={`/questions/${question.id}`}
              className="mt-1.5 block font-medium leading-snug text-brand-700 transition-colors hover:text-brand-800"
            >
              {question.title}
            </Link>
            {question.body ? (
              <p className="mt-1 line-clamp-1 text-sm text-slate-500">{excerpt(question.body, 110)}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
