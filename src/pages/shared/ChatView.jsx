import { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { useConversation } from '@/hooks/useConversation'
import { getConversation, getMessages, markConversationRead } from '@/api/conversations'
import { conversationKeys } from '@/lib/queryKeys'
import { cn, getInitials, getAvatarColor, timeAgo } from '@/lib/utils'

export default function ChatView() {
  const { conversationId }  = useParams()
  const { user }            = useAuth()
  const scrollRef           = useRef(null)   // the scrollable messages container
  const inputRef            = useRef(null)
  const isFirstScroll       = useRef(true)

  const [input, setInput]   = useState('')
  const [sending, setSending] = useState(false)
  const [pendingMsgs, setPending] = useState([])

  const { online, typing, sendMessage, emitTypingStart, emitTypingStop, emitMessagesRead } =
    useConversation(conversationId, {
      onMessageConfirmed: (tempId) => {
        setPending(prev => prev.filter(m => m.tempId !== tempId))
        setSending(false)
      },
    })

  // Fetch conversation meta
  const { data: convData } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn:  () => getConversation(conversationId),
    enabled:  !!conversationId,
  })

  // Fetch message history (API returns newest-first; we reverse for display)
  const { data: msgData, isLoading: loadingMsgs } = useQuery({
    queryKey: conversationKeys.messages(conversationId),
    queryFn:  () => getMessages(conversationId),
    enabled:  !!conversationId,
    staleTime: 0,
  })

  const conv     = convData?.data
  // Reverse so oldest is at top, newest is at bottom — WhatsApp order
  const messages = [...(msgData?.data ?? [])].reverse()

  // Mark as read when opened
  useEffect(() => {
    if (conversationId) {
      markConversationRead(conversationId).catch(() => {})
      emitMessagesRead()
    }
  }, [conversationId])

  // Scroll to bottom.
  // On first load: instant jump (user should land on newest message).
  // On new messages: smooth scroll only if already near the bottom.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    if (isFirstScroll.current) {
      // Jump instantly to bottom on initial load
      el.scrollTop = el.scrollHeight
      isFirstScroll.current = false
    } else {
      // Only auto-scroll if user is within 150px of the bottom
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      if (distFromBottom < 150) {
        el.scrollTop = el.scrollHeight
      }
    }
  }, [messages.length, pendingMsgs.length, typing])

  // Typing debounce
  const typingTimeout = useRef(null)
  const handleInputChange = (e) => {
    setInput(e.target.value)
    emitTypingStart()
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(emitTypingStop, 1500)
  }

  const handleSend = useCallback(() => {
    const body = input.trim()
    if (!body || sending) return

    const tempId = `temp_${Date.now()}`

    setPending(prev => [...prev, { tempId, body, sender_id: user.id, created_at: new Date().toISOString() }])
    setInput('')
    emitTypingStop()
    setSending(true)

    sendMessage(body, tempId)

    // Scroll to bottom immediately when sending
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    })

    // Fallback: clear optimistic after 6s if socket never confirms
    setTimeout(() => {
      setPending(prev => prev.filter(m => m.tempId !== tempId))
      setSending(false)
    }, 6000)
  }, [input, sending, user?.id, sendMessage])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isClient     = user?.role === 'client'
  const otherUser    = conv ? (isClient ? conv.freelancer : conv.client) : null
  const otherColors  = getAvatarColor(otherUser?.name ?? '')
  const listPath     = isClient ? '/client/chat' : '/freelancer/chat'
  const contractPath = isClient
    ? `/client/contracts/${conv?.contract_id}`
    : `/freelancer/contracts/${conv?.contract_id}`

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-white shrink-0">
        {/* Mobile: back to conversations list */}
        <Link to={listPath} className="md:hidden text-slate-400 hover:text-slate-600 text-sm shrink-0">←</Link>
        {/* Desktop: link to contract detail */}
        <Link to={contractPath} className="hidden md:block text-slate-400 hover:text-slate-600 text-sm shrink-0">←</Link>

        {otherUser && (
          <>
            <div className="relative shrink-0">
              <div className={cn(
                'h-9 w-9 rounded-full text-sm font-semibold flex items-center justify-center',
                otherColors.bg, otherColors.text
              )}>
                {getInitials(otherUser.name)}
              </div>
              {online && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 leading-tight">{otherUser.name}</p>
              <p className="text-xs text-slate-400">
                {typing ? (
                  <span className="text-green-600 animate-pulse">typing…</span>
                ) : online ? (
                  <span className="text-green-600">Online</span>
                ) : 'Offline'}
              </p>
            </div>
          </>
        )}

        <div className="ml-auto text-xs text-slate-400 truncate max-w-[200px]">
          {conv?.contract?.project?.title}
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4"
      >
        {loadingMsgs ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-slate-400">Loading messages…</p>
          </div>
        ) : messages.length === 0 && pendingMsgs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <p className="text-3xl">💬</p>
            <p className="text-sm text-slate-500">No messages yet. Say hello!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* oldest messages at top */}
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.sender_id === user?.id}
                showTime={shouldShowTime(messages, i)}
              />
            ))}
            {/* pending (optimistic) messages always at the very bottom */}
            {pendingMsgs.map(msg => (
              <MessageBubble key={msg.tempId} message={msg} isOwn sending />
            ))}
            {/* WhatsApp-style typing indicator bubble */}
            {typing && <TypingBubble />}
          </div>
        )}
      </div>

      {/* ── Input ── */}
      <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send)"
            rows={1}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-400 max-h-32 overflow-y-auto"
            style={{ minHeight: '42px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="h-10 w-10 rounded-xl bg-slate-700 text-white flex items-center justify-center hover:bg-slate-800 disabled:opacity-40 transition-colors shrink-0"
          >
            <SendIcon />
          </button>
        </div>
        <p className="text-xs text-slate-300 mt-1 text-center">Shift+Enter for new line</p>
      </div>
    </div>
  )
}

