import api from './client'

/* ── Public browse ── */
export const browseProjects = (params) => api.get('/projects', { params })
export const getProject     = (id)     => api.get(`/projects/${id}`)

/* ── Client ── */
export const getMyProjects   = (params) => api.get('/client/projects', { params })
export const getMyProject    = (id)     => api.get(`/client/projects/${id}`)
export const createProject   = (data)   => api.post('/client/projects', data)
export const updateProject   = (id, data) => api.put(`/client/projects/${id}`, data)
export const deleteProject   = (id)     => api.delete(`/client/projects/${id}`)
