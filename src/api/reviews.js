import api from './client'

export const submitReview  = (contractId, data) => api.post(`/contracts/${contractId}/review`, data)
export const respondReview = (reviewId, data)   => api.post(`/reviews/${reviewId}/respond`, data)
export const getUserReviews = (userId, params)  => api.get(`/users/${userId}/reviews`, { params })
