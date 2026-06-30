import { io } from 'socket.io-client'

const CHAT_URL = import.meta.env.VITE_CHAT_URL || 'http://localhost:3001'

let socket = null

/** Get (or create) the singleton socket connection with the current Sanctum token */
export function getSocket(token) {
  if (socket?.connected) return socket

  if (socket) {
    socket.disconnect()
    socket = null
  }

  socket = io(CHAT_URL, {
    autoConnect:  true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
    transports:   ['websocket', 'polling'],
    auth:         { token },
  })

  socket.on('connect',       () => console.log('[SOCKET] Connected:', socket.id))
  socket.on('connect_error', (err) => console.warn('[SOCKET] Error:', err.message))
  socket.on('disconnect',    (r)   => console.log('[SOCKET] Disconnected:', r))

  return socket
}

/** Disconnect and clear the singleton (called on logout) */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export { socket }
