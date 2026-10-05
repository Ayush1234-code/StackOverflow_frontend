import { QuestionCard } from './QuestionCard'

export function QuestionList({ questions, onBookmarkChange }) {
  if (!questions || questions.length === 0) return null

  return (
    <section
      aria-label="Questions"
      className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card"
    >
      {questions.map((question) => (
        <QuestionCard key={question.id} question={question} onBookmarkChange={onBookmarkChange} />
      ))}
    </section>
  )
}