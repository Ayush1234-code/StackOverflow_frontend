import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Bookmark,
  House,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PenLine,
  Settings2,
  ShieldAlert,
  Tags,
  Users,
  X,
} from 'lucide-react'

import { Avatar } from '@/components/common/Avatar'
import { Button } from '@/components/common/Button'
import { Reputation } from '@/components/common/Reputation'
import { useAuth } from '@/hooks/useAuth'
import { classNames } from '@/utils/classNames'
import { NAV_ADMIN, NAV_ITEMS } from '@/utils/constants'

const ICONS = { House, MessageSquare, Tags, Users, LayoutDashboard, ShieldAlert }

function navItemClasses({ isActive }) {
  return classNames(
    'group relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-brand-50 text-brand-800 before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-brand-600'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  )
}

function NavSection({ label, items, onNavigate }) {
  return (
    <div>
      <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const Icon = ICONS[item.icon] ?? House
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={navItemClasses}
              >
                <Icon className="size-4 shrink-0 text-current opacity-70 group-hover:opacity-100" aria-hidden="true" />
                {item.label}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function UserPanel({ onNavigate }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  if (isLoading) {
    return (
      <div className="rounded-md border border-slate-200 p-3">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-md border border-slate-200 bg-slate-50/70 p-3">
        <p className="text-[13px] font-medium text-slate-700">Join the community</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
          Ask questions and share what you know.
        </p>
        <div className="mt-2.5 flex gap-2">
          <Button to="/signup" size="sm" onClick={onNavigate} className="flex-1">
            Sign up
          </Button>
          <Button to="/login" variant="secondary" size="sm" onClick={onNavigate}>
            Log in
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50/70 p-3">
      <div className="flex items-center gap-2.5">
        <Avatar name={user?.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-slate-900">{user?.name}</p>
          <Reputation value={user?.reputation} className="text-[11px]" />
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-1">
        <NavLink
          to={user?.id ? `/users/${user.id}` : '/users'}
          onClick={onNavigate}
          className="flex-1 rounded-md px-2 py-1.5 text-center text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200/70 hover:text-slate-900"
        >
          Profile
        </NavLink>
        <NavLink
          to="/bookmarks"
          onClick={onNavigate}
          aria-label="Saved questions"
          title="Saved questions"
          className="grid size-7 place-items-center rounded-md text-slate-500 transition-colors hover:bg-slate-200/70 hover:text-slate-900"
        >
          <Bookmark className="size-3.5" aria-hidden="true" />
        </NavLink>
        <NavLink
          to="/profile/edit"
          onClick={onNavigate}
          aria-label="Edit profile"
          title="Edit profile"
          className="grid size-7 place-items-center rounded-md text-slate-500 transition-colors hover:bg-slate-200/70 hover:text-slate-900"
        >
          <Settings2 className="size-3.5" aria-hidden="true" />
        </NavLink>
        <button
          type="button"
          onClick={() => {
            logout()
            onNavigate?.()
          }}
          aria-label="Log out"
          title="Log out"
          className="grid size-7 place-items-center rounded-md text-slate-500 transition-colors hover:bg-slate-200/70 hover:text-red-600"
        >
          <LogOut className="size-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

/**
 * Application sidebar.
 *
 * The same navigation tree renders both the desktop rail (`lg:` and up — sticky,
 * full viewport height) and the off-canvas drawer below `lg`, so mobile
 * navigation can never drift away from desktop navigation.
 */
export function Sidebar({ open = false, onClose }) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (!open) return undefined
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const navigation = (
    <div className="flex h-full flex-col gap-5 overflow-y-auto px-3 py-4">
      <Button to="/questions/ask" size="sm" onClick={onClose} className="w-full">
        <PenLine className="size-4" aria-hidden="true" />
        Ask question
      </Button>

      <nav className="flex flex-col gap-5" aria-label="Main">
        <NavSection label="Browse" items={NAV_ITEMS} onNavigate={onClose} />
        {isAdmin ? <NavSection label="Administration" items={NAV_ADMIN} onNavigate={onClose} /> : null}
      </nav>

      <div className="mt-auto pt-2">
        <UserPanel onNavigate={onClose} />
      </div>
    </div>
  )

  return (
    <>
      <aside
        className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 border-r border-slate-200 bg-slate-50/60 lg:block"
        aria-label="Sidebar"
      >
        {navigation}
      </aside>

      <div className={classNames('lg:hidden', !open && 'pointer-events-none')} aria-hidden={!open}>
        <div
          onClick={onClose}
          className={classNames(
            'fixed inset-0 z-40 bg-slate-900/40 transition-opacity duration-200',
            open ? 'opacity-100' : 'opacity-0',
          )}
        />
        <aside
          className={classNames(
            'fixed inset-y-0 left-0 z-50 flex w-[17rem] max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-popover transition-transform duration-200 ease-out',
            open ? 'translate-x-0' : '-translate-x-full',
          )}
          aria-label="Navigation"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
            <span className="text-sm font-semibold text-slate-900">Navigation</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className="grid size-8 place-items-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
          <div className="min-h-0 flex-1">{navigation}</div>
        </aside>
      </div>
    </>
  )
}
