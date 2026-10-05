import { Link, Outlet, ScrollRestoration } from 'react-router-dom'
import { Code2, ShieldCheck, Zap } from 'lucide-react'

import { Logo } from '@/components/common/Logo'
import { APP_NAME, APP_TAGLINE } from '@/utils/constants'

const highlights = [
  {
    icon: Code2,
    title: 'Rich question bodies',
    text: 'Markdown preview, syntax-highlighted code blocks, and embed-ready examples.',
  },
  {
    icon: ShieldCheck,
    title: 'Community moderation',
    text: 'Report tools and a moderation queue keep discussions safe and on track.',
  },
  {
    icon: Zap,
    title: 'Reputation & ownership',
    text: 'Earn reputation for useful answers and accept the best response to your question.',
  },
]

export function AuthLayout() {
  return (
    <div className="flex min-h-dvh bg-slate-50">
      <a
        href="#auth-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <aside className="relative hidden w-1/2 max-w-xl flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-slate-900 p-10 text-white lg:flex">
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-brand-500/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -right-16 size-96 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="relative">
          <Link to="/" aria-label="Go to homepage" className="inline-flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-lg bg-white text-brand-700">
              <Code2 className="size-5" strokeWidth={2.2} aria-hidden="true" />
            </span>
            <span className="text-lg font-bold tracking-tight text-white">{APP_NAME}</span>
          </Link>

          <p className="mt-10 max-w-sm text-2xl font-semibold leading-snug tracking-tight">
            {APP_TAGLINE}
          </p>
        </div>

        <ul className="relative space-y-5">
          {highlights.map((item) => (
            <li key={item.title} className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-0.5 max-w-xs text-xs leading-relaxed text-white/70">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="relative text-xs text-white/50">© {new Date().getFullYear()} {APP_NAME}</p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8">
          <Link to="/" aria-label="Go to homepage" className="lg:hidden">
            <Logo />
          </Link>
          <Link
            to="/"
            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            Back to site
          </Link>
        </header>

        <main
          id="auth-content"
          className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8"
        >
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </main>

        <footer className="shrink-0 px-6 pb-6 text-center text-xs leading-relaxed text-slate-400">
          Your account and every question you post are stored securely in our database.
        </footer>
      </div>

      <ScrollRestoration />
    </div>
  )
}