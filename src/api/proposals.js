import api from './client'

/* ── Freelancer ── */
export const submitProposal   = (projectId, data) => api.post(`/freelancer/projects/${projectId}/proposals`, data)
export const updateProposal   = (id, data)         => api.put(`/freelancer/proposals/${id}`, data)
export const withdrawProposal = (id)               => api.delete(`/freelancer/proposals/${id}`)
export const getMyProposals   = (params)           => api.get('/freelancer/proposals', { params })

/* ── Client ── */
export const getProjectProposals = (projectId, params) => api.get(`/client/projects/${projectId}/proposals`, { params })
export const shortlistProposal   = (id)  => api.patch(`/client/proposals/${id}/shortlist`)
export const rejectProposal      = (id, data) => api.patch(`/client/proposals/${id}/reject`, data)
export const acceptProposal      = (id)  => api.post(`/client/proposals/${id}/accept`)
