import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save } from 'lucide-react'

import { previewApi } from '@/api/previewAdapter'
import { Alert } from '@/components/common/Alert'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/common/Button'
import { Card, CardBody } from '@/components/common/Card'
import { Field } from '@/components/common/Field'
import { Input } from '@/components/common/Input'
import { Textarea } from '@/components/common/Textarea'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

function validateOne(value, { maxLength, pattern, label }) {
  const trimmed = String(value ?? '').trim()
  if (trimmed.length > maxLength) {
    return `${label} is limited to ${maxLength} characters.`
  }
  if (trimmed && pattern && !pattern.test(trimmed)) {
    return `${label} is not a valid URL.`
  }
  return null
}

export function EditProfilePage() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  useDocumentTitle('Edit profile')

  const [name, setName] = useState(user?.name ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [location, setLocation] = useState(user?.location ?? '')
  const [website, setWebsite] = useState(user?.website ?? '')
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const canSubmit = Boolean(name.trim())

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {
      name: validateOne(name, { maxLength: 60, label: 'Display name' }),
      location: validateOne(location, { maxLength: 80, label: 'Location' }),
      website: validateOne(website, { maxLength: 200, label: 'Website', pattern: /^https?:\/\/\S+$/i }),
      bio: validateOne(bio, { maxLength: 500, label: 'Bio' }),
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setError(null)
    setSuccess(false)
    setIsSaving(true)
    try {
      const result = await previewApi.users.updateMe({
        name,
        bio,
        location,
        website,
      })
      const updated = result?.user ?? result
      if (updated) updateUser(updated)
      setSuccess(true)
      window.setTimeout(() => navigate(`/users/${updated?.id ?? user?.id}`), 1200)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Users', to: '/users' },
          user ? { label: user.name, to: `/users/${user.id}` } : null,
          { label: 'Edit profile' },
        ].filter(Boolean)}
      />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit profile</h1>
        <p className="mt-1 text-sm text-slate-600">
          Update the details shown on your public profile.
        </p>
      </div>

      {success && (
        <Alert tone="success">
          Profile saved. Taking you to your profile…
        </Alert>
      )}
      {error && <Alert tone="danger">{error}</Alert>}

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Field label="Display name" htmlFor="edit-name" required hint="Shown beside your questions and answers." error={errors.name}>
              <Input
                id="edit-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={60}
                placeholder="Your name"
                error={Boolean(errors.name)}
              />
            </Field>

            <Field label="Location" htmlFor="edit-location" hint="Optional, e.g. “Berlin, Germany”." error={errors.location}>
              <Input
                id="edit-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                maxLength={80}
                placeholder="City, country"
                error={Boolean(errors.location)}
              />
            </Field>

            <Field
              label="Website"
              htmlFor="edit-website"
              hint="Optional. Must start with http:// or https://."
              error={errors.website}
            >
              <Input
                id="edit-website"
                type="url"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                maxLength={200}
                placeholder="https://example.com"
                error={Boolean(errors.website)}
              />
            </Field>

            <Field
              label="Bio"
              htmlFor="edit-bio"
              hint="A short introduction (up to 500 characters). Shown on your profile."
              error={errors.bio}
            >
              <Textarea
                id="edit-bio"
                rows={4}
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                maxLength={500}
                placeholder="Tell the community a little about yourself…"
                error={Boolean(errors.bio)}
              />
            </Field>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button to={`/users/${user?.id ?? 'users'}`} variant="secondary" disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" loading={isSaving} icon={Save} disabled={!canSubmit}>
                Save changes
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}