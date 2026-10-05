import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bookmark } from 'lucide-react'

import { previewApi } from '@/api/previewAdapter'
import { useAuth } from '@/hooks/useAuth'
import { classNames } from '@/utils/classNames'

/**
 * Bookmark toggle for a question.
 *
 * Owns its own request so it can be dropped into any list without the parent
 * having to thread bookmark state through. The button reflects the new state
 * as soon as the request is sent, then rolls back to the server's previous
 * value if the call fails, so the UI can never drift from the database.
 */
export function BookmarkButton({ questionId, initialBookmarked = false, onChanged, className }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const serverBookmarked = Boolean(initialBookmarked)
  const [bookmarked, setBookmarked] = useState(serverBookmarked)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  // Re-sync when fresh server data arrives for a button that is already mounted
  // (a reloaded list, or the detail page refetching after an action). Done
  // during render rather than in an effect so the control never shows a frame
  // of stale state.
  const [lastServerBookmarked, setLastServerBookmarked] = useState(serverBookmarked)
  if (lastServerBookmarked !== serverBookmarked && !busy) {
    setLastServerBookmarked(serverBookmarked)
    setBookmarked(serverBookmarked)
    setError(null)
  }

  async function toggle() {
    if (busy) return

    const previous = bookmarked
    const next = !previous
    setBookmarked(next)
    setError(null)
    setBusy(true)
    try {
      if (next) {
        await previewApi.bookmarks.add(questionId)
      } else {
        await previewApi.bookmarks.remove(questionId)
      }
      // Lets a list (e.g. the bookmarks page) drop the row it just un-saved.
      onChanged?.(questionId, next)
    } catch (err) {
      // Roll back so the control keeps telling the truth.
      setBookmarked(previous)
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        state={{ from: location.pathname + location.search }}
        className={classNames(
          'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700',
          className,
        )}
        title="Log in to save this question"
      >
        <Bookmark className="size-4" aria-hidden="true" />
        Save
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={bookmarked}
      title={error ?? (bookmarked ? 'Remove this bookmark' : 'Save this question')}
      className={classNames(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors disabled:opacity-60',
        bookmarked
          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
        className,
      )}
    >
      <Bookmark
        className="size-4"
        aria-hidden="true"
        fill={bookmarked ? 'currentColor' : 'none'}
      />
      {bookmarked ? 'Saved' : 'Save'}
      {error ? <span className="sr-only">{error}</span> : null}
    </button>
  )
}