/* ── Helpers ── */

// Show a time separator when gap between messages is > 5 minutes
function shouldShowTime(messages, index) {
  if (index === 0) return true
  const prev = new Date(messages[index - 1].created_at)
  const curr = new Date(messages[index].created_at)
  return curr - prev > 5 * 60 * 1000
}

/* ── Message bubble ── */
function MessageBubble({ message, isOwn, sending = false, showTime = false }) {
  return (
    <>
      {showTime && (
        <div className="flex justify-center my-1">
          <span className="text-[10px] text-slate-400 bg-gray-200 rounded-full px-3 py-0.5">
            {formatTime(message.created_at)}
          </span>
        </div>
      )}
      <div className={cn('flex items-end gap-1.5', isOwn ? 'justify-end' : 'justify-start')}>
        <div className={cn(
          'max-w-[72%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm',
          isOwn
            ? 'bg-slate-700 text-white rounded-br-sm'
            : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm',
          sending && 'opacity-60'
        )}>
          <p className="whitespace-pre-wrap break-words">{message.body}</p>
          <div className={cn('flex items-center gap-1 mt-0.5', isOwn ? 'justify-end' : 'justify-start')}>
            <span className={cn('text-[10px] leading-none', isOwn ? 'text-slate-300' : 'text-slate-400')}>
              {timeAgo(message.created_at)}
            </span>
            {isOwn && (
              <span className="text-[10px] leading-none text-slate-300">
                {sending ? '·' : message.read_at ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

/* ── WhatsApp-style typing bubble ── */
function TypingBubble() {
  return (
    <>
      <style>{`
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-5px); opacity: 1; }
        }
        .typing-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #94a3b8;
          animation: typing-bounce 1.2s ease-in-out infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>
      <div className="flex justify-start">
        <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm shadow-sm px-4 py-3 flex items-center gap-1.5">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </>
  )
}

function SendIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
  )
}

function formatTime(iso) {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
