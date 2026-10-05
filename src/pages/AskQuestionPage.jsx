import { useNavigate } from 'react-router-dom'
import { Lightbulb } from 'lucide-react'

import { previewApi } from '@/api/previewAdapter'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/common/Card'
import { QuestionForm } from '@/features/questions/QuestionForm'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const tips = [
  'Give the title a specific problem, not a question mark.',
  'Describe what you expected and what actually happened.',
  'Include the smallest piece of code that reproduces the issue.',
  'Add tags for the technologies involved.',
]

export function AskQuestionPage() {
  const navigate = useNavigate()
  useDocumentTitle('Ask a question')

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Questions', to: '/questions' },
          { label: 'Ask a question', to: '/questions/ask' },
        ]}
      />

      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Ask a question
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Draft your question</CardTitle>
        </CardHeader>
        <CardBody>
          <QuestionForm
            onSubmit={async (payload) => {
              const result = await previewApi.questions.create(payload)
              const question = result?.question ?? result
              navigate(`/questions/${question.id}`)
            }}
          />
        </CardBody>
      </Card>

      <aside className="rounded-xl border border-blue-200 bg-blue-50 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
          <Lightbulb className="size-4" aria-hidden="true" />
          Tips for a good question
        </div>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-blue-900/80">
          {tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </aside>
    </div>
  )
}