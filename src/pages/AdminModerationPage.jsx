import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Flag, ShieldAlert, Trash2, Users } from 'lucide-react'

import { previewApi } from '@/api/previewAdapter'
import { Alert } from '@/components/common/Alert'
import { Avatar } from '@/components/common/Avatar'
import { Badge } from '@/components/common/Badge'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/common/Button'
import { Card, CardBody } from '@/components/common/Card'
import { ConfirmButton } from '@/components/common/ConfirmButton'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Modal } from '@/components/common/Modal'
import { Pagination } from '@/components/common/Pagination'
import { Reputation } from '@/components/common/Reputation'
import { Skeleton } from '@/components/common/Skeleton'
import { Tabs } from '@/components/common/Tabs'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { classNames } from '@/utils/classNames'
import { pluralize, timeAgo } from '@/utils/format'

/**
 * Admin moderation.
 *
 * Every decision goes to the dedicated `/api/admin` endpoints. Two rules matter
 * and are enforced by the backend, not by this page:
 *
 *   - Removing reported content always targets what the *stored report* points
 *     at. This page never sends a content id of its own, so there is no client
 *     value that could redirect a removal at unrelated content.
 *   - "Resolve" and "dismiss" are separate outcomes. Resolving with
 *     `removeContent` is a single request so the moderation event is recorded as
 *     one audited action rather than a removal that happens to line up with a
 *     report.
 *
 * Suspending and deleting accounts are backend-guarded too: admins can never be
 * suspended, demoted or deleted through these endpoints, and the controls below
 * are hidden to match rather than to protect.
 */

const CONTENT_TYPE_LABEL = { question: 'Question', answer: 'Answer', comment: 'Comment' }

const STATUS_FILTERS = [
  { id: 'open', label: 'Open' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'dismissed', label: 'Dismissed' },
  { id: 'all', label: 'All' },
]

const CONTENT_TYPE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'question', label: 'Questions' },
  { id: 'answer', label: 'Answers' },
  { id: 'comment', label: 'Comments' },
]

const MEMBER_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'suspended', label: 'Suspended' },
  { id: 'admins', label: 'Admins' },
]

