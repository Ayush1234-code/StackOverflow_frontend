import { useCallback, useState } from 'react'
import { CornerDownRight } from 'lucide-react'

import { previewApi } from '@/api/previewAdapter'
import { CommentForm } from '@/components/comments/CommentForm'
import { CommentList } from '@/components/comments/CommentList'
import { useApiResource } from '@/hooks/useApiResource'
import { useAuth } from '@/hooks/useAuth'

export function CommentSection({ questionId, answerId = null, className }) {
  const { isAuthenticated } = useAuth()
  const [showForm, setShowForm] = useState(false)

  const fetchComments = useCallback(
    () => previewApi.comments.list({ questionId, answerId }),
    [questionId, answerId],
  )
  const { data, error, isLoading, reload } = useApiResource(fetchComments)
  const comments = data?.comments ?? []

  async function handleSubmitComment(body) {
    await previewApi.comments.create({ questionId, answerId, body })
    setShowForm(false)
    reload()
  }

  return (
    <div className={className}>
      <CommentList
        comments={comments}
        loading={isLoading}
        error={error}
        onRetry={reload}
        onChanged={reload}
      />
      {!isLoading && !error && (
        <div className="mt-2">
          {isAuthenticated ? (
            showForm ? (
              <CommentForm onSubmit={handleSubmitComment} />
            ) : (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-brand-700"
              >
                <CornerDownRight className="size-3.5" aria-hidden="true" />
                Add a comment
              </button>
            )
          ) : (
            <a
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-brand-700"
            >
              <CornerDownRight className="size-3.5" aria-hidden="true" />
              Log in to add a comment
            </a>
          )}
        </div>
      )}
    </div>
  )
}