import { useCallback, useState } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'

import { PageLoader } from '@/components/common/Spinner'
import { useAuth } from '@/hooks/useAuth'

import { Footer } from './Footer'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

/**
 * Application shell.
 *
 * The previous version wrapped everything in `mx-auto max-w-7xl`, which capped
 * the product at ~1280px and left large dead margins on both sides of a 1440p
 * display. The shell is now a full-viewport flex row:
 *
 *   [ header — full width            ]
 *   [ sidebar | main content (flex-1) ]
 *   [ footer — full width            ]
 *
 * The main column is `min-w-0 flex-1`, so it absorbs whatever width the fixed
 * 240px sidebar leaves behind. Pages that benefit from a second column opt in
 * to the rail themselves via <PageShell aside={...}>, which is why the rail
 * only appears on pages that have something real to put in it.
 */
export function AppLayout() {
  const { isLoading } = useAuth()
  const [navOpen, setNavOpen] = useState(false)

  const closeNav = useCallback(() => setNavOpen(false), [])

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>

      <Header onOpenNav={() => setNavOpen(true)} />

      <div className="flex w-full flex-1 items-start">
        <Sidebar open={navOpen} onClose={closeNav} />

        <main
          id="main-content"
          className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
        >
          {isLoading ? <PageLoader label="Restoring your session…" /> : <Outlet />}
        </main>
      </div>

      <Footer />

      <ScrollRestoration />
    </div>
  )
}
