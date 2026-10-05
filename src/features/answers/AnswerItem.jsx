import { useState } from 'react'
import { CheckCircle2, Loader2, PenLine, Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'

import { previewApi } from '@/api/previewAdapter'
import { CommentSection } from '@/components/comments/CommentSection'
import { Avatar } from '@/components/common/Avatar'
import { Badge } from '@/components/common/Badge'
import { ConfirmButton } from '@/components/common/ConfirmButton'
import { Markdown } from '@/components/common/Markdown'
import { Reputation } from '@/components/common/Reputation'
import { Textarea } from '@/components/common/Textarea'
import { VoteControls } from '@/components/common/VoteControls'
import { ReportButton } from '@/components/reporting/ReportDialog'
import { RevisionHistory } from '@/features/revisions/RevisionHistory'
import { useAuth } from '@/hooks/useAuth'
import { classNames } from '@/utils/classNames'
import { timeAgo } from '@/utils/format'

export function AnswerItem({ answer, onAccept, onVote, isAccepting = false, onChanged }) {
  const { id, body, author, createdAt, isAccepted, voteCount, userVote, questionId } = answer
  const { user } = useAuth()

  const canModerate = Boolean(user && (author?.id === user.id || user.role === 'admin'))

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(body)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionError, setActionError] = useState(null)

  async function handleSave() {
    const trimmed = draft.trim()
    if (trimmed.length < 15) {
      setActionError('Please write an answer of at least 15 characters.')
      return
    }
    setActionError(null)
    setIsSaving(true)
    try {
      await previewApi.answers.update(id, { body: trimmed })
      setEditing(false)
      onChanged?.()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    setActionError(null)
    setIsDeleting(true)
    try {
      await previewApi.answers.remove(id)
      onChanged?.()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <article
      className={classNames(
        'rounded-xl border bg-white p-5 shadow-card',
        isAccepted ? 'border-emerald-400' : 'border-slate-200',
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <VoteControls
          orientation="vertical"
          count={voteCount}
          userVote={userVote}
          busy={false}
          onVote={(value) => onVote?.(id, value)}
          className="self-start sm:flex-none"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <Avatar name={author?.name} size="sm" />
            {author?.name ? (
              <Link
                to={author.id ? `/users/${author.id}` : '/users'}
                className="text-sm font-medium text-slate-800 transition-colors hover:text-brand-700"
              >
                {author.name}
              </Link>
            ) : (
              <span className="text-sm font-medium text-slate-800">Anonymous</span>
            )}
            {author?.reputation != null ? (
              <Reputation value={author.reputation} />
            ) : null}
            {createdAt && <time className="text-xs text-slate-400">{timeAgo(createdAt)}</time>}
            <span className="ml-auto flex flex-wrap items-center gap-1">
              <RevisionHistory contentType="answer" contentId={id} />
              <ReportButton contentType="answer" contentId={id} contentSummary={body} />
              {canModerate && !editing && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(body)
                      setActionError(null)
                      setEditing(true)
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-700"
                  >
                    <PenLine className="size-3.5" aria-hidden="true" />
                    Edit
                  </button>
                  <ConfirmButton
                    icon={Trash2}
                    size="sm"
                    confirmLabel="Delete answer? Click again"
                    onConfirm={handleDelete}
                    loading={isDeleting}
                  >
                    Delete
                  </ConfirmButton>
                </>
              )}
              {isAccepted ? (
                <Badge tone="success">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  Accepted
                </Badge>
              ) : onAccept ? (
                <button
                  type="button"
                  onClick={() => onAccept(id)}
                  disabled={isAccepting}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700 disabled:pointer-events-none disabled:opacity-60"
                >
                  {isAccepting ? (
                    <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  )}
                  Accept
                </button>
              ) : null}
            </span>
          </div>

          {editing ? (
            <div className="mt-3 space-y-2">
              <Textarea
                rows={6}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                aria-label="Edit answer body"
                error={Boolean(actionError)}
              />
              {actionError && (
                <p role="alert" className="text-xs text-red-600">
                  {actionError}
                </p>
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || isDeleting}
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white bg-brand-600 transition-colors hover:bg-brand-700 disabled:pointer-events-none disabled:opacity-60"
                >
                  {isSaving ? (
                    <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  )}
                  Save changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    setActionError(null)
                  }}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="size-3.5" aria-hidden="true" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 text-sm leading-relaxed text-slate-700">
              <Markdown markdown={body} />
            </div>
          )}

          {actionError && !editing && (
            <p role="alert" className="mt-2 text-xs text-red-600">
              {actionError}
            </p>
          )}

          {questionId ? (
            <CommentSection questionId={questionId} answerId={id} className="mt-4 max-w-3xl" />
          ) : null}
        </div>
      </div>
    </article>
  )
}