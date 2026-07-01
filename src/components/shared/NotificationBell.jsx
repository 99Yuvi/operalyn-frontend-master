import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'
import { timeAgo } from '@/lib/utils'

function label(n) {
  try { return n.data?.message ?? n.data?.title ?? 'Notification' }
  catch { return 'Notification' }
}

function notifIcon(n) {
  const type = n.data?.type ?? ''
  if (type.includes('proposal'))  return { bg: 'bg-blue-50',   text: 'text-blue-600',   icon: '📤' }
  if (type.includes('contract'))  return { bg: 'bg-green-50',  text: 'text-green-600',  icon: '🤝' }
  if (type.includes('payment'))   return { bg: 'bg-amber-50',  text: 'text-amber-600',  icon: '💰' }
  if (type.includes('message'))   return { bg: 'bg-purple-50', text: 'text-purple-600', icon: '💬' }
  return { bg: 'bg-slate-100', text: 'text-slate-500', icon: '🔔' }
}

export default function NotificationBell() {
  const { items, unread, handleMarkRead, handleMarkAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  return (
    <div className="relative" ref={ref}>

      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="true"
        className="relative h-9 w-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute top-0.5 end-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none pointer-events-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="dialog"
          aria-label="Notifications panel"
          className="absolute end-0 top-11 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
          style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.06)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800">Notifications</span>
              {unread > 0 && (
                <span className="text-xs font-bold bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full">
                  {unread} new
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="py-10 flex flex-col items-center gap-3 text-center">
                <div className="h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">All caught up</p>
                  <p className="text-xs text-slate-400 mt-0.5">No notifications yet</p>
                </div>
              </div>
            ) : (
              items.map(n => {
                const meta = notifIcon(n)
                return (
                  <button
                    key={n.id}
                    onClick={() => { handleMarkRead(n.id); setOpen(false) }}
                    className={`w-full text-start px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex items-start gap-3 ${!n.read_at ? 'bg-blue-50/40' : ''}`}
                  >
                    {/* Icon */}
                    <div className={`h-8 w-8 rounded-lg ${meta.bg} flex items-center justify-center text-sm shrink-0 mt-0.5`}>
                      {meta.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!n.read_at ? 'font-medium text-slate-800' : 'text-slate-600'}`}>
                        {label(n)}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">{timeAgo(n.created_at)}</p>
                    </div>

                    {/* Unread dot */}
                    {!n.read_at && (
                      <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    )}
                  </button>
                )
              })
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors w-full text-center"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
