import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'

import { Button } from '@/components/common/Button'
import { Skeleton } from '@/components/common/Skeleton'
import { previewApi } from '@/api/previewAdapter'
import { useApiResource } from '@/hooks/useApiResource'
import { useDismissable } from '@/hooks/useDismissable'
import { useAuth } from '@/hooks/useAuth'
import { classNames } from '@/utils/classNames'

import { NotificationItem } from './NotificationItem'

/** How often the bell asks the server for a fresh unread count. */
const POLL_MS = 60000

/** Rows shown in the dropdown before it defers to the full page. */
const PREVIEW_LIMIT = 5

/**
 * The header bell and its dropdown.
 *
 * The unread count is polled rather than pushed, because the API is plain HTTP
 * and a socket layer would be a large amount of machinery for a number that
 * changes slowly. Polling only runs while a session exists and the tab is
 * visible, so a backgrounded tab is not holding a timer open.
 */
export function NotificationBell() {
  const { isAuthenticated } = useAuth()
  const { open, toggle, close, containerRef } = useDismissable()
  const [isVisible, setIsVisible] = useState(() => !document.hidden)

  const countFetcher = useCallback(
    () => (isAuthenticated ? previewApi.notifications.unreadCount() : Promise.resolve({ unreadCount: 0 })),
    [isAuthenticated],
  )

  const listFetcher = useCallback(
    () =>
      open
        ? previewApi.notifications.list({ limit: PREVIEW_LIMIT })
        : Promise.resolve(null),
    [open],
  )

  const count = useApiResource(countFetcher, { enabled: isAuthenticated })
  const inbox = useApiResource(listFetcher, { enabled: isAuthenticated && open })

  const unreadCount = count.data?.unreadCount ?? 0

  // Poll the count while signed in, and only while the tab is in the foreground.
  useEffect(() => {
    if (!isAuthenticated || !isVisible) return undefined

    const timer = window.setInterval(() => {
      count.reload()
    }, POLL_MS)

    function handleVisibility() {
      setIsVisible(!document.hidden)
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [isAuthenticated, isVisible, count.reload])

  // Re-check the count as soon as the tab comes back to the foreground.
  useEffect(() => {
    if (isVisible) count.reload()
  }, [isVisible, count.reload])

  if (!isAuthenticated) return null

  async function markAllRead() {
    await previewApi.notifications.markAllRead()
    count.reload()
    inbox.reload()
  }

  async function markRead(notificationId) {
    // Optimistic: the row is about to navigate away, so waiting for the round
    // trip would make the badge flicker on every click.
    await previewApi.notifications.markRead(notificationId)
    count.reload()
    inbox.reload()
  }

  const notifications = inbox.data?.notifications ?? []

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={
          unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
        }
        className={classNames(
          'relative grid size-9 place-items-center rounded-lg transition-colors',
          open ? 'bg-slate-100' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        )}
      >
        <Bell className="size-[18px]" aria-hidden="true" />
        {unreadCount > 0 ? (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-4 text-white"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-popover sm:w-96"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            {unreadCount > 0 ? (
              <Button variant="ghost" size="sm" icon={CheckCheck} onClick={markAllRead}>
                Mark all read
              </Button>
            ) : null}
          </div>

          {inbox.isLoading ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-8 w-full rounded-lg" />
              <Skeleton className="h-8 w-full rounded-lg" />
              <Skeleton className="h-8 w-3/4 rounded-lg" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-slate-500">
              You are all caught up.
            </p>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onOpen={() => {
                    close()
                    if (!notification.read) markRead(notification.id)
                  }}
                />
              ))}
            </ul>
          )}

          <div className="border-t border-slate-100 p-2">
            <Link
              to="/notifications"
              onClick={close}
              className="block rounded-lg px-3 py-2 text-center text-[13px] font-medium text-brand-700 transition-colors hover:bg-slate-50"
            >
              View all notifications
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