export function AdminModerationPage() {
  useDocumentTitle('Moderation')
  const [tab, setTab] = useState('reports')
  const [actionError, setActionError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [pending, setPending] = useState(null)

  const [reportFilters, setReportFilters] = useState({ status: 'open', contentType: 'all', q: '', page: 1 })
  const [memberFilters, setMemberFilters] = useState({ status: 'all', q: '', page: 1 })

  const fetchReports = useCallback(
    () =>
      previewApi.moderation.list({
        status: reportFilters.status,
        contentType: reportFilters.contentType,
        q: reportFilters.q.trim() || undefined,
        page: reportFilters.page,
        limit: 20,
      }),
    [reportFilters],
  )
  const reportsResource = useApiResource(fetchReports, { enabled: tab === 'reports' })

  const fetchMembers = useCallback(
    () =>
      previewApi.moderation.users({
        status: memberFilters.status,
        q: memberFilters.q.trim() || undefined,
        page: memberFilters.page,
        limit: 25,
      }),
    [memberFilters],
  )
  const membersResource = useApiResource(fetchMembers, { enabled: tab === 'members' })

  const reports = reportsResource.data?.reports ?? []
  // Only meaningful while the open filter is showing them; a count on another
  // filter would mislabel whatever subset is actually displayed.
  const openCount = reportFilters.status === 'open' ? reports.length : undefined

  const setReportFilter = (key, value) =>
    // Any filter change resets to page 1; staying on page 4 of a shorter result
    // set would render an empty list that looks like a bug.
    setReportFilters((previous) => ({ ...previous, [key]: value, page: key === 'page' ? value : 1 }))

  const setMemberFilter = (key, value) =>
    setMemberFilters((previous) => ({ ...previous, [key]: value, page: key === 'page' ? value : 1 }))

  async function runAction(action, { errorMessage, successMessage }) {
    setActionError(null)
    setNotice(null)
    try {
      const result = await action()
      setNotice(typeof successMessage === 'function' ? successMessage(result) : successMessage)
      // Both resources may be stale after a decision, and the member list can
      // change when an account is suspended or deleted.
      if (tab === 'reports') reportsResource.reload()
      else membersResource.reload()
    } catch (err) {
      setActionError(err?.message || errorMessage)
    }
  }

  async function confirmDecision({ decision, note }) {
    // Read the report before clearing the dialog: `pending` is a prop snapshot
    // and this handler needs the id it points at.
    const { report } = pending ?? {}
    if (!report) {
      setPending(null)
      return
    }
    setPending(null)

    if (decision === 'dismiss') {
      await runAction(() => previewApi.moderation.dismissReport(report.id, { note }), {
        errorMessage: 'Could not dismiss this report.',
        successMessage: 'Report dismissed.',
      })
      return
    }

    if (decision === 'reopen') {
      await runAction(() => previewApi.moderation.reopenReport(report.id), {
        errorMessage: 'Could not reopen this report.',
        successMessage: 'Report reopened and returned to the queue.',
      })
      return
    }

    await runAction(() => previewApi.moderation.resolveReport(report.id, { note, removeContent: decision.removeContent }), {
      errorMessage: 'Could not resolve this report.',
      successMessage: decision.removeContent
        ? 'Report resolved and the content was removed.'
        : 'Report resolved. The content was left in place.',
    })
  }

  async function toggleSuspend(member) {
    await runAction(() => previewApi.moderation.setUserStatus(member.id, { isSuspended: !member.isSuspended }), {
      errorMessage: 'Could not update this member.',
      successMessage: member.isSuspended ? `${member.name} was reactivated.` : `${member.name} was suspended.`,
    })
  }

  async function deleteMember(member) {
    await runAction(() => previewApi.moderation.deleteUser(member.id), {
      errorMessage: 'Could not delete this member.',
      successMessage: `${member.name} and their content were removed.`,
    })
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Admin', to: '/admin' }, { label: 'Moderation' }]} />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Moderation</h1>
        <p className="mt-1 text-sm text-slate-600">Review reported content and moderate member accounts.</p>
      </div>

      {actionError ? <Alert tone="danger">{actionError}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'reports', label: 'Reported content', icon: Flag, count: openCount },
          { id: 'members', label: 'Members', icon: Users },
        ]}
      />

      <div className="pt-6">
        {tab === 'reports' ? (
          <ReportsTab
            resource={reportsResource}
            reports={reports}
            filters={reportFilters}
            onFilterChange={setReportFilter}
            onDecide={(report, decision) => setPending({ report, decision })}
          />
        ) : (
          <MembersTab
            resource={membersResource}
            members={membersResource.data?.users ?? []}
            filters={memberFilters}
            onFilterChange={setMemberFilter}
            onToggleSuspend={toggleSuspend}
            onDeleteMember={deleteMember}
          />
        )}
      </div>

      <DecisionDialog
        pending={pending}
        onCancel={() => setPending(null)}
        onConfirm={confirmDecision}
      />
    </div>
  )
}

function ReportsTab({ resource, reports, filters, onFilterChange, onDecide }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
          <SearchField
            id="report-search"
            label="Search reports"
            placeholder="Reason, details or summary contains…"
            value={filters.q}
            onChange={(value) => onFilterChange('q', value)}
          />
          <FilterGroup
            label="Status"
            options={STATUS_FILTERS}
            value={filters.status}
            onChange={(value) => onFilterChange('status', value)}
          />
          <FilterGroup
            label="Content type"
            options={CONTENT_TYPE_FILTERS}
            value={filters.contentType}
            onChange={(value) => onFilterChange('contentType', value)}
          />
        </CardBody>
      </Card>

      {resource.isLoading ? (
        <div className="space-y-3" aria-label="Loading reports">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : resource.error ? (
        <ErrorState error={resource.error} onRetry={resource.reload} />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title={filters.status === 'open' ? 'Nothing in the queue' : 'No reports match these filters'}
          description={
            filters.status === 'open'
              ? 'No open reports right now.'
              : 'Try a different status, content type or search term.'
          }
        />
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} onDecide={onDecide} />
          ))}
        </div>
      )}

      {resource.data && resource.data.totalPages > 1 ? (
        <Pagination
          page={resource.data.page}
          totalPages={resource.data.totalPages}
          onPageChange={(page) => onFilterChange('page', page)}
        />
      ) : null}
    </div>
  )
}

