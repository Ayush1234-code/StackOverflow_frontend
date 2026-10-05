import { useCallback, useState } from 'react'
import { Search, Tags } from 'lucide-react'

import { previewApi } from '@/api/previewAdapter'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Card, CardBody } from '@/components/common/Card'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { PreviewNotice } from '@/components/common/PreviewNotice'
import { CardGridSkeleton } from '@/components/common/Skeleton'
import { TagBadge } from '@/features/tags/TagBadge'
import { useApiResource } from '@/hooks/useApiResource'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { pluralize } from '@/utils/format'

export function TagsPage() {
  useDocumentTitle('Tags')
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query.trim(), 250)

  const fetchTags = useCallback(
    () => previewApi.tags.list({ q: debouncedQuery, limit: 80 }),
    [debouncedQuery],
  )
  const { data, error, isLoading } = useApiResource(fetchTags)

  const tags = data?.tags ?? []

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Tags', to: '/tags' },
        ]}
      />
      <PreviewNotice />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tags</h1>
          <p className="mt-1 text-sm text-slate-600">
            Browse questions by the technology or problem area they belong to.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter tags"
            aria-label="Filter tags"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
          />
        </div>
      </div>

      {isLoading ? (
        <CardGridSkeleton count={9} />
      ) : error ? (
        <ErrorState error={error} />
      ) : tags.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tags.map((tag) => (
            <Card key={tag.name}>
              <CardBody>
                <TagBadge name={tag.name} />
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                  {tag.description || 'No description available for this tag.'}
                </p>
                {typeof tag.count === 'number' && (
                  <p className="mt-3 text-xs text-slate-400">
                    {pluralize(tag.count, 'question')}
                  </p>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={query ? Search : Tags}
          title={query ? 'No matching tags' : 'No tags yet'}
          description={
            query
              ? `Nothing matches “${query}”. Try a shorter filter.`
              : 'Tags will appear here once questions are posted.'
          }
        />
      )}
    </div>
  )
}
