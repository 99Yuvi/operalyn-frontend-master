import { io } from 'socket.io-client'

const CHAT_URL = import.meta.env.VITE_CHAT_URL || 'http://localhost:3001'

console.log('[SOCKET] Chat server URL:', CHAT_URL)

let socket       = null
let currentToken = null   // track which token the socket was created with

/**
 * Get (or create) the singleton socket connection.
 *
 * Key rule: if a socket already exists (even if still connecting), REUSE it.
 * Only destroy it when the token changes or on explicit logout.
 * Destroying a connecting socket on every conversation navigation was causing
 * an infinite reconnect loop — the socket never had a chance to finish connecting.
 */
export function getSocket(token) {
  // Token changed (e.g. re-login) — must reconnect with new credentials
  if (socket && currentToken !== token) {
    console.log('[SOCKET] Token changed — reconnecting')
    socket.disconnect()
    socket = null
    currentToken = null
  }

  // Socket already exists (connected OR still connecting) — reuse it
  if (socket) return socket

  // Create a fresh socket
  currentToken = token
  console.log('[SOCKET] Connecting to', CHAT_URL, '— token:', token ? token.slice(0, 12) + '…' : 'MISSING')

  socket = io(CHAT_URL, {
    autoConnect:  true,
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionAttempts: Infinity,
    transports:   ['polling', 'websocket'],  // polling first — works through Hostinger proxy
    auth:         { token },
  })

  socket.on('connect',       () => console.log('[SOCKET] Connected:', socket.id))
  socket.on('connect_error', (err) => console.error('[SOCKET] Error:', err.message, err))
  socket.on('disconnect',    (r)   => console.log('[SOCKET] Disconnected:', r))

  return socket
}

/** Disconnect and clear the singleton (called on logout) */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
    currentToken = null
  }
}

export { socket }
