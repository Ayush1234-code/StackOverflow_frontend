import { httpClient } from './client'

export const questionsApi = {
  list: (params) => httpClient.get('/questions', { params }),
  get: (id) => httpClient.get(`/questions/${id}`),
  create: (data) => httpClient.post('/questions', data),
  update: (id, data) => httpClient.patch(`/questions/${id}`, data),
  vote: (id, data) => httpClient.post(`/questions/${id}/vote`, data),
  remove: (id) => httpClient.delete(`/questions/${id}`),
  related: (id, params) => httpClient.get(`/questions/${id}/related`, { params }),
}

/**
 * Answer endpoints. Collection routes are nested under the question they
 * belong to (POST /api/questions/:questionId/answers), so they take the
 * question id; edits and deletes address the answer directly
 * (PATCH|DELETE /api/answers/:answerId).
 */
export const answersApi = {
  list: (questionId, params) =>
    httpClient.get(`/questions/${questionId}/answers`, { params }),
  create: (questionId, data) => httpClient.post(`/questions/${questionId}/answers`, data),
  update: (answerId, data) => httpClient.patch(`/answers/${answerId}`, data),
  remove: (answerId) => httpClient.delete(`/answers/${answerId}`),
  accept: (questionId, answerId) =>
    httpClient.post(`/questions/${questionId}/answers/${answerId}/accept`),
  vote: (questionId, answerId, data) =>
    httpClient.post(`/questions/${questionId}/answers/${answerId}/vote`, data),
}

export const commentsApi = {
  list: (params) => httpClient.get('/comments', { params }),
  create: (data) => httpClient.post('/comments', data),
  update: (commentId, data) => httpClient.patch(`/comments/${commentId}`, data),
  remove: (commentId) => httpClient.delete(`/comments/${commentId}`),
}

/** A user's saved questions. Every route is about the signed-in user's own list. */
export const bookmarksApi = {
  list: (params) => httpClient.get('/bookmarks', { params }),
  add: (questionId) => httpClient.post(`/bookmarks/${questionId}`),
  remove: (questionId) => httpClient.delete(`/bookmarks/${questionId}`),
}

/** Filing a report. Reading and deciding on them happens under adminApi. */
export const reportsApi = {
  list: (params) => httpClient.get('/reports', { params }),
  create: (data) => httpClient.post('/reports', data),
  resolve: (id) => httpClient.post(`/reports/${id}/resolve`),
}

/**
 * Admin moderation and analytics.
 *
 * These paths exist for convenience only. Access is decided entirely by the
 * backend: every one of them is behind `requireAdmin`, which verifies the JWT
 * and re-reads `role` from the database on each request. Hiding these buttons in
 * the UI is a usability measure, not a security control — a member who calls
 * them directly still gets a 403.
 */
export const adminApi = {
  stats: () => httpClient.get('/admin/stats'),
  analytics: (params) => httpClient.get('/admin/analytics', { params }),

  // The moderation queue. `status` accepts 'open' | 'resolved' | 'dismissed' | 'all'.
  reports: (params) => httpClient.get('/admin/reports', { params }),
  // A decision and the optional removal are one request; the backend only ever
  // removes the content stored on the report itself.
  resolveReport: (id, data) => httpClient.post(`/admin/reports/${id}/resolve`, data),
  dismissReport: (id, data) => httpClient.post(`/admin/reports/${id}/dismiss`, data),
  reopenReport: (id) => httpClient.post(`/admin/reports/${id}/reopen`),
  removeReportedContent: (id, data) => httpClient.post(`/admin/reports/${id}/remove-content`, data),

  // Account moderation. `status` accepts 'all' | 'active' | 'suspended' | 'admins'.
  users: (params) => httpClient.get('/admin/users', { params }),
  updateUser: (userId, data) => httpClient.patch(`/admin/users/${userId}`, data),
  deleteUser: (userId) => httpClient.delete(`/admin/users/${userId}`),

  // Direct content removal outside the report flow.
  removeContent: (contentType, contentId) =>
    httpClient.delete(`/admin/content/${contentType}/${contentId}`),
}

export const tagsApi = {
  list: (params) => httpClient.get('/tags', { params }),
}

/**
 * Public, database-aggregated community statistics. Backs the sidebar panel,
 * the footer and the home page so no page has to invent a number.
 */
export const statsApi = {
  get: () => httpClient.get('/stats'),
}

/**
 * Search and its filters. All filtering, sorting, relevance ranking and
 * pagination happen in MongoDB — the client passes parameters and renders what
 * comes back, it never filters a local list.
 */
export const searchApi = {
  search: (params) => httpClient.get('/search', { params }),
}

export const usersApi = {
  list: (params) => httpClient.get('/users', { params }),
  get: (userId) => httpClient.get(`/users/${userId}`),
  updateMe: (data) => httpClient.patch('/users/me', data),
  setStatus: (userId, data) => httpClient.patch(`/users/${userId}/status`, data),
  // Badges earned by one member.
  badges: (userId) => httpClient.get(`/users/${userId}/badges`),
  // The append-only reputation ledger behind the profile's reputation panel.
  reputation: (params) => httpClient.get('/users/me/reputation', { params }),
}

export const notificationsApi = {
  list: (params) => httpClient.get('/notifications', { params }),
  unreadCount: () => httpClient.get('/notifications/unread-count'),
  markRead: (notificationId) => httpClient.post(`/notifications/${notificationId}/read`),
  markAllRead: () => httpClient.post('/notifications/read-all'),
}

/** Badge catalogue and award state. */
export const badgesApi = {
  catalogue: (params) => httpClient.get('/badges', { params }),
}

/**
 * Immutable edit history.
 *
 * The backend derives the content id from the route, so these take no separate
 * contentId argument and a component cannot accidentally ask for one type's
 * history under another's id.
 */
export const revisionsApi = {
  questionHistory: (questionId, params) =>
    httpClient.get(`/questions/${questionId}/history`, { params }),
  questionVersion: (questionId, version) =>
    httpClient.get(`/questions/${questionId}/history/${version}`),
  answerHistory: (answerId, params) =>
    httpClient.get(`/answers/${answerId}/history`, { params }),
  answerVersion: (answerId, version) =>
    httpClient.get(`/answers/${answerId}/history/${version}`),
}

/**
 * Analytics. Every figure is aggregated in MongoDB at request time; an empty
 * database returns zeros and empty arrays rather than placeholder data.
 *
 * `/analytics/me` is scoped to the signed-in user on the server — there is no
 * user id to pass, so a member cannot read another member's numbers.
 */
export const analyticsApi = {
  me: (params) => httpClient.get('/analytics/me', { params }),
  myBadgeProgress: () => httpClient.get('/analytics/me/badges'),
  // Aggregate-only and safe for anonymous callers.
  overview: (params) => httpClient.get('/analytics/overview', { params }),
}

export const authApi = {
  login: (data) => httpClient.post('/auth/login', data),
  register: (data) => httpClient.post('/auth/register', data),
  // The token is passed explicitly because logout clears localStorage *before*
  // the request goes out; without this the request interceptor would find no
  // token and send an unauthenticated call that silently fails to revoke.
  logout: (token) =>
    httpClient.post('/auth/logout', null, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
  me: () => httpClient.get('/auth/me'),
}
