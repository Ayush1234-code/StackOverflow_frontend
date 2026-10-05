import { useState } from 'react'

import { Button } from '@/components/common/Button'
import { Textarea } from '@/components/common/Textarea'

export function CommentForm({
  onSubmit,
  disabled = false,
  placeholder = 'Add a comment…',
  buttonLabel = 'Add comment',
  initialValue = '',
}) {
  const [body, setBody] = useState(initialValue)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validate(value) {
    if (value.trim().length < 2) {
      return 'Comments should be at least 2 characters.'
    }
    if (value.trim().length > 600) {
      return 'Comments are limited to 600 characters.'
    }
    return null
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validate(body)
    setError(validationError)
    if (validationError) return

    setIsSubmitting(true)
    setError(null)
    try {
      await onSubmit(body.trim())
      setBody('')
    } catch (err) {
      setError(err.message || 'Could not post your comment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-1.5" noValidate>
      <div className="flex items-start gap-2">
        <Textarea
          rows={2}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={placeholder}
          aria-label="Comment"
          className="min-h-0 text-sm"
          error={Boolean(error)}
        />
        <Button type="submit" size="sm" className="shrink-0" loading={isSubmitting} disabled={disabled}>
          {buttonLabel}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </form>
  )
}