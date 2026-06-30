import api from './client'

/* ── Contracts ── */
export const getContracts = (params) => api.get('/contracts', { params })
export const getContract  = (id)     => api.get(`/contracts/${id}`)

/* ── Milestones ── */
export const addMilestone      = (contractId, data) => api.post(`/contracts/${contractId}/milestones`, data)
export const updateMilestone   = (id, data)         => api.put(`/milestones/${id}`, data)
export const deleteMilestone   = (id)               => api.delete(`/milestones/${id}`)
export const deliverMilestone  = (id, data)         => {
  // multipart/form-data for file uploads
  const fd = new FormData()
  fd.append('note', data.note)
  if (data.files) {
    data.files.forEach((f) => fd.append('files[]', f))
  }
  return api.post(`/milestones/${id}/deliver`, fd)
}
export const approveMilestone        = (id)    => api.post(`/milestones/${id}/approve`)
export const requestMilestoneRevision = (id, data) => api.post(`/milestones/${id}/request-revision`, data)

/* ── File download ── */
export const getDeliveryFileUrl = (deliveryId, fileId) =>
  `/api/v1/deliveries/${deliveryId}/files/${fileId}`
