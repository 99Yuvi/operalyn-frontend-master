import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { getConversations } from '@/api/conversations'
import { getInitials, getAvatarColor, timeAgo, cn } from '@/lib/utils'

export default function ConversationsList() {
  const { user }    = useAuth()
  const isClient    = user?.role === 'client'
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn:  getConversations,
    refetchInterval: 30_000, // refresh unread counts every 30s
  })

  const conversations = (data?.data ?? []).filter(conv => {
    if (!search.trim()) return true
    const other = isClient ? conv.freelancer : conv.client
    return other?.name?.toLowerCase().includes(search.toLowerCase()) ||
           conv.contract?.project?.title?.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="flex flex-col h-full max-h-[calc(100dvh-4rem)]">

      {/* ── Header ── */}
      <div className="shrink-0 px-4 pt-5 pb-3 bg-white border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
          Messages
        </h2>

        {/* Search bar */}
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

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <SkeletonList />
        ) : conversations.length === 0 && !search ? (
          <EmptyState />
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.197 5.197a7.5 7.5 0 0 0 10.606 10.606Z" />
            </svg>
            <p className="text-sm">No results for "{search}"</p>
          </div>
        ) : (
          <ul>
            {conversations.map((conv, idx) => (
              <ConversationRow
                key={conv.id}
                conv={conv}
                isClient={isClient}
                user={user}
                isLast={idx === conversations.length - 1}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/* ── Single conversation row ── */
function ConversationRow({ conv, isClient, user, isLast }) {
  const other    = isClient ? conv.freelancer : conv.client
  const colors   = getAvatarColor(other?.name ?? '')
  const chatPath = isClient ? `/client/chat/${conv.id}` : `/freelancer/chat/${conv.id}`
  const hasUnread = conv.unread_count > 0

  const lastMsg  = conv.latest_message
  const isMine   = lastMsg?.sender_id === user?.id
  const preview  = lastMsg?.body
    ? (isMine ? `You: ${lastMsg.body}` : lastMsg.body)
    : conv.contract?.project?.title ?? 'Start a conversation'

  const timestamp = conv.last_message_at ?? conv.created_at

  return (
    <li>
      <Link
        to={chatPath}
        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors"
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className={cn(
            'h-12 w-12 rounded-full text-sm font-bold flex items-center justify-center select-none',
            colors.bg, colors.text
          )}>
            {getInitials(other?.name ?? '')}
          </div>
          {hasUnread && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
          )}
        </div>

        {/* Name + preview */}
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm truncate leading-tight', hasUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800')}>
            {other?.name}
          </p>
          <p className={cn('text-xs truncate mt-0.5 leading-snug', hasUnread ? 'text-slate-600 font-medium' : 'text-slate-400')}>
            {preview}
          </p>
        </div>

        {/* Time + badge */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          {timestamp && (
            <span className={cn('text-[11px] leading-none', hasUnread ? 'text-green-600 font-semibold' : 'text-slate-400')}>
              {timeAgo(timestamp)}
            </span>
          )}
          {hasUnread ? (
            <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-green-500 text-white text-[11px] font-bold flex items-center justify-center">
              {conv.unread_count > 99 ? '99+' : conv.unread_count}
            </span>
          ) : (
            <span className="h-5 w-5" /> // spacer to keep alignment
          )}
        </div>
      </Link>

      {/* Hairline divider — skip on last item */}
      {!isLast && <div className="ml-[64px] h-px bg-slate-100" />}
    </li>
  )
}

/* ── Skeleton loader ── */
function SkeletonList() {
  return (
    <ul>
      {[1, 2, 3, 4, 5].map((i) => (
        <li key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="h-12 w-12 rounded-full bg-slate-200 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-32 rounded bg-slate-200 animate-pulse" />
            <div className="h-3 w-48 rounded bg-slate-100 animate-pulse" />
          </div>
          <div className="h-3 w-8 rounded bg-slate-100 animate-pulse" />
        </li>
      ))}
    </ul>
  )
}

/* ── Empty state ── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 gap-3 text-center">
      <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-1">
        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
        </svg>
      </div>
      <p className="text-base font-semibold text-slate-700">No messages yet</p>
      <p className="text-sm text-slate-400 max-w-xs">
        Conversations open automatically when a contract starts.
      </p>
    </div>
  )
}