function MembersTab({ resource, members, filters, onFilterChange, onToggleSuspend, onDeleteMember }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <SearchField
            id="member-search"
            label="Search members"
            placeholder="Name or email address contains…"
            value={filters.q}
            onChange={(value) => onFilterChange('q', value)}
          />
          <FilterGroup
            label="Account state"
            options={MEMBER_FILTERS}
            value={filters.status}
            onChange={(value) => onFilterChange('status', value)}
          />
        </CardBody>
      </Card>

      {resource.isLoading ? (
        <div className="space-y-3" aria-label="Loading members">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : resource.error ? (
        <ErrorState error={resource.error} onRetry={resource.reload} />
      ) : members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No members match these filters"
          description="Try a different filter or search term."
        />
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            <Card key={member.id}>
              <CardBody className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={member.name} size="md" />
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                      <Link to={`/users/${member.id}`} className="truncate hover:underline">
                        {member.name}
                      </Link>
                      {member.role === 'admin' ? <Badge tone="brand">Admin</Badge> : null}
                      {member.isSuspended ? <Badge tone="danger">Suspended</Badge> : null}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {member.email ?? 'Email hidden'} · {pluralize(member.questionCount, 'question')} ·{' '}
                      {pluralize(member.answerCount, 'answer')}
                      {member.reportsFiled ? ` · ${pluralize(member.reportsFiled, 'report')} filed` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <Reputation value={member.reputation} />
                  {member.role !== 'admin' ? (
                    <>
                      <Button
                        size="sm"
                        variant={member.isSuspended ? 'secondary' : 'danger'}
                        onClick={() => onToggleSuspend(member)}
                      >
                        {member.isSuspended ? 'Reactivate' : 'Suspend'}
                      </Button>
                      <ConfirmButton
                        size="sm"
                        icon={Trash2}
                        confirmLabel="Delete this account and all its content?"
                        onConfirm={() => onDeleteMember(member)}
                      >
                        Delete
                      </ConfirmButton>
                    </>
                  ) : null}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {resource.data && resource.data.totalPages > 1 ? (
        <Pagination
          page={resource.data.page}
          totalPages={resource.data.totalPages}
          onPageChange={(page) => onFilterChange('page', page)}
        />
      ) : null}
    </div>
  )
}

function ReportCard({ report, onDecide }) {
  const isOpen = report.status === 'open'
  const target = report.target

  return (
    <Card>
      <CardBody>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={report.status} />
              <Badge tone="neutral">{CONTENT_TYPE_LABEL[report.contentType] ?? report.contentType}</Badge>
              {report.contentRemoved ? <Badge tone="danger">Content removed</Badge> : null}
              <span className="text-sm font-medium text-slate-500">{report.reason}</span>
              {report.createdAt ? <span className="text-xs text-slate-400">{timeAgo(report.createdAt)}</span> : null}
            </div>

            {/* The reported content is inlined so a decision needs no second page. */}
            {target ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                {target.title ? <p className="text-sm font-semibold text-slate-900">{target.title}</p> : null}
                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">{target.excerpt}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  {target.author ? (
                    <span className="flex items-center gap-1.5">
                      <Avatar name={target.author.name} size="xs" />
                      {target.author.name}
                      {target.author.isAdmin ? <Badge tone="brand">Admin</Badge> : null}
                      {target.author.isSuspended ? <Badge tone="danger">Suspended</Badge> : null}
                    </span>
                  ) : null}
                  {typeof target.voteCount === 'number' ? <span>score {target.voteCount}</span> : null}
                  {target.questionTitle ? <span className="truncate">on “{target.questionTitle}”</span> : null}
                  {report.link ? (
                    <Link
                      to={report.link}
                      className="inline-flex items-center gap-1 font-medium text-brand-700 hover:underline"
                    >
                      View
                      <ExternalLink className="size-3" aria-hidden="true" />
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500">
                {report.targetMissing
                  ? 'The reported content no longer exists, so the only meaningful actions left are to resolve or dismiss.'
                  : 'Reported content unavailable.'}
              </p>
            )}

            <p className="break-words text-sm text-slate-600">“{report.contentSummary}”</p>
            {report.details ? <p className="text-sm text-slate-500">{report.details}</p> : null}

            <p className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <Flag className="size-3.5" aria-hidden="true" />
              Reported by {report.reportedBy?.name || 'Anonymous'}
              {report.reportedBy?.reputation != null ? ` · ${report.reportedBy.reputation} rep` : ''}
            </p>

            {!isOpen ? (
              <p className="text-xs text-slate-500">
                {report.status === 'resolved' ? 'Resolved' : 'Dismissed'} by{' '}
                {report.resolvedBy?.name ?? 'an administrator'}
                {report.resolvedAt ? ` ${timeAgo(report.resolvedAt)}` : ''}
                {report.resolutionNote ? ` — “${report.resolutionNote}”` : ''}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 lg:w-40 lg:flex-col">
            {isOpen ? (
              <>
                <Button size="sm" onClick={() => onDecide(report, { removeContent: false })}>
                  Resolve
                </Button>
                <Button size="sm" variant="danger" onClick={() => onDecide(report, { removeContent: true })}>
                  Remove &amp; resolve
                </Button>
                <Button size="sm" variant="secondary" onClick={() => onDecide(report, 'dismiss')}>
                  Dismiss
                </Button>
              </>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => onDecide(report, 'reopen')}>
                Reopen
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

function StatusBadge({ status }) {
  const tones = { open: 'warning', resolved: 'success', dismissed: 'neutral' }
  const labels = { open: 'Open', resolved: 'Resolved', dismissed: 'Dismissed' }
  return <Badge tone={tones[status] ?? 'neutral'}>{labels[status] ?? status}</Badge>
}

function SearchField({ id, label, placeholder, value, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-slate-600">
        {label}
      </label>
      <input
        id={id}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
      />
    </div>
  )
}

function FilterGroup({ label, options, value, onChange }) {
  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-medium text-slate-600">{label}</span>
      <div className="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={value === option.id}
            className={classNames(
              'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
              value === option.id ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * The decision dialog.
 *
 * Removal is a separate, explicit choice with a stated consequence, and the
 * note is stored on the report as an audit trail. Note that no content id is
 * sent from here at all — the backend uses the id stored on the report, so this
 * dialog cannot be talked into removing something else.
 */
function DecisionDialog({ pending, onCancel, onConfirm }) {
  const [note, setNote] = useState('')

  if (!pending) return null

  const { report, decision } = pending
  const isDismiss = decision === 'dismiss'
  const isReopen = decision === 'reopen'
  const removes = !isDismiss && !isReopen && decision.removeContent

  const title = isDismiss
    ? 'Dismiss report'
    : isReopen
      ? 'Reopen report'
      : removes
        ? 'Remove content and resolve'
        : 'Resolve report'

  return (
    <Modal
      open
      onClose={() => {
        setNote('')
        onCancel()
      }}
      title={title}
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <p className="font-medium">
            {CONTENT_TYPE_LABEL[report.contentType]} reported as {report.reason}
          </p>
          <p className="mt-1">“{report.contentSummary}”</p>
        </div>

        {isReopen ? (
          <p className="text-sm text-slate-600">
            The report returns to the open queue and any previous decision note is cleared.
          </p>
        ) : (
          <div>
            <label htmlFor="moderation-note" className="block text-[13px] font-medium text-slate-700">
              Note <span className="font-normal text-slate-400">(optional, kept in the audit trail)</span>
            </label>
            <textarea
              id="moderation-note"
              rows={3}
              maxLength={500}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Why you made this decision…"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
            />
          </div>
        )}

        {removes ? (
          <Alert tone="danger">
            This permanently deletes the reported{' '}
            {CONTENT_TYPE_LABEL[report.contentType].toLowerCase()} along with its answers, comments, votes and
            bookmarks. The report itself is kept as an audit record. This cannot be undone.
          </Alert>
        ) : null}

        {!isDismiss && !isReopen && !removes ? (
          <p className="text-sm text-slate-600">
            The report is marked handled and the content stays in place. Choose “Remove &amp; resolve” if the content
            should also be deleted.
          </p>
        ) : null}

        {isDismiss ? (
          <p className="text-sm text-slate-600">
            Use this when the report was not justified. The content is left untouched.
          </p>
        ) : null}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button
            variant="ghost"
            onClick={() => {
              setNote('')
              onCancel()
            }}
          >
            Cancel
          </Button>
          <Button
            variant={removes ? 'danger' : 'primary'}
            onClick={() => {
              setNote('')
              onConfirm({ decision, note })
            }}
          >
            {isDismiss ? 'Dismiss' : isReopen ? 'Reopen' : removes ? 'Remove and resolve' : 'Resolve'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
