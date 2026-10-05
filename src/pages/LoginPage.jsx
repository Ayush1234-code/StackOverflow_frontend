import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'

import { Alert } from '@/components/common/Alert'
import { Button } from '@/components/common/Button'
import { Card, CardBody } from '@/components/common/Card'
import { Field } from '@/components/common/Field'
import { Input } from '@/components/common/Input'
import { PasswordInput } from '@/components/common/PasswordInput'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { APP_NAME } from '@/utils/constants'
import { isValidEmail, normalizeErrorMessage } from '@/utils/validation'

export function LoginPage() {
  useDocumentTitle('Log in')

  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = typeof location.state?.from === 'string' ? location.state.from : '/'

  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  if (isAuthenticated && !submitting && !redirecting) {
    return <Navigate to="/" replace />
  }

  function validate() {
    const next = {}
    if (!isValidEmail(values.email)) next.email = 'Enter a valid email address.'
    if (!values.password) next.password = 'Enter your password.'
    return next
  }

  function handleChange(field) {
    return (event) => {
      const next = event.target.value
      setValues((current) => ({ ...current, [field]: next }))
      setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current))
      if (submitError) setSubmitError(null)
    }
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
      await login({ email: values.email.trim(), password: values.password })
      setSubmitting(false)
      setRedirecting(true)
      navigate(from, { replace: true })
    } catch (err) {
      setSubmitError(
        normalizeErrorMessage(
          err,
          'We could not log you in. Check your email and password and try again.',
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
            <p className="text-sm text-slate-500">
              Log in to ask questions, share answers, and vote on content.
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

            <Field label="Email" htmlFor="login-email" required error={errors.email}>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={values.email}
                onChange={handleChange('email')}
                placeholder="you@example.com"
                required
                error={errors.email}
              />
            </Field>

            <Field label="Password" htmlFor="login-password" required error={errors.password}>
              <PasswordInput
                id="login-password"
                autoComplete="current-password"
                value={values.password}
                onChange={handleChange('password')}
                placeholder="Enter your password"
                required
                error={errors.password}
              />
            </Field>

            <Button type="submit" className="w-full" size="lg" loading={submitting} icon={LogIn}>
              Log in
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            New to {APP_NAME}?{' '}
            <Link
              to="/signup"
              className="font-semibold text-brand-700 transition-colors hover:text-brand-800"
            >
              Create an account
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}