import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Compass, Home, MessageSquare, PenLine, Search, Tags } from 'lucide-react'

import { Button } from '@/components/common/Button'
import { Card, CardBody } from '@/components/common/Card'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const links = [
  { label: 'Browse questions', to: '/questions', icon: MessageSquare },
  { label: 'Browse tags', to: '/tags', icon: Tags },
  { label: 'Ask a question', to: '/questions/ask', icon: PenLine },
]

export function NotFoundPage() {
  useDocumentTitle('Page not found')
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function handleSearch(event) {
    event.preventDefault()
    const term = query.trim()
    navigate(term ? `/search?q=${encodeURIComponent(term)}` : '/search')
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        <Compass className="size-7" strokeWidth={1.8} aria-hidden="true" />
      </div>

      <p className="mt-6 text-sm font-medium uppercase tracking-widest text-slate-400">404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
        This page took a wrong turn
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        The page you are looking for does not exist or has been moved. Search for a topic
        instead, or head back somewhere useful.
      </p>

      <form onSubmit={handleSearch} role="search" className="relative mt-6 w-full max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search questions…"
          aria-label="Search questions"
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-4 pl-9 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
        />
      </form>

      <div className="mt-8 grid w-full gap-3 sm:grid-cols-3">
        {links.map((link) => (
          <Card key={link.to} className="transition-colors hover:border-brand-300">
            <CardBody className="flex flex-col items-center gap-2 py-5">
              <Link to={link.to} className="flex flex-col items-center gap-2 text-slate-700 transition-colors hover:text-brand-700">
                <link.icon className="size-5" aria-hidden="true" />
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            </CardBody>
          </Card>
        ))}
      </div>

      <Button to="/" className="mt-8">
        <Home className="size-4" aria-hidden="true" />
        Back to home
      </Button>
    </div>
  )
}