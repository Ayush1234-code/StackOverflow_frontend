import { lazy } from 'react'

/**
 * Lazily-loaded route components.
 *
 * Every page is code-split so a first visit to the home page does not pay for
 * the admin dashboard, the markdown editor or the charts. These live apart from
 * `router.jsx` so that file stays a declarative route table with no component
 * definitions in it.
 */
export const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })))
export const QuestionsPage = lazy(() => import('@/pages/QuestionsPage').then((m) => ({ default: m.QuestionsPage })))
export const AskQuestionPage = lazy(() =>
  import('@/pages/AskQuestionPage').then((m) => ({ default: m.AskQuestionPage })),
)
export const QuestionDetailPage = lazy(() =>
  import('@/pages/QuestionDetailPage').then((m) => ({ default: m.QuestionDetailPage })),
)
export const EditQuestionPage = lazy(() =>
  import('@/pages/EditQuestionPage').then((m) => ({ default: m.EditQuestionPage })),
)
export const SearchResultsPage = lazy(() =>
  import('@/pages/SearchResultsPage').then((m) => ({ default: m.SearchResultsPage })),
)
export const TagsPage = lazy(() => import('@/pages/TagsPage').then((m) => ({ default: m.TagsPage })))
export const BookmarksPage = lazy(() => import('@/pages/BookmarksPage').then((m) => ({ default: m.BookmarksPage })))
export const UsersPage = lazy(() => import('@/pages/UsersPage').then((m) => ({ default: m.UsersPage })))
export const UserProfilePage = lazy(() =>
  import('@/pages/UserProfilePage').then((m) => ({ default: m.UserProfilePage })),
)
export const NotificationsPage = lazy(() =>
  import('@/pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })),
)
export const EditProfilePage = lazy(() =>
  import('@/pages/EditProfilePage').then((m) => ({ default: m.EditProfilePage })),
)
export const AdminDashboardPage = lazy(() =>
  import('@/pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
)
export const AdminModerationPage = lazy(() =>
  import('@/pages/AdminModerationPage').then((m) => ({ default: m.AdminModerationPage })),
)
export const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))
export const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
export const SignupPage = lazy(() => import('@/pages/SignupPage').then((m) => ({ default: m.SignupPage })))