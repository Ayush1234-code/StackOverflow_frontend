import { useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Users } from 'lucide-react'

import { usersApi } from '@/api/endpoints'
import { Avatar } from '@/components/common/Avatar'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Card, CardBody } from '@/components/common/Card'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Pagination } from '@/components/common/Pagination'
import { CardGridSkeleton } from '@/components/common/Skeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatDate } from '@/utils/format'

const PAGE_SIZE = 6

export function UsersPage() {
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number(params.get('page')) || 1)
  useDocumentTitle('Users')

  const fetchUsers = useCallback(
    () => usersApi.list({ limit: PAGE_SIZE, page }),
    [page],
  )
  const { data, error, isLoading, reload } = useApiResource(fetchUsers)

  const users = data?.users ?? []
  const totalPages = data?.totalPages ?? 1

  function changePage(nextPage) {
    const nextParams = new URLSearchParams(params)
    if (nextPage <= 1) {
      nextParams.delete('page')
    } else {
      nextParams.set('page', String(nextPage))
    }
    setParams(nextParams)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Users', to: '/users' },
        ]}
      />

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Users</h1>
        <p className="mt-1 text-sm text-slate-600">
          Find people who shape the community with their answers.
        </p>
      </div>

      {isLoading ? (
        <CardGridSkeleton count={9} />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : users.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => {
            const userId = user.id ?? user._id
            return (
              <Link key={userId} to={`/users/${userId}`} className="block">
                <Card className="h-full transition-colors hover:border-brand-300 hover:shadow-popover">
                  <CardBody className="flex h-full flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar name={user.name} src={user.avatar} size="lg" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{user.name}</p>
                        {user.username ? (
                          <p className="mt-0.5 truncate text-sm text-slate-500">@{user.username}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      {user.bio ? (
                        <p className="line-clamp-2 leading-relaxed text-slate-600">{user.bio}</p>
                      ) : null}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        <span className="font-medium text-brand-700">
                          {Number(user.reputation ?? 0).toLocaleString('en-US')} reputation
                        </span>
                        {user.createdAt ? (
                          <span className="text-slate-500">Joined {formatDate(user.createdAt)}</span>
                        ) : null}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No users yet"
          description="Members will appear here once they join the community."
        />
      )}

      {!isLoading && !error && totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={changePage} />
      )}
    </div>
  )
}
