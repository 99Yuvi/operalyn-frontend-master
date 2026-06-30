import api from './client'

export const getConversations      = ()            => api.get('/conversations')
export const getConversation       = (id)          => api.get(`/conversations/${id}`)
export const getMessages           = (id, params)  => api.get(`/conversations/${id}/messages`, { params })
export const markConversationRead  = (id)          => api.patch(`/conversations/${id}/read`)
