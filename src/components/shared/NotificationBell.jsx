import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '@/contexts/NotificationContext'
import { timeAgo } from '@/lib/utils'

export default function NotificationBell() {
  const { items, unread, handleMarkRead, handleMarkAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const toggle = () => setOpen(o => !o)

  // Parse notification data — Laravel stores JSON in `data` field
  const label = (n) => {
    try { return n.data?.message ?? n.data?.title ?? 'Notification' }
    catch { return 'Notification' }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        className="relative h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <span className="text-xl leading-none">🔔</span>
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-11 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-800">Notifications</span>
              {unread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">
                  No notifications yet
                </div>
              ) : (
                items.map(n => (
                  <div
                    key={n.id}
                    onClick={() => { handleMarkRead(n.id); setOpen(false) }}
                    className={`px-4 py-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${!n.read_at ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read_at && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      )}
                      <div className={!n.read_at ? '' : 'pl-4'}>
                        <p className="text-sm text-slate-700 leading-snug">{label(n)}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{timeAgo(n.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-4 py-2.5 border-t border-slate-100 text-center">
              <button onClick={() => setOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
