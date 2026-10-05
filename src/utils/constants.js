export const APP_NAME = 'StackFlow'

export const APP_TAGLINE =
  'A moderated community for developers to ask questions, share knowledge, and learn together.'

/**
 * Single source of truth for navigation. The sidebar, the mobile drawer and the
 * footer all render from these lists, so a route can never appear in one place
 * and be missing from another.
 */
export const NAV_ITEMS = [
  { label: 'Home', to: '/', icon: 'House', end: true },
  { label: 'Questions', to: '/questions', icon: 'MessageSquare' },
  { label: 'Tags', to: '/tags', icon: 'Tags' },
  { label: 'Members', to: '/users', icon: 'Users' },
]

export const NAV_ADMIN = [
  { label: 'Dashboard', to: '/admin', icon: 'LayoutDashboard', end: true },
  { label: 'Moderation', to: '/admin/moderation', icon: 'ShieldAlert' },
]

export const MAX_TAGS = 5

export const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or advertising' },
  { value: 'abusive', label: 'Abusive or harassing language' },
  { value: 'off-topic', label: 'Off-topic or unclear' },
  { value: 'low-quality', label: 'Low quality content' },
  { value: 'copyright', label: 'Copyright violation' },
  { value: 'other', label: 'Something else' },
]

export const REPORT_CONTENT_TYPES = [
  { value: 'question', label: 'Question' },
  { value: 'answer', label: 'Answer' },
  { value: 'comment', label: 'Comment' },
]

/** Sort options for the question lists. `key` is the value sent to the API. */
export const QUESTION_SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'active', label: 'Active' },
  { value: 'unanswered', label: 'Unanswered' },
  { value: 'votes', label: 'Top voted' },
  { value: 'answers', label: 'Most answered' },
]

export const TAG_SORTS = [
  { value: 'popular', label: 'Popular' },
  { value: 'name', label: 'Name' },
  { value: 'newest', label: 'Newest' },
]

export const MEMBER_SORTS = [
  { value: 'reputation', label: 'Reputation' },
  { value: 'questions', label: 'Questions' },
  { value: 'answers', label: 'Answers' },
  { value: 'newest', label: 'Newest' },
  { value: 'name', label: 'Name' },
]

/**
 * Answer orderings understood by `GET /api/questions/:id/answers?sort=`.
 * The values are the API's own keys so the tab and the request can never
 * drift apart. The server keeps the accepted answer pinned to the top of
 * every one of these.
 */
export const ANSWER_SORTS = [
  { value: 'votes', label: 'Highest voted' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'activity', label: 'Recently active' },
]
