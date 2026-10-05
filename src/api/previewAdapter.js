// ============================================================================
// API SURFACE ALIAS — THERE IS NO MOCK LAYER.
//
// The app previously used a temporary preview adapter that tried the real
// backend first and silently fell back to clearly-marked mock data when the
// backend was unreachable. That masking is gone: every call below goes
// straight to the real API, and genuine errors (network, 4xx, 5xx) are
// surfaced as-is. The mock module itself has been deleted, so there is no
// longer any code path that can invent data.
//
// The `previewApi` name is kept so pages and components did not need to change;
// it is simply a thin, stable alias over the real client in src/api/endpoints.
// `previewActive` is now constant (false), so PreviewNotice never renders.
// ============================================================================

import {
  adminApi,
  analyticsApi,
  answersApi,
  authApi,
  badgesApi,
  bookmarksApi,
  commentsApi,
  notificationsApi,
  questionsApi,
  reportsApi,
  revisionsApi,
  searchApi,
  statsApi,
  tagsApi,
  usersApi,
} from './endpoints'

const PREVIEW_ACTIVE = false
const listeners = new Set()

export const previewStore = {
  subscribe(callback) {
    listeners.add(callback)
    return () => listeners.delete(callback)
  },
  getSnapshot() {
    return PREVIEW_ACTIVE
  },
}

export const previewApi = {
  questions: {
    list: (params) => questionsApi.list(params),
    get: (id) => questionsApi.get(id),
    create: (data) => questionsApi.create(data),
    update: (id, data) => questionsApi.update(id, data),
    vote: (id, data) => questionsApi.vote(id, data),
    remove: (id) => questionsApi.remove(id),
    related: (id, params) => questionsApi.related(id, params),
    history: (id, params) => revisionsApi.questionHistory(id, params),
    version: (id, version) => revisionsApi.questionVersion(id, version),
  },
  answers: {
    list: (questionId, params) => answersApi.list(questionId, params),
    create: (questionId, data) => answersApi.create(questionId, data),
    update: (answerId, data) => answersApi.update(answerId, data),
    remove: (answerId) => answersApi.remove(answerId),
    accept: (questionId, answerId) => answersApi.accept(questionId, answerId),
    vote: (questionId, answerId, data) => answersApi.vote(questionId, answerId, data),
    history: (answerId, params) => revisionsApi.answerHistory(answerId, params),
    version: (answerId, version) => revisionsApi.answerVersion(answerId, version),
  },
  bookmarks: {
    list: (params) => bookmarksApi.list(params),
    add: (questionId) => bookmarksApi.add(questionId),
    remove: (questionId) => bookmarksApi.remove(questionId),
  },
  comments: {
    list: (params) => commentsApi.list(params),
    create: (data) => commentsApi.create(data),
    update: (commentId, data) => commentsApi.update(commentId, data),
    remove: (commentId) => commentsApi.remove(commentId),
  },
  reports: {
    list: (params) => reportsApi.list(params),
    create: (data) => reportsApi.create(data),
    resolve: (id) => reportsApi.resolve(id),
  },
  tags: {
    list: (params) => tagsApi.list(params),
  },
  users: {
    list: (params) => usersApi.list(params),
    get: (id) => usersApi.get(id),
    profile: (id) => usersApi.get(id),
    updateMe: (data) => usersApi.updateMe(data),
    badges: (id) => usersApi.badges(id),
    reputation: (params) => usersApi.reputation(params),
  },
  notifications: {
    list: (params) => notificationsApi.list(params),
    unreadCount: () => notificationsApi.unreadCount(),
    markRead: (id) => notificationsApi.markRead(id),
    markAllRead: () => notificationsApi.markAllRead(),
  },
  badges: {
    catalogue: (params) => badgesApi.catalogue(params),
  },
  search: {
    query: (params) => searchApi.search(params),
  },
  stats: {
    get: () => statsApi.get(),
  },
  analytics: {
    me: (params) => analyticsApi.me(params),
    myBadgeProgress: () => analyticsApi.myBadgeProgress(),
    overview: (params) => analyticsApi.overview(params),
  },
  /**
   * Moderation.
   *
   * These call the dedicated `/api/admin` endpoints rather than the author-facing
   * delete routes. That is not a formality: an admin removing a question is a
   * moderation action that must be authorized and audited as one, and going
   * through `questionsApi.remove` would present it as the moderator editing
   * their own post. Every call here is refused with 403 unless the backend
   * confirms `role === 'admin'` from the database.
   */
  moderation: {
    list: (params) => adminApi.reports(params),
    stats: () => adminApi.stats(),
    analytics: (params) => adminApi.analytics(params),
    users: (params) => adminApi.users(params),
    resolveReport: (id, data) => adminApi.resolveReport(id, data),
    dismissReport: (id, data) => adminApi.dismissReport(id, data),
    reopenReport: (id) => adminApi.reopenReport(id),
    removeReportedContent: (id, data) => adminApi.removeReportedContent(id, data),
    setUserStatus: (userId, data) => adminApi.updateUser(userId, data),
    deleteUser: (userId) => adminApi.deleteUser(userId),
    deleteContent: (contentType, contentId) => adminApi.removeContent(contentType, contentId),
  },
  auth: {
    login: (data) => authApi.login(data),
    register: (data) => authApi.register(data),
    logout: (token) => authApi.logout(token),
    me: () => authApi.me(),
  },
  overview: () =>
    Promise.all([
      questionsApi.list({ limit: 100 }),
      tagsApi.list({ limit: 100 }),
      usersApi.list({ limit: 100 }),
    ]).then(([questionsResult, tagsResult, usersResult]) => ({
      questions: questionsResult?.questions ?? questionsResult?.items ?? [],
      tags: tagsResult?.tags ?? tagsResult?.items ?? [],
      users: usersResult?.users ?? usersResult?.items ?? [],
    })),
}
