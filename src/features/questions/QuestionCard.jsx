import { Link } from 'react-router-dom'

import { Avatar } from '@/components/common/Avatar'
import { Reputation } from '@/components/common/Reputation'
import { BookmarkButton } from '@/components/questions/BookmarkButton'
import { TagBadge } from '@/features/tags/TagBadge'
import { classNames } from '@/utils/classNames'
import { excerpt, timeAgo } from '@/utils/format'

export function QuestionCard({ question, onBookmarkChange }) {
  const { id, title, body, tags = [], author, createdAt } = question
  const votes = question.voteCount ?? 0
  const answers = question.answerCount ?? 0
  const views = question.viewCount ?? 0
  const accepted = question.acceptedAnswerId != null

  return (
    <article className="flex gap-4 px-5 py-4 transition-colors hover:bg-slate-50/70">
      <div className="flex w-16 shrink-0 flex-col items-end gap-1 text-xs leading-tight text-slate-600">
        <span className={classNames(votes > 0 && 'font-medium text-emerald-700')}>
          {votes} votes
        </span>
        <span
          className={classNames(
            'rounded-full px-1.5 py-0.5',
            accepted
              ? 'bg-emerald-600 font-medium text-white'
              : answers > 0
                ? 'border border-emerald-600 text-emerald-700'
                : '',
          )}
        >
          {answers} answers
        </span>
        <span>{views} views</span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-base font-medium leading-snug">
          <Link to={`/questions/${id}`} className="text-brand-700 transition-colors hover:text-brand-800">
            {title}
          </Link>
        </h3>

        {body ? (
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
            {excerpt(body)}
          </p>
        ) : null}

        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {tags.map((tag) => (
            <TagBadge key={tag} name={tag} />
          ))}
          <span className="ml-auto inline-flex items-center gap-1.5">
            <BookmarkButton
              questionId={id}
              initialBookmarked={Boolean(question.isBookmarked)}
              onChanged={onBookmarkChange}
              className="-mr-1"
            />
            {createdAt && <time>asked {timeAgo(createdAt)}</time>}
            {author?.name ? <Avatar name={author.name} size="sm" /> : null}
            {author?.name ? (
              <Link
                to={author.id ? `/users/${author.id}` : '/users'}
                className="font-medium text-slate-700 transition-colors hover:text-brand-700"
              >
                {author.name}
              </Link>
            ) : null}
            {author?.reputation != null ? (
              <Reputation value={author.reputation} className="text-xs" />
            ) : null}
          </span>
        </div>
      </div>
    </article>
  )
}