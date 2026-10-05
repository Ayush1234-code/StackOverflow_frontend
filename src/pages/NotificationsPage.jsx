import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'

import { previewApi } from '@/api/previewAdapter'
import { Button } from '@/components/common/Button'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Pagination } from '@/components/common/Pagination'
import { Skeleton } from '@/components/common/Skeleton'
import { SortTabs } from '@/components/common/SortTabs'
import { NotificationItem } from '@/features/notifications/NotificationItem'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { pluralize } from '@/utils/format'

const PAGE_SIZE = 20

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
]

/**
 * The full notification inbox behind `GET /api/notifications`.
 *
 * Paging and the unread filter live in the URL so the view is linkable and the
 * back button behaves. Every mutation refetches rather than patching the list
 * locally, because the unread count, the totals and the ordering are all owned
 * by the server.
 */
export function NotificationsPage() {
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number(params.get('page')) || 1)
  const filter = params.get('filter') === 'unread' ? 'unread' : 'all'

  useDocumentTitle('Notifications')

  const fetchNotifications = useCallback(
    () =>
      previewApi.notifications.list({
        page,
        limit: PAGE_SIZE,
        ...(filter === 'unread' ? { unread: '1' } : {}),
      }),
    [page, filter],
  )

  const { data, error, isLoading, reload } = useApiResource(fetchNotifications)

  const notifications = data?.notifications ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1
  const unreadCount = data?.unreadCount ?? 0

  /** Writes one filter value into the URL and resets paging. */
  function setParam(key, value) {
    const next = new URLSearchParams(params)
    if (!value || value === 'all' || value === 1) {
      next.delete(key)
    } else {
      next.set(key, String(value))
    }
    setParams(next)
    window.scrollTo({ top: 0 })
  }

  function changePage(nextPage) {
    setParam('page', nextPage)
  }

  async function markRead(notificationId) {
    await previewApi.notifications.markRead(notificationId)
    reload()
  }

  async function markAllRead() {
    await previewApi.notifications.markAllRead()
    reload()
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Notifications' }]} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notifications</h1>
          {!isLoading && !error ? (
            <p className="text-sm text-slate-500">
              {unreadCount > 0
                ? `${pluralize(unreadCount, 'unread notification')} of ${total}.`
                : total > 0
                  ? `All ${pluralize(total, 'notification')} read.`
                  : 'Activity on your posts shows up here.'}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {total > 0 ? (
            <SortTabs
              label="Show"
              options={FILTERS.map((option) =>
                option.value === 'unread' ? { ...option, count: unreadCount } : option,
              )}
              value={filter}
              onChange={(next) => setParam('filter', next)}
            />
          ) : null}
          {unreadCount > 0 ? (
            <Button variant="secondary" size="sm" icon={CheckCheck} onClick={markAllRead}>
              Mark all read
            </Button>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex items-center gap-3 px-4 py-4">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-2/3 rounded" />
                <Skeleton className="h-3 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : notifications.length > 0 ? (
        <>
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onOpen={() => {
                  if (!notification.read) markRead(notification.id)
                }}
              />
            ))}
          </ul>

          {totalPages > 1 ? (
            <Pagination page={page} totalPages={totalPages} onPageChange={changePage} />
          ) : null}
        </>
      ) : (
        <EmptyState
          icon={Bell}
          title={filter === 'unread' ? 'Nothing unread' : 'No notifications yet'}
          description={
            filter === 'unread'
              ? 'You have read everything. Switch to “All” to revisit older activity.'
              : 'When someone answers, comments on, or upvotes your posts, it will appear here.'
          }
          action={
            filter === 'unread' ? (
              <Button variant="secondary" onClick={() => setParam('filter', 'all')}>
                Show all notifications
              </Button>
            ) : (
              <Button to="/questions">Browse questions</Button>
            )
          }
        />
      )}
    </div>
  )
}