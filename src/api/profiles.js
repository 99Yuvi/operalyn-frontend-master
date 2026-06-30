import api from './client'

/* ── Freelancer ── */
export const getFreelancerProfile  = ()       => api.get('/freelancer/profile')
export const updateFreelancerProfile = (data) => api.put('/freelancer/profile', data)
export const uploadResume = (file) => {
  const fd = new FormData()
  fd.append('resume', file)
  return api.post('/freelancer/resume', fd)
}
export const submitVerification = (files) => {
  const fd = new FormData()
  Object.entries(files).forEach(([k, v]) => fd.append(k, v))
  return api.post('/freelancer/verification', fd)
}

/* ── Client ── */
export const getClientProfile    = ()       => api.get('/client/profile')
export const updateClientProfile = (data)   => api.put('/client/profile', data)

/* ── Public ── */
export const getFreelancers = (params) => api.get('/freelancers', { params })
export const getFreelancer  = (id)     => api.get(`/freelancers/${id}`)

/* ── Skills / Categories ── */
export const getSkills     = ()            => api.get('/skills')
export const getCategories = ()            => api.get('/categories')
