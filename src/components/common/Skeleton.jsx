import { classNames } from '@/utils/classNames'

export function Skeleton({ className }) {
  return (
    <div
      aria-hidden="true"
      className={classNames('animate-pulse rounded-md bg-slate-200/80', className)}
    />
  )
}

export function SkeletonText({ lines = 3, className }) {
  const widths = ['w-full', 'w-11/12', 'w-3/4']
  return (
    <div className={classNames('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className={classNames('h-3', widths[index % widths.length])} />
      ))}
    </div>
  )
}

export function QuestionListSkeleton({ count = 5, className }) {
  return (
    <section
      aria-label="Loading questions"
      className={classNames(
        'divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card',
        className,
      )}
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex gap-4 px-5 py-4">
          <div className="flex w-16 shrink-0 flex-col items-end gap-2">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-3 w-10" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <div className="flex items-center gap-2 pt-2">
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-12 rounded-md" />
              <Skeleton className="ml-auto h-6 w-24 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}

export function CardGridSkeleton({ count = 6, className }) {
  return (
    <div
      aria-label="Loading content"
      className={classNames('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
          <SkeletonText lines={2} className="mt-4" />
          <Skeleton className="mt-4 h-3 w-20" />
        </div>
      ))}
    </div>
  )
}

export function QuestionDetailSkeleton({ className }) {
  return (
    <div className={classNames('space-y-8', className)} aria-label="Loading question">
      <div className="space-y-2">
        <Skeleton className="h-3 w-56" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="flex gap-4">
          <div className="flex w-10 shrink-0 flex-col items-center gap-2">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="h-4 w-6" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-12 rounded-md" />
            </div>
            <Skeleton className="mt-3 h-6 w-4/5" />
            <div className="mt-3 flex items-center gap-3">
              <Skeleton className="size-7 rounded-full" />
              <Skeleton className="h-3 w-40" />
            </div>
            <div className="mt-6 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-11/12" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-5 w-28" />
        <div className="space-y-3">
          {[0, 1].map((index) => (
            <div key={index} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="flex items-center gap-2.5">
                <Skeleton className="size-7 rounded-full" />
                <Skeleton className="h-3 w-36" />
              </div>
              <SkeletonText lines={3} className="mt-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ProfileSkeleton({ className }) {
  return (
    <div className={classNames('space-y-6', className)} aria-label="Loading profile">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <Skeleton className="size-20 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-3 w-72" />
            <div className="flex flex-wrap gap-2 pt-1">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <Skeleton className="h-5 w-10" />
              <Skeleton className="mt-1.5 h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-28 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      <QuestionListSkeleton count={3} />
    </div>
  )
}

export function AdminDashboardSkeleton({ className }) {
  return (
    <div className={classNames('space-y-6', className)} aria-label="Loading dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <Skeleton className="size-9 rounded-lg" />
            <Skeleton className="mt-3 h-7 w-12" />
            <Skeleton className="mt-1.5 h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white shadow-card">
        <div className="space-y-0 divide-y divide-slate-200">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="flex gap-4 px-5 py-4">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="ml-auto h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}