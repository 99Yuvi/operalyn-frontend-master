import { useEffect, useRef, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getSocket } from '@/lib/socket'
import { conversationKeys } from '@/lib/queryKeys'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Manages a Socket.io room for a single conversation.
 * Merges real-time messages into the React Query cache.
 */
export function useConversation(conversationId, { onMessageConfirmed } = {}) {
  const qc                          = useQueryClient()
  const socketRef                   = useRef(null)
  const [online, setOnline]         = useState(false)
  const [typing, setTyping]         = useState(false)
  const typingTimeout               = useRef(null)
  const onConfirmedRef              = useRef(onMessageConfirmed)
  useEffect(() => { onConfirmedRef.current = onMessageConfirmed }, [onMessageConfirmed])

  const { socketToken, user } = useAuth()
  const token  = socketToken ?? ''
  const userId = user?.id

  useEffect(() => {
    if (!conversationId || !token) return   // wait until real token is available

    const socket = getSocket(token)
    socketRef.current = socket

    // Join room immediately if already connected; otherwise socket.io buffers it.
    // Also re-join on every reconnect — socket.io drops room membership on disconnect.
    const joinRoom = () => socket.emit('join_conversation', { conversationId })
    socket.on('connect', joinRoom)
    joinRoom()

    /* ── Incoming events ── */
    const onNewMessage = (msg) => {
      qc.setQueryData(conversationKeys.messages(conversationId), (old) => {
        if (!old) return { data: [msg], meta: {} }
        // Avoid duplicates (our own optimistic message gets replaced by tempId)
        const filtered = (old.data ?? []).filter(m => m.id !== msg.id && m.tempId !== msg.tempId)
        return { ...old, data: [msg, ...filtered] }
      })
      // Clear optimistic message immediately when confirmed
      if (msg.tempId) onConfirmedRef.current?.(msg.tempId)
    }

    const onUserOnline  = ()  => setOnline(true)
    const onUserOffline = ()  => setOnline(false)
    const onUserTyping  = ()  => {
      setTyping(true)
      if (typingTimeout.current) clearTimeout(typingTimeout.current)
      typingTimeout.current = setTimeout(() => setTyping(false), 3500)
    }
    const onStopTyping  = ()  => { setTyping(false); clearTimeout(typingTimeout.current) }
    const onReadReceipt = ({ readAt } = {}) => {
      // Optimistically mark all own sent messages as read using the timestamp
      // the receiver's client already sent — avoids a refetch race where the
      // PATCH hasn't committed to DB yet by the time the refetch fires.
      const ts = readAt ?? new Date().toISOString()
      qc.setQueryData(conversationKeys.messages(conversationId), (old) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.map(m =>
            m.sender_id === userId && !m.read_at ? { ...m, read_at: ts } : m
          ),
        }
      })
    }

    socket.on('new_message',         onNewMessage)
    socket.on('user_online',         onUserOnline)
    socket.on('user_offline',        onUserOffline)
    socket.on('user_typing',         onUserTyping)
    socket.on('user_stopped_typing', onStopTyping)
    socket.on('read_receipt',        onReadReceipt)

    return () => {
      socket.emit('leave_conversation', { conversationId })
      socket.off('connect',             joinRoom)
      socket.off('new_message',         onNewMessage)
      socket.off('user_online',         onUserOnline)
      socket.off('user_offline',        onUserOffline)
      socket.off('user_typing',         onUserTyping)
      socket.off('user_stopped_typing', onStopTyping)
      socket.off('read_receipt',        onReadReceipt)
      clearTimeout(typingTimeout.current)
    }
  }, [conversationId, token])

  const sendMessage = useCallback((body, tempId) => {
    socketRef.current?.emit('send_message', { conversationId, body, tempId })
  }, [conversationId])

  const emitTypingStart = useCallback(() => {
    socketRef.current?.emit('typing_start', { conversationId })
  }, [conversationId])

  const emitTypingStop = useCallback(() => {
    socketRef.current?.emit('typing_stop', { conversationId })
  }, [conversationId])

  const emitMessagesRead = useCallback(() => {
    socketRef.current?.emit('messages_read', { conversationId })
  }, [conversationId])

  return { online, typing, sendMessage, emitTypingStart, emitTypingStop, emitMessagesRead }
}
