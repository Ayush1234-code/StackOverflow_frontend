import { MessageSquare } from 'lucide-react'

import { EmptyState } from '@/components/common/EmptyState'
import { AnswerItem } from './AnswerItem'

export function AnswerList({ answers, onAccept, onVote, isAcceptingId = null, onChanged }) {
  if (!answers || answers.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No answers yet"
        description="Be the first to share how you would solve this."
      />
    )
  }

  // Ordering comes from the API (`?sort=`), which keeps the accepted answer
  // pinned to the top and reads vote counts straight from the database.
  // Re-sorting here would override the server and could contradict it.
  return (
    <div className="space-y-4">
      {answers.map((answer) => (
        <AnswerItem
          key={answer.id}
          answer={answer}
          onAccept={onAccept}
          onVote={onVote}
          isAccepting={isAcceptingId === answer.id}
          onChanged={onChanged}
        />
      ))}
    </div>
  )
}