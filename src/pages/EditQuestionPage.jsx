import { useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { previewApi } from '@/api/previewAdapter'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/common/Card'
import { ErrorState } from '@/components/common/ErrorState'
import { QuestionDetailSkeleton } from '@/components/common/Skeleton'
import { QuestionForm } from '@/features/questions/QuestionForm'
import { useApiResource } from '@/hooks/useApiResource'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function EditQuestionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const fetchQuestion = useCallback(() => previewApi.questions.get(id), [id])
  const { data, error, isLoading } = useApiResource(fetchQuestion)

  const question = data?.question ?? null
  useDocumentTitle(question ? `Edit question: ${question.title}` : 'Edit question')

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <QuestionDetailSkeleton />
      </div>
    )
  }

  if (error || !question) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <ErrorState title="Could not load this question" error={error} />
      </div>
    )
  }

  const canEdit = Boolean(user && (user.role === 'admin' || user.id === question.author?.id))
  if (!canEdit) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <ErrorState
          title="You cannot edit this question"
          error={{ message: 'Only the author or an admin can edit this question.' }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Questions', to: '/questions' },
          { label: question.title, to: `/questions/${question.id}` },
          { label: 'Edit' },
        ]}
      />

      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit your question</h1>

      <Card>
        <CardHeader>
          <CardTitle>Update your question</CardTitle>
        </CardHeader>
        <CardBody>
          <QuestionForm
            initialValues={{
              title: question.title,
              body: question.body,
              tags: (question.tags ?? []).join(', '),
            }}
            submitLabel="Save changes"
            onSubmit={async (payload) => {
              await previewApi.questions.update(id, payload)
              navigate(`/questions/${id}`)
            }}
          />
        </CardBody>
      </Card>
    </div>
  )
}