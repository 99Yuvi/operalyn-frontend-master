import api from './client'

/* ── Dashboard ── */
export const getAdminDashboard   = ()         => api.get('/admin/dashboard')

/* ── Users ── */
export const getAdminUsers       = (p)        => api.get('/admin/users', { params: p })
export const getAdminUser        = (id)       => api.get(`/admin/users/${id}`)
export const updateUserStatus    = (id, data) => api.patch(`/admin/users/${id}/status`, data)
export const deleteUser          = (id, data) => api.delete(`/admin/users/${id}`, { data })

/* ── Verifications ── */
export const getVerifications    = (p)        => api.get('/admin/verifications', { params: p })
export const updateVerification  = (id, data) => api.patch(`/admin/verifications/${id}`, data)
export const getDocUrl           = (profileId, docId) =>
  `/api/v1/admin/verifications/${profileId}/documents/${docId}`

/* ── Categories ── */
export const getAdminCategories  = ()         => api.get('/admin/categories')
export const createCategory      = (data)     => api.post('/admin/categories', data)
export const updateCategory      = (id, data) => api.put(`/admin/categories/${id}`, data)
export const deleteCategory      = (id)       => api.delete(`/admin/categories/${id}`)

/* ── Settings ── */
export const getSettings         = ()         => api.get('/admin/settings')
export const updateSettings      = (data)     => api.put('/admin/settings', data)
export const getPublicSettings   = ()         => api.get('/settings/public')

/* ── Payments ── */
export const getAdminPayments    = (p)        => api.get('/admin/payments', { params: p })
export const exportPaymentsCsv   = ()         => `/api/v1/admin/payments?export=csv`

/* ── Reviews ── */
export const getAdminReviews     = (p)        => api.get('/admin/reviews', { params: p })
export const hideReview          = (id, data) => api.patch(`/admin/reviews/${id}/hide`, data)
export const unhideReview        = (id)       => api.patch(`/admin/reviews/${id}/unhide`)

/* ── Audit Logs ── */
export const getAuditLogs        = (p)        => api.get('/admin/audit-logs', { params: p })

/* ── Reports ── */
export const getReports          = (p)        => api.get('/admin/reports/overview', { params: p })
