import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { getNotifications, markAllRead, markRead } from '@/api/notifications'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

const POLL_INTERVAL = 60_000 // 60 seconds

export function NotificationProvider({ children }) {
  const { user }              = useAuth()
  const [items, setItems]     = useState([])
  const [unread, setUnread]   = useState(0)
  const intervalRef           = useRef(null)

  const fetchNotifications = async () => {
    if (!user) return
    try {
      const { data, meta } = await getNotifications()
      setItems(data ?? [])
      setUnread(meta?.unread_count ?? 0)
    } catch {}
  }

  useEffect(() => {
    if (!user) { setItems([]); setUnread(0); return }
    fetchNotifications()
    intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL)
    return () => clearInterval(intervalRef.current)
  }, [user?.id])

  const handleMarkRead = async (id) => {
    try {
      await markRead(id)
      setItems(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      setUnread(prev => Math.max(0, prev - 1))
    } catch {}
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllRead()
      setItems(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })))
      setUnread(0)
    } catch {}
  }

  return (
    <NotificationContext.Provider value={{ items, unread, handleMarkRead, handleMarkAllRead, refresh: fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
