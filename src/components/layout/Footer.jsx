import { Link } from 'react-router-dom'

import { Logo } from '@/components/common/Logo'
import { useAuth } from '@/hooks/useAuth'
import { APP_NAME, APP_TAGLINE, NAV_ADMIN, NAV_ITEMS } from '@/utils/constants'

const ACTION_LINKS = [
  { label: 'Ask a question', to: '/questions/ask' },
  { label: 'Search', to: '/search' },
]

/**
 * Full-width footer. The previous version re-declared its own copy of the
 * navigation (and told users the backend might be offline) and was also capped
 * at `max-w-7xl`, so it inherited both the width problem and the staleness
 * problem. It now renders from the same constants as the sidebar.
 */
export function Footer() {
  const { user } = useAuth()

  const accountLinks = user
    ? [
        { label: 'My profile', to: `/users/${user.id}` },
        { label: 'Edit profile', to: '/profile/edit' },
        ...(user.role === 'admin' ? [{ label: 'Admin dashboard', to: '/admin' }] : []),
        { label: 'Log out', to: '/login' },
      ]
    : [
        { label: 'Log in', to: '/login' },
        { label: 'Create account', to: '/signup' },
      ]

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="grid gap-8 px-4 py-10 sm:px-6 sm:py-12 md:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] lg:gap-10 lg:px-8">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-slate-500">{APP_TAGLINE}</p>
        </div>

        <nav aria-label="Community">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Community
          </h2>
          <ul className="mt-3 space-y-2">
            {NAV_ITEMS.filter((item) => item.to !== '/').map((link) => (
              <FooterLink key={link.to} to={link.to}>
                {link.label}
              </FooterLink>
            ))}
          </ul>
        </nav>

        <nav aria-label="Actions">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Actions
          </h2>
          <ul className="mt-3 space-y-2">
            {ACTION_LINKS.map((link) => (
              <FooterLink key={link.to} to={link.to}>
                {link.label}
              </FooterLink>
            ))}
          </ul>
        </nav>

        <nav aria-label="Account">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Account
          </h2>
          <ul className="mt-3 space-y-2">
            {accountLinks.map((link) => (
              <FooterLink key={link.to + link.label} to={link.to}>
                {link.label}
              </FooterLink>
            ))}
            {user?.role === 'admin'
              ? NAV_ADMIN.filter((item) => item.to !== '/admin').map((link) => (
                  <FooterLink key={link.to} to={link.to}>
                    {link.label}
                  </FooterLink>
                ))
              : null}
          </ul>
        </nav>
      </div>

      <div className="border-t border-slate-200 py-4">
        <p className="px-4 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
          &copy; {new Date().getFullYear()} {APP_NAME}
        </p>
      </div>
    </footer>
  )
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link
        to={to}
        className="text-sm text-slate-500 transition-colors hover:text-slate-900"
      >
        {children}
      </Link>
    </li>
  )
}
