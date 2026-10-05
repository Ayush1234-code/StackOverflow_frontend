import { useState } from 'react'
import { MessageSquare, PenLine, Trash2, X } from 'lucide-react'

import { previewApi } from '@/api/previewAdapter'
import { Avatar } from '@/components/common/Avatar'
import { ConfirmButton } from '@/components/common/ConfirmButton'
import { Skeleton } from '@/components/common/Skeleton'
import { CommentForm } from '@/components/comments/CommentForm'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/utils/format'

function CommentItem({ comment, onChanged }) {
  const { user } = useAuth()
  const canModerate = Boolean(user && (comment.author?.id === user.id || user.role === 'admin'))

  const [editing, setEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionError, setActionError] = useState(null)

  async function handleSave(nextBody) {
    try {
      await previewApi.comments.update(comment.id, { body: nextBody })
      setEditing(false)
      setActionError(null)
      onChanged?.()
    } catch (err) {
      setActionError(err.message)
      throw err
    }
  }

  async function handleDelete() {
    setActionError(null)
    setIsDeleting(true)
    try {
      await previewApi.comments.remove(comment.id)
      onChanged?.()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  if (editing) {
    return (
      <li className="space-y-2">
        <CommentForm
          initialValue={comment.body}
          onSubmit={handleSave}
          buttonLabel="Save"
          placeholder="Edit comment…"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditing(false)
              setActionError(null)
            }}
            disabled={isDeleting}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors hover:text-slate-700"
          >
            <X className="size-3.5" aria-hidden="true" />
            Cancel
          </button>
          {actionError && (
            <p role="alert" className="text-xs text-red-600">
              {actionError}
            </p>
          )}
        </div>
      </li>
    )
  }

  return (
    <li className="flex items-start gap-2 text-sm">
      <Avatar name={comment.author?.name} size="sm" className="mt-0.5 size-5 text-[10px]" />
      <div className="min-w-0 flex-1">
        <span className="font-medium text-slate-700">{comment.author?.name || 'Anonymous'}</span>{' '}
        <span className="break-words text-slate-600">{comment.body}</span>
        {comment.createdAt && (
          <span className="ml-1.5 whitespace-nowrap text-xs text-slate-400">
            {formatDate(comment.createdAt)}
          </span>
        )}
        {canModerate && (
          <span className="ml-2 inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setActionError(null)
                setEditing(true)
              }}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-700"
            >
              <PenLine className="size-3" aria-hidden="true" />
              Edit
            </button>
            <ConfirmButton
              icon={Trash2}
              size="sm"
              className="px-1.5 py-0.5 text-[11px]"
              confirmLabel="Delete? Click again"
              onConfirm={handleDelete}
              loading={isDeleting}
            >
              Delete
            </ConfirmButton>
          </span>
        )}
        {actionError && (
          <p role="alert" className="mt-0.5 text-xs text-red-600">
            {actionError}
          </p>
        )}
      </div>
    </li>
  )
}

export function CommentList({ comments = [], loading = false, error = null, onRetry = null, onChanged = null }) {
  if (loading) {
    return (
      <div className="space-y-2" aria-label="Loading comments">
        {[0, 1].map((index) => (
          <div key={index} className="flex items-start gap-2">
            <Skeleton className="size-5 rounded-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <p className="text-xs text-red-600">
        Could not load comments.
        {onRetry ? (
          <button type="button" onClick={onRetry} className="ml-1.5 font-medium underline underline-offset-2">
            Try again
          </button>
        ) : null}
      </p>
    )
  }

  if (!comments.length) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-slate-400">
        <MessageSquare className="size-3.5" aria-hidden="true" />
        No comments yet.
      </p>
    )
  }

  return (
    <ul className="space-y-1.5 border-t border-slate-100 pt-2">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} onChanged={onChanged} />
      ))}
    </ul>
  )
}