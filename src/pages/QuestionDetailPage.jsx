import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Eye, MessageSquare, PenLine, ShieldCheck, Trash2 } from 'lucide-react'

import { previewApi } from '@/api/previewAdapter'
import { Avatar } from '@/components/common/Avatar'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/common/Button'
import { Card, CardBody } from '@/components/common/Card'
import { ConfirmButton } from '@/components/common/ConfirmButton'
import { ErrorState } from '@/components/common/ErrorState'
import { Field } from '@/components/common/Field'
import { Markdown } from '@/components/common/Markdown'
import { PreviewNotice } from '@/components/common/PreviewNotice'
import { SortTabs } from '@/components/common/SortTabs'
import { ReportButton } from '@/components/reporting/ReportDialog'
import { QuestionDetailSkeleton } from '@/components/common/Skeleton'
import { Textarea } from '@/components/common/Textarea'
import { VoteControls } from '@/components/common/VoteControls'
import { Alert } from '@/components/common/Alert'
import { CommentSection } from '@/components/comments/CommentSection'
import { AnswerList } from '@/features/answers/AnswerList'
import { BookmarkButton } from '@/components/questions/BookmarkButton'
import { RelatedQuestions } from '@/features/questions/RelatedQuestions'
import { RevisionHistory } from '@/features/revisions/RevisionHistory'
import { TagBadge } from '@/features/tags/TagBadge'
import { useApiResource } from '@/hooks/useApiResource'
import { useAuth } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ANSWER_SORTS } from '@/utils/constants'
import { excerpt, formatDate, pluralize } from '@/utils/format'

const ANSWER_SORT_OPTIONS = ANSWER_SORTS.map(({ value, label }) => ({ value, label }))

function BackToList() {
  return (
    <Button to="/questions" variant="ghost" size="sm">
      <ChevronLeft className="size-4" aria-hidden="true" />
      Back to questions
    </Button>
  )
}

