import { useCallback, useState } from 'react'
import { History, RotateCcw } from 'lucide-react'

import { previewApi } from '@/api/previewAdapter'
import { Avatar } from '@/components/common/Avatar'
import { Button } from '@/components/common/Button'
import { ErrorState } from '@/components/common/ErrorState'
import { Markdown } from '@/components/common/Markdown'
import { Modal } from '@/components/common/Modal'
import { Pagination } from '@/components/common/Pagination'
import { Skeleton } from '@/components/common/Skeleton'
import { TagBadge } from '@/features/tags/TagBadge'
import { useApiResource } from '@/hooks/useApiResource'
import { classNames } from '@/utils/classNames'
import { formatDate, pluralize } from '@/utils/format'

/**
 * Edit history for a question or an answer.
 *
 * The version list is stored server-side, so opening the dialog asks the API
 * for the page being viewed rather than shipping the whole history to the
 * client. Selecting a version fetches that single stored revision; the list
 * response already carries the live version number, which is what marks the
 * "current" row without a second request.
 *
 * @param {object} props
 * @param {'question'|'answer'} props.contentType - Which history endpoint to read.
 * @param {string} props.contentId - The question or answer id.
 * @param {string} [props.className] - Extra classes for the trigger button.
 */
export function RevisionHistory({ contentType, contentId, className }) {
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [selectedVersion, setSelectedVersion] = useState(null)

  const isQuestion = contentType === 'question'
  const scope = isQuestion ? previewApi.questions : previewApi.answers

  // Only fetch while the dialog is open, so a page full of posts does not issue
  // a history request each. Passing `null` as the fetcher keeps the hook idle.
  const fetchHistory = useCallback(() => scope.history(contentId, { page }), [page, contentId, scope])
  const history = useApiResource(open ? fetchHistory : null)

  const fetchVersion = useCallback(
    () => scope.version(contentId, selectedVersion),
    [contentId, scope, selectedVersion],
  )
  const version = useApiResource(open && selectedVersion !== null ? fetchVersion : null)

  function handleOpen() {
    setOpen(true)
    setPage(1)
    setSelectedVersion(null)
  }

  function handleClose() {
    setOpen(false)
  }

  const revisions = history.data?.revisions ?? []
  const currentVersion = history.data?.currentVersion ?? null

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        icon={History}
        onClick={handleOpen}
        className={className}
      >
        History
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        title={isQuestion ? 'Question history' : 'Answer history'}
        size="lg"
      >
        <div className="space-y-5">
          {history.isLoading ? (
            <div className="space-y-2" aria-label="Loading history">
              {[0, 1, 2].map((index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : history.error ? (
            <ErrorState error={history.error} onRetry={history.reload} />
          ) : revisions.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
              This post has not been edited yet.
            </p>
          ) : (
            <>
              <ol className="space-y-2">
                {revisions.map((revision) => {
                  const isCurrent = revision.version === currentVersion
                  const isSelected = revision.version === selectedVersion

                  return (
                    <li key={revision.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedVersion(revision.version)}
                        aria-pressed={isSelected}
                        className={classNames(
                          'flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
                          isSelected
                            ? 'border-brand-300 bg-brand-50'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                        )}
                      >
                        <Avatar name={revision.editor?.name ?? 'Unknown'} size="sm" />

                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-slate-900">
                              {revision.editor?.name ?? 'Deleted user'}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 tabular">
                              v{revision.version}
                            </span>
                            {isCurrent ? (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                Current
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-0.5 block text-xs text-slate-500">
                            {formatDate(revision.savedAt)}
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ol>

              {history.data?.totalPages > 1 ? (
                <Pagination page={page} totalPages={history.data.totalPages} onPageChange={setPage} />
              ) : null}
            </>
          )}

          {selectedVersion !== null ? <RevisionDetail resource={version} onClose={() => setSelectedVersion(null)} /> : null}
        </div>
      </Modal>
    </>
  )
}

/** The full text of one stored version, fetched on demand. */
function RevisionDetail({ resource, onClose }) {
  const revision = resource.data?.revision ?? null

  return (
    <section
      aria-label="Revision contents"
      className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">
          {revision ? `Version ${revision.version}` : 'Revision'}
        </h3>
        <Button variant="ghost" size="sm" icon={RotateCcw} onClick={onClose}>
          Close version
        </Button>
      </div>

      {resource.isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : resource.error ? (
        <ErrorState error={resource.error} onRetry={resource.reload} />
      ) : revision ? (
        <>
          {revision.title ? (
            <h4 className="text-sm font-semibold text-slate-800">{revision.title}</h4>
          ) : null}

          {Array.isArray(revision.tags) && revision.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {revision.tags.map((tag) => (
                <TagBadge key={tag} name={tag} />
              ))}
            </div>
          ) : null}

          <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-800">
            <Markdown markdown={revision.body} />
          </div>

          <p className="text-xs text-slate-500">
            {pluralize((revision.body ?? '').length, 'character')} saved by{' '}
            {revision.editor?.name ?? 'a deleted user'} on {formatDate(revision.savedAt)}
          </p>
        </>
      ) : null}
    </section>
  )
}