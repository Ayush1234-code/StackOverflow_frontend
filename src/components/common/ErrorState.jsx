import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/common/Button'

export function ErrorState({ title = 'Something went wrong', error, onRetry, className }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-red-200 bg-white px-6 py-14 text-center ${className ?? ''}`}
    >
      <div className="grid size-12 place-items-center rounded-full bg-red-50 text-red-500">
        <AlertTriangle className="size-6" strokeWidth={1.8} aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">
        {error?.message || 'An unexpected error occurred.'}
      </p>
      {onRetry && (
        <Button variant="secondary" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}