import api, { initCsrf } from './client'

export async function register(data) {
  await initCsrf()
  return api.post('/register', data)
}

export async function login(data) {
  await initCsrf()
  return api.post('/login', data)
}

export function logout() {
  return api.post('/logout')
}

export function getMe() {
  return api.get('/auth/me')
}

export function getSocketToken() {
  return api.get('/auth/socket-token')
}

export function resendVerification() {
  return api.post('/email/resend')
}

export function forgotPassword(data) {
  return api.post('/forgot-password', data)
}

export function resetPassword(data) {
  return api.post('/reset-password', data)
}
