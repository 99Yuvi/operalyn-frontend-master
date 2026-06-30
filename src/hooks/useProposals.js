import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/proposals'
import { proposalKeys, projectKeys } from '@/lib/queryKeys'

export const useMyProposals = (params) =>
  useQuery({ queryKey: proposalKeys.mine(), queryFn: () => api.getMyProposals(params) })

export const useProjectProposals = (projectId, params) =>
  useQuery({
    queryKey: proposalKeys.forProject(projectId),
    queryFn:  () => api.getProjectProposals(projectId, params),
    enabled:  !!projectId,
  })

export const useSubmitProposal = (projectId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.submitProposal(projectId, data),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: proposalKeys.mine() })
      qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
    },
  })
}

export const useWithdrawProposal = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.withdrawProposal,
    onSuccess:  () => qc.invalidateQueries({ queryKey: proposalKeys.mine() }),
  })
}

export const useShortlistProposal = (projectId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.shortlistProposal,
    onSuccess:  () => qc.invalidateQueries({ queryKey: proposalKeys.forProject(projectId) }),
  })
}

export const useRejectProposal = (projectId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => api.rejectProposal(id, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: proposalKeys.forProject(projectId) }),
  })
}

export const useAcceptProposal = (projectId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.acceptProposal,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: proposalKeys.forProject(projectId) })
      qc.invalidateQueries({ queryKey: projectKeys.mine() })
    },
  })
}
