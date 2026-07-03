import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { getSocket } from '@/lib/socket'
import { getInitials, getAvatarColor, cn } from '@/lib/utils'

/* ── Module-level unseen counter (shared with layout nav badge) ─────────── */
let unseenCount = 0
const listeners = new Set()
const setUnseen = (n) => {
  unseenCount = n
  listeners.forEach(l => l())
}

/** Nav badge hook — returns how many chat messages arrived while user was elsewhere */
export function useUnseenMessages() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb) },
    () => unseenCount,
  )
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
const BASE_TITLE = typeof document !== 'undefined' ? document.title : 'Operalyn'

function previewText(msg) {
  if (msg.body) return msg.body
  if (msg.type === 'image') return '📷 Photo'
  if (msg.type === 'video') return '🎥 Video'
  return '📄 Document'
}

/** Short two-tone notification sound via Web Audio — no asset file needed */
function playDing() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const play = (freq, start, dur) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.08, ctx.currentTime + start)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur)
      osc.start(ctx.currentTime + start)
      osc.stop(ctx.currentTime + start + dur)
    }
    play(880, 0, 0.15)
    play(1174, 0.12, 0.2)
    setTimeout(() => ctx.close().catch(() => {}), 600)
  } catch { /* autoplay blocked before first interaction — ignore */ }
}

/* ── Component — mount once inside Client / Freelancer layout ───────────── */
export default function ChatNotifications() {
  const { socketToken, user } = useAuth()
  const qc         = useQueryClient()
  const location   = useLocation()
  const navigate   = useNavigate()
  const [toasts, setToasts] = useState([])   // [{ id, msg }]

  const chatBase     = user?.role === 'client' ? '/client/chat' : '/freelancer/chat'
  const pathRef      = useRef(location.pathname)
  useEffect(() => { pathRef.current = location.pathname }, [location.pathname])

  // Opening the chat section clears the unseen counter + title flash
  useEffect(() => {
    if (location.pathname.startsWith(chatBase)) {
      setUnseen(0)
      document.title = BASE_TITLE
    }
  }, [location.pathname, chatBase])

  // Restore title when the tab becomes visible again
  useEffect(() => {
    const onVisible = () => { if (!document.hidden) document.title = BASE_TITLE }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  // Ask for browser notification permission once (no-op if already decided)
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  }, [])

  const dismissToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  const openConversation = (conversationId) => {
    navigate(`${chatBase}/${conversationId}`)
    setUnseen(0)
    document.title = BASE_TITLE
  }

  useEffect(() => {
    if (!socketToken) return
    const socket = getSocket(socketToken)

    const onNotify = (msg) => {
      // Refresh conversation list unread badges instantly (no 30s wait)
      qc.invalidateQueries({ queryKey: ['conversations'] })

      const activeMatch = pathRef.current.match(/\/chat\/(\d+)/)
      const isActiveConvo = activeMatch && Number(activeMatch[1]) === Number(msg.conversation_id)

      // Conversation already open and tab visible → ChatView shows it live
      if (isActiveConvo && !document.hidden) return

      playDing()
      const nextUnseen = unseenCount + 1
      setUnseen(nextUnseen)

      if (document.hidden) {
        // Scenario C — tab in background: title flash + desktop notification
        document.title = `(${nextUnseen}) New message — ${BASE_TITLE}`
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            const n = new Notification(msg.sender?.name ?? 'New message', {
              body: previewText(msg),
              tag: `conversation-${msg.conversation_id}`,   // collapse per conversation
            })
            n.onclick = () => {
              window.focus()
              openConversation(msg.conversation_id)
              n.close()
            }
          } catch { /* some browsers block the Notification constructor — ignore */ }
        }
      } else if (!isActiveConvo) {
        // Scenario B — online, different page: in-app toast
        const id = `${msg.id}_${Date.now()}`
        setToasts(prev => [...prev.slice(-2), { id, msg }])   // max 3 stacked
        setTimeout(() => dismissToast(id), 6000)
      }
    }

    socket.on('message_notification', onNotify)
    return () => socket.off('message_notification', onNotify)
  }, [socketToken, qc])   // eslint-disable-line react-hooks/exhaustive-deps

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[320px] max-w-[calc(100vw-2rem)]">
      {toasts.map(({ id, msg }) => {
        const name   = msg.sender?.name ?? 'New message'
        const colors = getAvatarColor(name)
        return (
          <button
            key={id}
            type="button"
            onClick={() => { dismissToast(id); openConversation(msg.conversation_id) }}
            className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white shadow-lg px-3.5 py-3 text-left hover:bg-slate-50 transition-colors animate-[slide-in_0.2s_ease-out]"
          >
            <div className={cn(
              'h-9 w-9 rounded-full text-xs font-bold flex items-center justify-center shrink-0',
              colors.bg, colors.text
            )}>
              {getInitials(name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
              <p className="text-xs text-slate-500 truncate mt-0.5">{previewText(msg)}</p>
            </div>
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => { e.stopPropagation(); dismissToast(id) }}
              className="text-slate-300 hover:text-slate-500 shrink-0 leading-none text-lg px-1"
              aria-label="Dismiss"
            >
              ×
            </span>
          </button>
        )
      })}
      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
