import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/projects'
import { projectKeys } from '@/lib/queryKeys'

export const useBrowseProjects = (params) =>
  useQuery({ queryKey: projectKeys.list(params), queryFn: () => api.browseProjects(params) })

export const useProject = (id) =>
  useQuery({ queryKey: projectKeys.detail(id), queryFn: () => api.getProject(id), enabled: !!id })

export const useMyProjects = (params) =>
  useQuery({ queryKey: projectKeys.mine(), queryFn: () => api.getMyProjects(params) })

export const useMyProject = (id) =>
  useQuery({ queryKey: [...projectKeys.detail(id), 'client'], queryFn: () => api.getMyProject(id), enabled: !!id })

export const useCreateProject = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.mine() }),
  })
}

export const useUpdateProject = (id) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.updateProject(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.mine() })
      qc.invalidateQueries({ queryKey: projectKeys.detail(id) })
    },
  })
}

export const useDeleteProject = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.mine() }),
  })
}
