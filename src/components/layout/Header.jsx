import { useCallback, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Bell, Bookmark, ChevronDown, LogOut, Menu, PenLine, Search, Settings2, Shield, User as UserIcon, X } from 'lucide-react'

import { Avatar } from '@/components/common/Avatar'
import { Button } from '@/components/common/Button'
import { Logo } from '@/components/common/Logo'
import { Reputation } from '@/components/common/Reputation'
import { SearchInput } from '@/components/common/SearchInput'
import { Skeleton } from '@/components/common/Skeleton'
import { NotificationBell } from '@/features/notifications/NotificationBell'
import { useAuth } from '@/hooks/useAuth'
import { useDismissable } from '@/hooks/useDismissable'
import { classNames } from '@/utils/classNames'

function MenuItem({ to, icon: Icon, onNavigate, children }) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      role="menuitem"
      className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
    >
      <Icon className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
      {children}
    </Link>
  )
}

function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { open, toggle, close, containerRef } = useDismissable()

  function handleLogout() {
    logout()
    close()
    navigate('/')
  }

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className={classNames(
          'flex items-center gap-1.5 rounded-lg p-1 pr-1.5 transition-colors',
          open ? 'bg-slate-100' : 'hover:bg-slate-100',
        )}
      >
        <Avatar name={user?.name} size="sm" />
        <ChevronDown
          className={classNames(
            'size-3.5 text-slate-400 transition-transform',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-popover"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
            <Reputation value={user?.reputation} className="mt-1.5 text-xs" />
          </div>
          <div className="py-1.5">
            <MenuItem
              to={user?.id ? `/users/${user.id}` : '/users'}
              icon={UserIcon}
              onNavigate={close}
            >
              My profile
            </MenuItem>
            <MenuItem to="/bookmarks" icon={Bookmark} onNavigate={close}>
              Saved questions
            </MenuItem>
            <MenuItem to="/notifications" icon={Bell} onNavigate={close}>
              Notifications
            </MenuItem>
            <MenuItem to="/profile/edit" icon={Settings2} onNavigate={close}>
              Edit profile
            </MenuItem>
            {user?.role === 'admin' ? (
              <>
                <MenuItem to="/admin" icon={Shield} onNavigate={close}>
                  Admin dashboard
                </MenuItem>
                <MenuItem to="/admin/moderation" icon={Shield} onNavigate={close}>
                  Moderation
                </MenuItem>
              </>
            ) : null}
          </div>
          <div className="border-t border-slate-100 py-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-red-600"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Log out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function AuthActions() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <Skeleton className="h-8 w-28 shrink-0 rounded-lg" />
  if (isAuthenticated) return <UserMenu />

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <Button to="/login" variant="ghost" size="sm">
        Log in
      </Button>
      <Button to="/signup" size="sm">
        Sign up
      </Button>
    </div>
  )
}

/**
 * Global search. It is uncontrolled while you are elsewhere in the app and
 * hands control to the search results page (which owns the `?q` param) once
 * you land there, so the two inputs can never fight over the same state.
 */
function GlobalSearch() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const urlQuery = params.get('q') ?? ''
  const isSearchPage = location.pathname === '/search'

  const [term, setTerm] = useState(urlQuery)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // The URL owns the term whenever this page is showing it: on the search page
  // itself, and in the overlay once it opens. Adopting the URL value during
  // render (rather than in an effect) means there is no intermediate render
  // where the input still holds a stale query.
  const adoptsUrl = isSearchPage || isSearchOpen
  const [lastSynced, setLastSynced] = useState({ adopts: adoptsUrl, query: urlQuery })
  if (adoptsUrl && (lastSynced.query !== urlQuery || lastSynced.adopts !== adoptsUrl)) {
    setLastSynced({ adopts: adoptsUrl, query: urlQuery })
    setTerm(urlQuery)
  }

  const go = useCallback(
    (value) => {
      const trimmed = value.trim()
      setIsSearchOpen(false)
      if (isSearchPage) {
        if (trimmed !== urlQuery) {
          navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search', { replace: true })
        }
        return
      }
      navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search')
    },
    [isSearchPage, navigate, urlQuery],
  )

  return (
    <>
      <div className="hidden flex-1 sm:block sm:max-w-xl lg:max-w-2xl">
        <SearchInput
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          onClear={() => {
            setTerm('')
            go('')
          }}
          onSubmit={(event) => {
            event.preventDefault()
            go(term)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              go(event.currentTarget.value)
            }
          }}
          placeholder="Search questions…"
          aria-label="Search questions"
        />
      </div>

      {/* Compact search trigger for very small screens */}
      <button
        type="button"
        onClick={() => setIsSearchOpen((value) => !value)}
        aria-label={isSearchOpen ? 'Close search' : 'Open search'}
        aria-expanded={isSearchOpen}
        className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 sm:hidden"
      >
        {isSearchOpen ? (
          <X className="size-4" aria-hidden="true" />
        ) : (
          <Search className="size-4" aria-hidden="true" />
        )}
      </button>

      {isSearchOpen ? (
        <div className="absolute inset-x-0 top-14 border-b border-slate-200 bg-white px-4 py-3 shadow-card sm:hidden">
          <SearchInput
            value={term}
            size="md"
            autoFocus
            onChange={(event) => setTerm(event.target.value)}
            onClear={() => setTerm('')}
            onSubmit={(event) => {
              event.preventDefault()
              go(term)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                go(event.currentTarget.value)
              }
            }}
            placeholder="Search questions…"
            aria-label="Search questions"
          />
        </div>
      ) : null}
    </>
  )
}

export function Header({ onOpenNav }) {
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="relative flex h-full items-center gap-2 px-4 sm:gap-3 sm:px-5">
        <button
          type="button"
          onClick={onOpenNav}
          aria-label="Open navigation"
          className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <Menu className="size-[18px]" aria-hidden="true" />
        </button>

        <Link to="/" className="shrink-0" aria-label="StackFlow home">
          <Logo />
        </Link>

        <GlobalSearch />

<div className="ml-auto flex shrink-0 items-center gap-2">
        <Button to="/questions/ask" size="sm" className="hidden sm:inline-flex">
          <PenLine className="size-4" aria-hidden="true" />
          Ask question
        </Button>
        <NotificationBell />
        <AuthActions />
        </div>
      </div>
    </header>
  )
}
