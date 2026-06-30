import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/contracts'
import { contractKeys } from '@/lib/queryKeys'

export const useContracts = (params) =>
  useQuery({ queryKey: contractKeys.list(params), queryFn: () => api.getContracts(params) })

export const useContract = (id) =>
  useQuery({ queryKey: contractKeys.detail(id), queryFn: () => api.getContract(id), enabled: !!id })

/* ── Milestone mutations ── */

const invalidate = (qc, id) => qc.invalidateQueries({ queryKey: contractKeys.detail(id) })

export const useAddMilestone = (contractId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.addMilestone(contractId, data),
    onSuccess:  () => invalidate(qc, contractId),
  })
}

export const useUpdateMilestone = (contractId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => api.updateMilestone(id, data),
    onSuccess:  () => invalidate(qc, contractId),
  })
}

export const useDeleteMilestone = (contractId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteMilestone,
    onSuccess:  () => invalidate(qc, contractId),
  })
}

export const useDeliverMilestone = (contractId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => api.deliverMilestone(id, data),
    onSuccess:  () => invalidate(qc, contractId),
  })
}

export const useApproveMilestone = (contractId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.approveMilestone,
    onSuccess:  () => {
      invalidate(qc, contractId)
      qc.invalidateQueries({ queryKey: contractKeys.list({}) })
    },
  })
}

export const useRequestRevision = (contractId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => api.requestMilestoneRevision(id, data),
    onSuccess:  () => invalidate(qc, contractId),
  })
}
