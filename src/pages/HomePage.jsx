import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Blocks, MessageSquare, PenLine, Search, ShieldCheck, Users } from 'lucide-react'

import { previewApi } from '@/api/previewAdapter'
import { Button } from '@/components/common/Button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/common/Card'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { PreviewNotice } from '@/components/common/PreviewNotice'
import { QuestionListSkeleton } from '@/components/common/Skeleton'
import { QuestionList } from '@/features/questions/QuestionList'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { APP_TAGLINE } from '@/utils/constants'

const highlights = [
  {
    icon: MessageSquare,
    title: 'Get real answers',
    description:
      'Ask detailed questions and get answers from developers who have solved the same problem.',
  },
  {
    icon: Blocks,
    title: 'Organized by tags',
    description:
      'Every question is tagged so you can browse by technology, framework, or problem area.',
  },
  {
    icon: ShieldCheck,
    title: 'Community-modulated',
    description:
      'Accept answers that worked, flag low-quality content, and let reputation reward helpful members.',
  },
]

export function HomePage() {
  const navigate = useNavigate()
  useDocumentTitle('Ask questions, find answers')

  const fetchRecent = useCallback(() => previewApi.questions.list({ sort: 'newest', limit: 5 }), [])
  const { data, error, isLoading } = useApiResource(fetchRecent)

  const questions = data?.questions ?? []

  function handleSearch(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const term = formData.get('q')?.trim()
    navigate(term ? `/search?q=${encodeURIComponent(term)}` : '/search')
  }

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-brand-100 bg-gradient-to-b from-brand-50/80 via-white to-white p-8 sm:p-12">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold text-brand-700">
            <Users className="size-3.5" aria-hidden="true" />
            A Q&amp;A home for developers
          </p>

          <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            Ask questions.
            <br />
            Find answers. Move forward.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">{APP_TAGLINE}</p>

          <form onSubmit={handleSearch} role="search" className="relative mt-8 max-w-xl">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              name="q"
              aria-label="Search all questions"
              placeholder="Search for questions… e.g. react hooks"
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-28 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
            />
            <Button type="submit" size="sm" className="absolute right-1.5 top-1.5">
              Search
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button to="/questions/ask" size="lg">
              <PenLine className="size-4" aria-hidden="true" />
              Ask a question
            </Button>
            <Button to="/questions" variant="secondary" size="lg">
              Browse questions
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3" aria-label="What you can do here">
        {highlights.map((feature) => (
          <Card key={feature.title}>
            <CardBody>
              <div className="grid size-10 place-items-center rounded-lg bg-brand-50 text-brand-700">
                <feature.icon className="size-5" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-slate-900">{feature.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {feature.description}
              </p>
            </CardBody>
          </Card>
        ))}
      </section>

      <section aria-labelledby="latest-questions-heading">
        <PreviewNotice className="mb-4" />
        <Card>
          <CardHeader className="flex items-center justify-between gap-4">
            <CardTitle id="latest-questions-heading">Latest questions</CardTitle>
            <Button to="/questions" variant="ghost" size="sm">
              View all
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Button>
          </CardHeader>

          {isLoading ? (
            <QuestionListSkeleton count={4} className="rounded-none border-0 shadow-none" />
          ) : error ? (
            <div className="p-5">
              <ErrorState error={error} />
            </div>
          ) : questions.length > 0 ? (
            <QuestionList questions={questions} />
          ) : (
            <div className="p-5">
              <EmptyState
                icon={MessageSquare}
                title="No questions yet"
                description="Questions will appear here once the community starts posting."
                action={<Button to="/questions/ask">Ask the first question</Button>}
              />
            </div>
          )}
        </Card>
      </section>
    </div>
  )
}