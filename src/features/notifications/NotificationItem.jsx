import { Link } from 'react-router-dom'
import { Award, Bell, MessageSquare, ThumbsUp } from 'lucide-react'

import { Avatar } from '@/components/common/Avatar'
import { classNames } from '@/utils/classNames'
import { timeAgo } from '@/utils/format'

/**
 * Icon per notification type. Anything unrecognised falls back to the bell so a
 * new backend event type renders as something sensible rather than nothing.
 */
const TYPE_ICONS = {
  answer_posted: MessageSquare,
  comment_posted: MessageSquare,
  answer_accepted: Award,
  content_upvoted: ThumbsUp,
}

const TYPE_TONES = {
  answer_posted: 'bg-brand-50 text-brand-600',
  comment_posted: 'bg-slate-100 text-slate-600',
  answer_accepted: 'bg-emerald-50 text-emerald-600',
  content_upvoted: 'bg-amber-50 text-amber-600',
}

/** Short human label for the type, used as the accessible name for the icon. */
const TYPE_LABELS = {
  answer_posted: 'New answer',
  comment_posted: 'New comment',
  answer_accepted: 'Answer accepted',
  content_upvoted: 'Upvote received',
}

/**
 * One row in the notification list.
 *
 * Unread rows are marked with a dot and a stronger label rather than colour
 * alone, so the read state is not conveyed by hue.
 */
export function NotificationItem({ notification, onOpen }) {
  const Icon = TYPE_ICONS[notification.type] ?? Bell
  const tone = TYPE_TONES[notification.type] ?? 'bg-slate-100 text-slate-600'
  const label = TYPE_LABELS[notification.type] ?? 'Update'

  const body = (
    <>
      <span className={classNames('relative shrink-0', !notification.actor && 'pl-6')}>
        {notification.actor ? (
          <Avatar name={notification.actor.name} size="sm" />
        ) : (
          // The actor's account was deleted, so there is no avatar to show.
          <span className={classNames('grid size-8 place-items-center rounded-full', tone)}>
            <Icon className="size-4" aria-hidden="true" />
          </span>
        )}
        {!notification.read ? (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-white bg-brand-500"
          />
        ) : null}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className={classNames('truncate text-[13px]', notification.read ? 'text-slate-700' : 'font-semibold text-slate-900')}>
            {notification.message}
          </span>
          <span className="shrink-0 text-[11px] text-slate-400">{timeAgo(notification.createdAt)}</span>
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
          <Icon className="size-3" aria-hidden="true" />
          <span>{label}</span>
          {notification.actor ? <span className="truncate">· {notification.actor.name}</span> : null}
          {notification.read ? null : <span className="sr-only">(unread)</span>}
        </span>
      </span>
    </>
  )

  const shared = classNames(
    'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
    notification.read ? 'hover:bg-slate-50' : 'bg-brand-50/40 hover:bg-brand-50/70',
  )

  // A notification with no target is still worth showing, but it must not be a
  // dead link, so it renders as a plain row instead of an anchor.
  if (!notification.link) {
    return (
      <li className="border-b border-slate-100 last:border-0">
        <div className={shared}>{body}</div>
      </li>
    )
  }

  return (
    <li className="border-b border-slate-100 last:border-0">
      <Link to={notification.link} className={shared} onClick={onOpen}>
        {body}
      </Link>
    </li>
  )
}
