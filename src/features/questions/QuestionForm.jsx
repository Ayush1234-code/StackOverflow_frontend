import { useState } from 'react'

import { Button } from '@/components/common/Button'
import { Field } from '@/components/common/Field'
import { Input } from '@/components/common/Input'
import { Textarea } from '@/components/common/Textarea'
import { MAX_TAGS } from '@/utils/constants'

export function QuestionForm({ onSubmit, initialValues = {}, submitLabel = 'Post your question' }) {
  const [values, setValues] = useState({
    title: initialValues.title ?? '',
    body: initialValues.body ?? '',
    tags: initialValues.tags ?? '',
  })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(field) {
    return (event) => setValues((current) => ({ ...current, [field]: event.target.value }))
  }

  function validate() {
    const nextErrors = {}
    const trimmed = { ...values, tags: values.tags.trim() }
    const tagList = parseTags(values.tags)

    if (trimmed.title.trim().length < 15) {
      nextErrors.title = 'Please write a title of at least 15 characters.'
    }
    if (trimmed.body.trim().length < 30) {
      nextErrors.body = 'Please describe the problem in at least 30 characters.'
    }
    if (tagList.length === 0) {
      nextErrors.tags = 'Add at least one tag.'
    } else if (tagList.length > MAX_TAGS) {
      nextErrors.tags = `You can use at most ${MAX_TAGS} tags.`
    }
    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit({
        title: values.title.trim(),
        body: values.body.trim(),
        tags: parseTags(values.tags),
      })
    } catch (err) {
      setSubmitError(err.message || 'Could not save your question.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {submitError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          {submitError}
        </div>
      )}

      <Field
        label="Title"
        htmlFor="question-title"
        required
        hint="Be specific and describe the problem in a phrase."
        error={errors.title}
      >
        <Input
          id="question-title"
          value={values.title}
          onChange={handleChange('title')}
          placeholder="e.g. How do I debounce a search input in React?"
          error={errors.title}
        />
      </Field>

      <Field
        label="Body"
        htmlFor="question-body"
        required
        hint="Include what you expected, what happened, and any code you tried."
        error={errors.body}
      >
        <Textarea
          id="question-body"
          rows={12}
          value={values.body}
          onChange={handleChange('body')}
          placeholder="Explain the problem in detail so others can reproduce it…"
          error={errors.body}
        />
      </Field>

      <Field
        label="Tags"
        htmlFor="question-tags"
        required
        hint={`Comma-separated, up to ${MAX_TAGS}. e.g. react, vite, axios`}
        error={errors.tags}
      >
        <Input
          id="question-tags"
          value={values.tags}
          onChange={handleChange('tags')}
          placeholder="react, vite, axios"
          error={errors.tags}
        />
      </Field>

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

function parseTags(raw) {
  return [
    ...new Set(
      raw
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    ),
  ]
}