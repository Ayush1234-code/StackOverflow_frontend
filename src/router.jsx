import { Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import { PageLoader } from '@/components/common/Spinner'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { RequireAdmin, RequireAuth } from '@/components/routing/ProtectedRoute'
import {
  AdminDashboardPage,
  AdminModerationPage,
  AskQuestionPage,
  BookmarksPage,
  EditProfilePage,
  EditQuestionPage,
  HomePage,
  LoginPage,
  NotFoundPage,
  NotificationsPage,
  QuestionDetailPage,
  QuestionsPage,
  SearchResultsPage,
  SignupPage,
  TagsPage,
  UserProfilePage,
  UsersPage,
} from '@/lazyPages'

/**
 * Wraps a lazily-loaded page in the shared loading fallback, so a chunk that has
 * not arrived yet looks like the rest of the product's loading states.
 */
function page(Component) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  )
}

/**
 * Route table. Every page is code-split and mounted behind the shared loading
 * fallback, so the initial bundle carries only the shell plus the current page.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: page(HomePage) },
      { path: 'questions', element: page(QuestionsPage) },
      {
        path: 'questions/ask',
        element: <RequireAuth />,
        children: [{ index: true, element: page(AskQuestionPage) }],
      },
      { path: 'questions/:id', element: page(QuestionDetailPage) },
      {
        path: 'questions/:id/edit',
        element: <RequireAuth />,
        children: [{ index: true, element: page(EditQuestionPage) }],
      },
      { path: 'search', element: page(SearchResultsPage) },
      { path: 'tags', element: page(TagsPage) },
      {
        path: 'bookmarks',
        element: <RequireAuth />,
        children: [{ index: true, element: page(BookmarksPage) }],
      },
      { path: 'users', element: page(UsersPage) },
      { path: 'users/:id', element: page(UserProfilePage) },
      {
        path: 'notifications',
        element: <RequireAuth />,
        children: [{ index: true, element: page(NotificationsPage) }],
      },
      {
        path: 'profile/edit',
        element: <RequireAuth />,
        children: [{ index: true, element: page(EditProfilePage) }],
      },
      {
        path: 'admin',
        element: <RequireAdmin />,
        children: [
          { index: true, element: page(AdminDashboardPage) },
          { path: 'moderation', element: page(AdminModerationPage) },
        ],
      },
      { path: '*', element: page(NotFoundPage) },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: page(LoginPage) },
      { path: 'signup', element: page(SignupPage) },
    ],
  },
])