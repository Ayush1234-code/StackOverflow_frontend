import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'

import { Alert } from '@/components/common/Alert'
import { Button } from '@/components/common/Button'
import { Card, CardBody } from '@/components/common/Card'
import { Field } from '@/components/common/Field'
import { Input } from '@/components/common/Input'
import { PasswordInput } from '@/components/common/PasswordInput'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { classNames } from '@/utils/classNames'
import {
  isValidEmail,
  isValidPassword,
  MAX_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  normalizeErrorMessage,
  passwordStrength,
  PASSWORD_STRENGTH_LABELS,
} from '@/utils/validation'

const STRENGTH_FILLS = ['bg-slate-300', 'bg-red-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500']

function PasswordStrength({ score }) {
  const label = PASSWORD_STRENGTH_LABELS[score]
  return (
    <div className="mt-1.5" aria-live="polite">
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className={classNames('h-1 flex-1 rounded-full', segment <= score ? STRENGTH_FILLS[score] : 'bg-slate-200')}
          />
        ))}
      </div>
      <p className={classNames('mt-1 text-xs', score <= 1 ? 'text-red-500' : score === 2 ? 'text-amber-600' : 'text-emerald-600')}>
        {label}
      </p>
    </div>
  )
}

export function SignupPage() {
  useDocumentTitle('Create an account')

  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = typeof location.state?.from === 'string' ? location.state.from : '/'

  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' })
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  if (isAuthenticated && !submitting && !redirecting) {
    return <Navigate to="/" replace />
  }

  function validate() {
    const next = {}
    const name = values.name.trim()
    if (name.length < 2) next.name = 'Enter a display name of at least 2 characters.'
    else if (name.length > MAX_NAME_LENGTH) next.name = `Keep your display name under ${MAX_NAME_LENGTH} characters.`
    if (!isValidEmail(values.email)) next.email = 'Enter a valid email address.'
    if (!isValidPassword(values.password)) {
      next.password = `Use a password of at least ${MIN_PASSWORD_LENGTH} characters.`
    }
    if (values.confirm !== values.password) next.confirm = 'Passwords do not match.'
    if (!acceptedTerms) next.terms = 'Please accept the terms to create an account.'
    return next
  }

  function handleChange(field) {
    return (event) => {
      setValues((current) => ({ ...current, [field]: event.target.value }))
      setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current))
      if (submitError) setSubmitError(null)
    }
  }

  function handleTermsChange(event) {
    setAcceptedTerms(event.target.checked)
    setErrors((current) => (current.terms ? { ...current, terms: undefined } : current))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting) return

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitError(null)
    setSubmitting(true)
    try {
      await register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      })
      setSubmitting(false)
      setRedirecting(true)
      navigate(from, { replace: true })
    } catch (err) {
      setSubmitError(
        normalizeErrorMessage(
          err,
          'We could not create your account. Please try again.',
        ),
      )
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create an account</h1>
            <p className="text-sm text-slate-500">
              Join the community to ask questions and share answers.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            aria-busy={submitting}
            className="mt-6 space-y-4"
          >
            {submitError && (
              <Alert tone="danger" role="alert">
                {submitError}
              </Alert>
            )}

            <Field
              label="Display name"
              htmlFor="signup-name"
              required
              hint="Others will see this next to your questions."
              error={errors.name}
            >
              <Input
                id="signup-name"
                value={values.name}
                onChange={handleChange('name')}
                placeholder="Jane Doe"
                autoComplete="name"
                maxLength={MAX_NAME_LENGTH}
                error={errors.name}
              />
            </Field>

            <Field label="Email" htmlFor="signup-email" required error={errors.email}>
              <Input
                id="signup-email"
                type="email"
                inputMode="email"
                value={values.email}
                onChange={handleChange('email')}
                placeholder="you@example.com"
                autoComplete="email"
                error={errors.email}
              />
            </Field>

            <Field
              label="Password"
              htmlFor="signup-password"
              required
              hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
              error={errors.password}
            >
              <PasswordInput
                id="signup-password"
                autoComplete="new-password"
                value={values.password}
                onChange={handleChange('password')}
                placeholder="Create a password"
                required
                error={errors.password}
              />
              {values.password && (
                <PasswordStrength score={passwordStrength(values.password)} />
              )}
            </Field>

            <Field label="Confirm password" htmlFor="signup-confirm" required error={errors.confirm}>
              <PasswordInput
                id="signup-confirm"
                autoComplete="new-password"
                value={values.confirm}
                onChange={handleChange('confirm')}
                placeholder="Repeat your password"
                required
                error={errors.confirm}
              />
            </Field>

            <div>
              <label className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={handleTermsChange}
                  className="mt-0.5 size-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-2 focus:ring-brand-600/30"
                />
                <span>
                  I agree to the{' '}
                  <span className="font-medium text-slate-800">Terms of Use</span> and{' '}
                  <span className="font-medium text-slate-800">Privacy Policy</span>.
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.terms}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" loading={submitting} icon={UserPlus}>
              Create account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-brand-700 transition-colors hover:text-brand-800"
            >
              Log in
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}