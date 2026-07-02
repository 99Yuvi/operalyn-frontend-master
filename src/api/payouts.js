import api from './client'

export const getMyPayouts    = (params) => api.get('/freelancer/payouts', { params })
export const requestPayout   = (data)   => api.post('/freelancer/payouts', data)
export const getAdminPayouts = (params) => api.get('/admin/payouts', { params })
export const approveAdminPayout = (id, data) => api.post(`/admin/payouts/${id}/approve`, data)
export const rejectAdminPayout  = (id, data) => api.post(`/admin/payouts/${id}/reject`, data)
