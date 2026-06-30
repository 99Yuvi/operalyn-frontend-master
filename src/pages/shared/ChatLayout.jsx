import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { getConversations, getConversation } from '@/api/conversations'
import { getContract } from '@/api/contracts'
import { cn, getInitials, getAvatarColor, timeAgo, formatCurrency } from '@/lib/utils'
import ChatView from './ChatView'

const MS_STATUS = {
  pending:            { dot: 'bg-slate-300',   label: 'Pending' },
  in_progress:        { dot: 'bg-blue-400',    label: 'In progress' },
  submitted:          { dot: 'bg-yellow-400',  label: 'Awaiting review' },
  revision_requested: { dot: 'bg-orange-400',  label: 'Revision' },
  approved:           { dot: 'bg-green-400',   label: 'Approved' },
  paid:               { dot: 'bg-emerald-500', label: 'Paid' },
}

const CONTRACT_STATUS = {
  active:    { cls: 'bg-blue-50 text-blue-700 border-blue-200',    label: 'Active' },
  completed: { cls: 'bg-green-50 text-green-700 border-green-200', label: 'Completed' },
  cancelled: { cls: 'bg-red-50 text-red-600 border-red-200',       label: 'Cancelled' },
}

export default function ChatLayout() {
  const { conversationId } = useParams()
  const { user } = useAuth()
  const isClient = user?.role === 'client'
  const [search, setSearch] = useState('')

  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
    refetchInterval: 30_000,
  })

  const { data: convData } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => getConversation(conversationId),
    enabled: !!conversationId,
  })
  const conv = convData?.data
  const contractId = conv?.contract_id

  const { data: contractData } = useQuery({
    queryKey: ['contract', contractId],
    queryFn: () => getContract(contractId),
    enabled: !!contractId,
  })
  const contract = contractData?.data
  const otherParty = conv ? (isClient ? conv.freelancer : conv.client) : null

  const conversations = (listData?.data ?? []).filter(c => {
    if (!search.trim()) return true
    const other = isClient ? c.freelancer : c.client
    return (
      other?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.contract?.project?.title?.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="flex h-full overflow-hidden bg-white">

      {/* ── LEFT: Conversations sidebar ─────────────────────────────
           Mobile: full-width when no conversation, hidden when chat is open
           Desktop: fixed 320px column, always visible                       */}
      <aside className={cn(
        'shrink-0 flex flex-col border-r border-slate-200 bg-white',
        conversationId
          ? 'hidden md:flex md:w-80'        // chat open → hide list on mobile
          : 'flex w-full md:w-80'           // no chat → list is full screen on mobile
      )}>
        <div className="shrink-0 px-4 pt-4 pb-3 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            Messages
          </h2>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.197 5.197a7.5 7.5 0 0 0 10.606 10.606Z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full bg-slate-100 rounded-full pl-9 pr-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {listLoading ? (
            <SkeletonList />
          ) : conversations.length === 0 && !search ? (
            <ListEmpty />
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 gap-2 text-slate-400">
              <p className="text-sm">No results for "{search}"</p>
            </div>
          ) : (
            <ul>
              {conversations.map((c, idx) => (
                <ConvRow
                  key={c.id}
                  conv={c}
                  isClient={isClient}
                  user={user}
                  isActive={String(c.id) === String(conversationId)}
                  isLast={idx === conversations.length - 1}
                />
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* ── MIDDLE: Active chat ──────────────────────────────────────
           Mobile: only shown when a conversation is selected
           Desktop: always present (flex-1)                                   */}
      <div className={cn(
        'flex-1 min-w-0 overflow-hidden border-r border-slate-200',
        conversationId ? 'flex flex-col' : 'hidden md:flex md:flex-col'
      )}>
        {conversationId ? <ChatView /> : <NoChatSelected />}
      </div>

      {/* ── RIGHT: Contract info panel (hidden on mobile/tablet) ── */}
      {conversationId && (
        <aside className="hidden lg:flex w-72 shrink-0 flex-col bg-slate-50 border-l border-slate-200 overflow-y-auto">
          <ContractInfoPanel
            conv={conv}
            contract={contract}
            otherParty={otherParty}
            isClient={isClient}
          />
        </aside>
      )}
    </div>
  )
}

/* ── Conversation row ── */
function ConvRow({ conv, isClient, user, isActive, isLast }) {
  const other = isClient ? conv.freelancer : conv.client
  const colors = getAvatarColor(other?.name ?? '')
  const chatPath = isClient ? `/client/chat/${conv.id}` : `/freelancer/chat/${conv.id}`
  const hasUnread = conv.unread_count > 0

  const lastMsg = conv.latest_message
  const isMine = lastMsg?.sender_id === user?.id
  const preview = lastMsg?.body
    ? (isMine ? `You: ${lastMsg.body}` : lastMsg.body)
    : conv.contract?.project?.title ?? 'Start a conversation'
  const timestamp = conv.last_message_at ?? conv.created_at

  return (
    <li>
      <Link
        to={chatPath}
        className={cn(
          'flex items-center gap-3 px-4 py-3 transition-colors border-l-2',
          isActive
            ? 'bg-slate-100 border-slate-700'
            : 'hover:bg-slate-50 active:bg-slate-100 border-transparent'
        )}
      >
        <div className="relative shrink-0">
          <div className={cn(
            'h-11 w-11 rounded-full text-sm font-bold flex items-center justify-center select-none',
            colors.bg, colors.text
          )}>
            {getInitials(other?.name ?? '')}
          </div>
          {hasUnread && !isActive && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm truncate leading-tight',
            hasUnread && !isActive ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
          )}>
            {other?.name}
          </p>
          <p className={cn(
            'text-xs truncate mt-0.5 leading-snug',
            hasUnread && !isActive ? 'text-slate-600 font-medium' : 'text-slate-400'
          )}>
            {preview}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          {timestamp && (
            <span className={cn(
              'text-[11px] leading-none',
              hasUnread && !isActive ? 'text-green-600 font-semibold' : 'text-slate-400'
            )}>
              {timeAgo(timestamp)}
            </span>
          )}
          {hasUnread && !isActive ? (
            <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-green-500 text-white text-[11px] font-bold flex items-center justify-center">
              {conv.unread_count > 99 ? '99+' : conv.unread_count}
            </span>
          ) : (
            <span className="h-5 w-5" />
          )}
        </div>
      </Link>
      {!isLast && <div className="ml-[60px] h-px bg-slate-100" />}
    </li>
  )
}

/* ── Right panel: contract + milestones ── */
function ContractInfoPanel({ conv, contract, otherParty, isClient }) {
  if (!conv) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="h-6 w-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    )
  }

  const milestones = contract?.milestones ?? []
  const contractPath = isClient
    ? `/client/contracts/${conv.contract_id}`
    : `/freelancer/contracts/${conv.contract_id}`
  const cs = CONTRACT_STATUS[conv.contract?.status] ?? CONTRACT_STATUS.active
  const otherColors = getAvatarColor(otherParty?.name ?? '')
  const paidMs = milestones.filter(m => m.status === 'paid' || m.status === 'approved').length
  const progress = milestones.length ? Math.round((paidMs / milestones.length) * 100) : 0

  return (
    <div className="flex flex-col min-h-full">

      {/* Other party + meta */}
      <div className="px-4 py-4 border-b border-slate-200 bg-white shrink-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Contract Details
        </p>

        {otherParty && (
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              'h-12 w-12 rounded-full text-sm font-bold flex items-center justify-center shrink-0',
              otherColors.bg, otherColors.text
            )}>
              {getInitials(otherParty.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{otherParty.name}</p>
              <span className="inline-block mt-0.5 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                {isClient ? 'Freelancer' : 'Client'}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-2.5">
          <span className={cn('text-xs px-2.5 py-1 rounded-full border font-semibold', cs.cls)}>
            {cs.label}
          </span>
          {contract?.total_amount && (
            <span className="text-sm font-bold text-slate-800">
              {formatCurrency(contract.total_amount)}
            </span>
          )}
        </div>

        {conv.contract?.project?.title && (
          <p className="text-xs text-slate-500 truncate mt-1" title={conv.contract.project.title}>
            📋 {conv.contract.project.title}
          </p>
        )}
      </div>

      {/* Milestones */}
      <div className="px-4 py-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Milestones
          </p>
          {milestones.length > 0 && (
            <span className="text-[11px] text-slate-400">{paidMs}/{milestones.length} done</span>
          )}
        </div>

        {milestones.length > 0 && (
          <>
            <div className="h-1.5 bg-slate-200 rounded-full mb-4 overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <ul className="space-y-0">
              {milestones.map(ms => {
                const st = MS_STATUS[ms.status] ?? MS_STATUS.pending
                return (
                  <li key={ms.id} className="flex items-start gap-2.5 py-2.5 border-b border-slate-100 last:border-0">
                    <span className={cn('mt-1.5 h-2 w-2 rounded-full shrink-0', st.dot)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{ms.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{st.label}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 shrink-0 ml-1">
                      {formatCurrency(ms.amount)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </>
        )}

        {/* Loading milestones skeleton */}
        {!contract && conv?.contract_id && (
          <div className="space-y-3 mt-1">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-slate-200 animate-pulse shrink-0" />
                <div className="flex-1 h-3 rounded bg-slate-200 animate-pulse" />
                <div className="h-3 w-12 rounded bg-slate-200 animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {contract && milestones.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-2">No milestones added yet.</p>
        )}
      </div>

      {/* View contract button */}
      <div className="px-4 py-4 border-t border-slate-200 bg-white shrink-0">
        <Link
          to={contractPath}
          className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        >
          View full contract
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

/* ── Empty: no conversation selected ── */
function NoChatSelected() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-6 bg-gray-50">
      <div className="h-20 w-20 rounded-full bg-white shadow-sm flex items-center justify-center">
        <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
        </svg>
      </div>
      <div>
        <p className="text-base font-semibold text-slate-600">Select a conversation</p>
        <p className="text-sm text-slate-400 mt-1 max-w-xs">
          Choose from the list on the left to start messaging
        </p>
      </div>
    </div>
  )
}

/* ── Skeleton ── */
function SkeletonList() {
  return (
    <ul>
      {[1, 2, 3, 4].map(i => (
        <li key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="h-11 w-11 rounded-full bg-slate-200 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-28 rounded bg-slate-200 animate-pulse" />
            <div className="h-3 w-40 rounded bg-slate-100 animate-pulse" />
          </div>
          <div className="h-3 w-8 rounded bg-slate-100 animate-pulse" />
        </li>
      ))}
    </ul>
  )
}

/* ── Empty conversations ── */
function ListEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 gap-3 text-center">
      <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center">
        <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-600">No conversations yet</p>
      <p className="text-xs text-slate-400">Conversations start when a contract is accepted.</p>
    </div>
  )
}