export function QuestionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const fetchQuestion = useCallback(() => previewApi.questions.get(id), [id])
  const {
    data: rawQuestion,
    error: questionError,
    isLoading: questionLoading,
    reload: reloadQuestion,
  } = useApiResource(fetchQuestion)

  // Answer ordering is decided by the server so the list, the accepted-answer
  // pinning and the vote counts can never disagree with the database.
  const [answerSort, setAnswerSort] = useState('votes')
  const fetchAnswers = useCallback(
    () => previewApi.answers.list(id, { sort: answerSort }),
    [id, answerSort],
  )
  const {
    data: rawAnswers,
    error: answersError,
    isLoading: answersLoading,
    reload: reloadAnswers,
  } = useApiResource(fetchAnswers)

  const question = rawQuestion?.question ?? null
  useDocumentTitle(question?.title || 'Question')

  // The POST returns the persisted answer, so a successful submit appends it
  // straight away instead of waiting on a refetch. Tagged with the question id
  // so it is ignored on the next question, and dropped once a reload returns a
  // list that already contains it.
  const [createdAnswer, setCreatedAnswer] = useState(null)
  const answers = useMemo(() => {
    const list = rawAnswers?.answers ?? []
    if (!createdAnswer || createdAnswer.questionId !== id) return list
    if (list.some((answer) => answer.id === createdAnswer.answer.id)) return list
    return [...list, createdAnswer.answer]
  }, [rawAnswers, createdAnswer, id])

  const [answerBody, setAnswerBody] = useState('')
  const [answerError, setAnswerError] = useState(null)
  const [isPosting, setIsPosting] = useState(false)
  const [acceptingId, setAcceptingId] = useState(null)
  const [voting, setVoting] = useState(null)
  const [voteError, setVoteError] = useState(null)
  const [contentError, setContentError] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const canAccept = Boolean(
    user && (user.role === 'admin' || (question && user.id === question.author?.id)),
  )
  const canModerate = canAccept

  async function handleDeleteQuestion() {
    setContentError(null)
    setIsDeleting(true)
    try {
      await previewApi.questions.remove(id)
      navigate('/questions')
    } catch (err) {
      setContentError(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleSubmitAnswer(event) {
    event.preventDefault()
    const trimmed = answerBody.trim()

    if (trimmed.length < 15) {
      setAnswerError('Please write an answer of at least 15 characters.')
      return
    }

    setIsPosting(true)
    setAnswerError(null)
    try {
      const created = await previewApi.answers.create(id, { body: trimmed })
      setAnswerBody('')
      if (created?.answer) {
        setCreatedAnswer({ questionId: id, answer: created.answer })
      } else {
        reloadAnswers()
      }
    } catch (err) {
      setAnswerError(err.message)
    } finally {
      setIsPosting(false)
    }
  }

  async function handleAccept(answerId) {
    setAcceptingId(answerId)
    setAnswerError(null)
    try {
      await previewApi.answers.accept(id, answerId)
      reloadAnswers()
    } catch (err) {
      setAnswerError(err.message)
    } finally {
      setAcceptingId(null)
    }
  }

  async function handleVoteQuestion(value) {
    setVoteError(null)
    setVoting('question')
    try {
      await previewApi.questions.vote(id, { value })
      reloadQuestion()
    } catch (err) {
      setVoteError(err.message)
    } finally {
      setVoting(null)
    }
  }

  async function handleVoteAnswer(answerId, value) {
    setVoteError(null)
    setVoting(answerId)
    try {
      await previewApi.answers.vote(id, answerId, { value })
      reloadAnswers()
    } catch (err) {
      setVoteError(err.message)
    } finally {
      setVoting(null)
    }
  }

  if (questionLoading) {
    return (
      <div className="space-y-6">
        <BackToList />
        <QuestionDetailSkeleton />
      </div>
    )
  }

  if (questionError || !question) {
    return (
      <div className="space-y-6">
        <BackToList />
        <ErrorState title="Could not load this question" error={questionError} />
      </div>
    )
  }

  const { title, body, tags = [], author, createdAt, viewCount, voteCount, userVote } = question

  const voteBar = (className) => (
    <VoteControls
      orientation="vertical"
      count={voteCount}
      userVote={userVote}
      busy={voting === 'question'}
      onVote={handleVoteQuestion}
      className={className}
    />
  )

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: 'Questions', to: '/questions' },
            { label: excerpt(title, 42), to: `/questions/${question.id}` },
          ]}
        />
        <BackToList />
      </div>
      <PreviewNotice />

      <Card>
        <CardBody>
          <div className="flex gap-4">
            {voteBar('hidden sm:flex')}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {tags.map((tag) => (
                  <TagBadge key={tag} name={tag} />
                ))}
              </div>

              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{title}</h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  {author ? (
                    <>
                      <Avatar name={author.name} size="sm" />
                      <Link
                        to={author.id ? `/users/${author.id}` : '/users'}
                        className="font-medium text-slate-700 transition-colors hover:text-brand-700"
                      >
                        {author.name}
                      </Link>
                      {author.role === 'admin' && (
                        <span className="inline-flex items-center gap-1 text-xs text-brand-700">
                          <ShieldCheck className="size-3.5" aria-hidden="true" />
                          Admin
                        </span>
                      )}
                    </>
                  ) : (
                    <span>Asked by an anonymous user</span>
                  )}
                </div>
                {createdAt && <span>on {formatDate(createdAt)}</span>}
                {typeof viewCount === 'number' && (
                  <span className="inline-flex items-center gap-1">
                    <Eye className="size-3.5" aria-hidden="true" />
                    {pluralize(viewCount, 'view')}
                  </span>
                )}
                <span className="ml-auto flex flex-wrap items-center gap-2">
                  <BookmarkButton
                    questionId={question.id}
                    initialBookmarked={Boolean(question.isBookmarked)}
                  />
                  <RevisionHistory contentType="question" contentId={question.id} />
                  {canModerate && (
                    <>
                      <Button
                        to={`/questions/${question.id}/edit`}
                        variant="secondary"
                        size="sm"
                        icon={PenLine}
                      >
                        Edit
                      </Button>
                      <ConfirmButton
                        icon={Trash2}
                        size="sm"
                        confirmLabel="Delete question? Click again"
                        onConfirm={handleDeleteQuestion}
                        loading={isDeleting}
                      >
                        Delete
                      </ConfirmButton>
                    </>
                  )}
                  <ReportButton contentType="question" contentId={question.id} contentSummary={excerpt(title, 60)} />
                </span>
              </div>

              <div className="mt-3 sm:hidden">
                <VoteControls
                  orientation="horizontal"
                  count={voteCount}
                  userVote={userVote}
                  busy={voting === 'question'}
                  onVote={handleVoteQuestion}
                />
              </div>

              <div className="mt-6 text-[15px] leading-relaxed text-slate-800">
                <Markdown markdown={body} />
              </div>

              {voteError && (
                <Alert tone="danger" className="mt-4">
                  {voteError}
                </Alert>
              )}

              {contentError && (
                <Alert tone="danger" className="mt-4">
                  {contentError}
                </Alert>
              )}

              <CommentSection questionId={question.id} className="mt-6" />
            </div>
          </div>
        </CardBody>
      </Card>

      <section aria-labelledby="answers-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="answers-heading" className="text-lg font-semibold text-slate-900">
            {pluralize(answers.length, 'answer')}
          </h2>
          {answers.length > 1 ? (
            <SortTabs
              options={ANSWER_SORT_OPTIONS}
              value={answerSort}
              onChange={setAnswerSort}
              label="Sort answers"
            />
          ) : null}
        </div>

        {answersLoading ? (
          <div className="space-y-4" aria-label="Loading answers">
            {[0, 1].map((index) => (
              <div key={index} className="h-40 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
            ))}
          </div>
        ) : answersError ? (
          <ErrorState error={answersError} onRetry={reloadAnswers} />
        ) : (
          <AnswerList
            answers={answers}
            onAccept={canAccept ? handleAccept : undefined}
            onVote={handleVoteAnswer}
            isAcceptingId={acceptingId}
            onChanged={reloadAnswers}
          />
        )}
      </section>

      <section aria-labelledby="answer-form-heading">
        {isAuthenticated ? (
          <Card>
            <CardBody>
              <h2 id="answer-form-heading" className="text-lg font-semibold text-slate-900">
                Your answer
              </h2>
              <form onSubmit={handleSubmitAnswer} className="mt-4 space-y-4" noValidate>
                {answerError && !acceptingId && (
                  <Alert tone="danger">{answerError}</Alert>
                )}
                <Field
                  label="Body"
                  htmlFor="answer-body"
                  required
                  hint="Explain how you would solve the problem. Markdown is supported."
                  error={answerError}
                >
                  <Textarea
                    id="answer-body"
                    rows={8}
                    value={answerBody}
                    onChange={(event) => setAnswerBody(event.target.value)}
                    placeholder={'Write your answer… Use ``` for code blocks.'}
                    error={Boolean(answerError)}
                  />
                </Field>
                <Button type="submit" loading={isPosting}>
                  Post your answer
                </Button>
              </form>
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardBody className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="grid size-11 place-items-center rounded-full bg-slate-100 text-slate-400">
                <MessageSquare className="size-5" aria-hidden="true" />
              </div>
              <h2 className="text-base font-semibold text-slate-900">
                Log in to post an answer
              </h2>
              <p className="max-w-sm text-sm text-slate-500">
                Share how you would solve this problem and help the next person who lands here.
              </p>
              <div className="mt-2 flex gap-2">
                <Button to="/login" state={{ from: `/questions/${question.id}` }} size="sm">
                  Log in
                </Button>
                <Button to="/signup" variant="secondary" size="sm">
                  Create an account
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
      </section>

      <RelatedQuestions questionId={question.id} limit={5} />
    </div>
  )
}