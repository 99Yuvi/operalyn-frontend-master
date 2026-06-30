import api from './client'

export const getPayments    = (params) => api.get('/payments', { params })
export const getPayment     = (id)     => api.get(`/payments/${id}`)
export const getInvoiceUrl  = (id)     => `/api/v1/payments/${id}/invoice`
