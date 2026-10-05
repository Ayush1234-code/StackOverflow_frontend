export const MIN_PASSWORD_LENGTH = 8
export const MAX_NAME_LENGTH = 60

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value) {
  return EMAIL_PATTERN.test((value ?? '').trim())
}

export function isValidPassword(value) {
  return (value ?? '').length >= MIN_PASSWORD_LENGTH
}

export function passwordStrength(value = '') {
  let score = 0
  if (value.length >= MIN_PASSWORD_LENGTH) score += 1
  if (value.length >= 12) score += 1
  if (/[A-Za-z]/.test(value) && /\d/.test(value)) score += 1
  if (/[^A-Za-z0-9]/.test(value)) score += 1
  return Math.min(score, 4)
}

export const PASSWORD_STRENGTH_LABELS = {
  0: 'Too short',
  1: 'Weak',
  2: 'Okay',
  3: 'Good',
  4: 'Strong',
}

export function normalizeErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback
  if (typeof error === 'string') return error
  if (Array.isArray(error.errors) && error.errors.length) {
    return error.errors
      .map((entry) => (typeof entry === 'string' ? entry : entry?.message ?? entry?.msg))
      .filter(Boolean)
      .join(' ')
  }
  if (typeof error.message === 'string') return error.message
  return fallback
}