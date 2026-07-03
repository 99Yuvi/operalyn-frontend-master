import api from './client'

export const getConversations      = (params)      => api.get('/conversations', { params })
export const getConversation       = (id)          => api.get(`/conversations/${id}`)
export const getMessages           = (id, params)  => api.get(`/conversations/${id}/messages`, { params })
export const markConversationRead  = (id)          => api.patch(`/conversations/${id}/read`)

export function uploadChatFile(conversationId, file) {
  const form = new FormData()
  form.append('file', file)
  return api.post(`/conversations/${conversationId}/upload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
