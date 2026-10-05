import { useState } from 'react'
import { CheckCircle2, Flag } from 'lucide-react'

import { previewApi } from '@/api/previewAdapter'
import { Alert } from '@/components/common/Alert'
import { Button } from '@/components/common/Button'
import { Field } from '@/components/common/Field'
import { Modal } from '@/components/common/Modal'
import { Textarea } from '@/components/common/Textarea'
import { useAuth } from '@/hooks/useAuth'
import { REPORT_REASONS } from '@/utils/constants'

const CONTENT_LABELS = { question: 'question', answer: 'answer', comment: 'comment' }

export function ReportDialog({ open, onClose, contentType, contentId, contentSummary, onSubmitted }) {
  const { isAuthenticated } = useAuth()
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const label = CONTENT_LABELS[contentType] ?? 'content'

  async function handleSubmit(event) {
    event.preventDefault()
    if (!reason) {
      setError('Please select a reason.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await previewApi.reports.create({ contentType, contentId, reason, details: details.trim() })
      setSubmitted(true)
      onSubmitted?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Report content" size="md">
      {submitted ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="size-6" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Report submitted</h3>
            <p className="mt-1 text-sm text-slate-500">
              Thanks for helping keep StackFlow useful. Moderators review reported{' '}
              {CONTENT_LABELS[contentType] ?? 'content'}.
            </p>
          </div>
          <Button onClick={onClose} variant="secondary">
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <p className="text-sm leading-relaxed text-slate-600">
            You are reporting this {label}
            {contentSummary ? (
              <>
                {' '}
                — <span className="font-medium text-slate-800">{contentSummary}</span>
              </>
            ) : null}
            .
          </p>

          {!isAuthenticated && (
            <Alert tone="info">
              You are not logged in. Please <a href="/login" className="font-medium underline underline-offset-2">log in</a> so
              moderators can reach you if they need more details.
            </Alert>
          )}

          {error && <Alert tone="danger">{error}</Alert>}

          <fieldset>
            <legend className="text-sm font-medium text-slate-700">
              Why are you reporting this {label}?
            </legend>
            <div className="mt-2 space-y-2">
              {REPORT_REASONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition-colors has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50/60"
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={option.value}
                    checked={reason === option.value}
                    onChange={() => setReason(option.value)}
                    className="size-4 accent-brand-600"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <Field
            label="Details (optional)"
            hint="Add context the moderator should know. Keep it concise."
          >
            <Textarea
              rows={3}
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              maxLength={1000}
              placeholder="e.g. The answer promotes a paid service and includes spam links."
            />
          </Field>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} icon={Flag}>
              Submit report
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}

export function ReportButton({ contentType, contentId, contentSummary, className, label }) {
  const [open, setOpen] = useState(false)
  const [reported, setReported] = useState(false)

  function handleSubmitted() {
    setReported(true)
    window.setTimeout(() => setReported(false), 4000)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={reported}
        className={
          className ??
          'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-70'
        }
      >
        {reported ? (
          <>
            <CheckCircle2 className="size-3.5 text-emerald-600" aria-hidden="true" />
            Reported — thanks
          </>
        ) : (
          <>
            <Flag className="size-3.5" aria-hidden="true" />
            {label ?? 'Report'}
          </>
        )}
      </button>
      <ReportDialog
        open={open}
        onClose={() => setOpen(false)}
        contentType={contentType}
        contentId={contentId}
        contentSummary={contentSummary}
        onSubmitted={handleSubmitted}
      />
    </>
  )
}