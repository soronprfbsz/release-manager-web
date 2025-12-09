import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'

import { releaseApi } from '../api/releaseApi'
import type { ReleaseTreeResponse, ReleaseVersionDetail, ReleaseFileStructure } from '../model/types'

// Query Keys Factory
export const releaseKeys = {
  all: ['releases'] as const,
  trees: () => [...releaseKeys.all, 'tree'] as const,
  standardTree: (projectId: string) => [...releaseKeys.trees(), 'standard', projectId] as const,
  customTree: (projectId: string, customerCode: string) => [...releaseKeys.trees(), 'custom', projectId, customerCode] as const,
  versions: () => [...releaseKeys.all, 'version'] as const,
  version: (id: number) => [...releaseKeys.versions(), id] as const,
  fileStructure: (id: number) => [...releaseKeys.versions(), id, 'files'] as const,
  fileContent: (fileId: number) => [...releaseKeys.all, 'file-content', fileId] as const,
}

// Query Hooks
export const useStandardReleaseTree = (
  projectId: string,
  options?: Omit<UseQueryOptions<ReleaseTreeResponse>, 'queryKey' | 'queryFn'>
) =>
  useQuery({
    queryKey: releaseKeys.standardTree(projectId),
    queryFn: () => releaseApi.getStandardTree(projectId),
    ...options,
  })

export const useCustomReleaseTree = (
  projectId: string,
  customerCode: string,
  options?: Omit<UseQueryOptions<ReleaseTreeResponse>, 'queryKey' | 'queryFn'>
) =>
  useQuery({
    queryKey: releaseKeys.customTree(projectId, customerCode),
    queryFn: () => releaseApi.getCustomTree(projectId, customerCode),
    enabled: !!customerCode,
    ...options,
  })

export const useReleaseVersion = (
  id: number,
  options?: Omit<UseQueryOptions<ReleaseVersionDetail>, 'queryKey' | 'queryFn'>
) =>
  useQuery({
    queryKey: releaseKeys.version(id),
    queryFn: () => releaseApi.getVersionById(id),
    enabled: !!id,
    ...options,
  })

export const useVersionFileStructure = (
  versionId: number,
  options?: Omit<UseQueryOptions<ReleaseFileStructure>, 'queryKey' | 'queryFn'>
) =>
  useQuery({
    queryKey: releaseKeys.fileStructure(versionId),
    queryFn: () => releaseApi.getVersionFileStructure(versionId),
    enabled: !!versionId,
    ...options,
  })

export const useReleaseFileContent = (
  fileId: number,
  enabled: boolean = true,
  options?: Omit<UseQueryOptions<string>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery({
    queryKey: releaseKeys.fileContent(fileId),
    queryFn: () => releaseApi.getFileContent(fileId),
    enabled: enabled && !!fileId,
    staleTime: Infinity, // 파일 내용은 변경되지 않음
    ...options,
  })

// Mutation Hooks
interface CreateVersionParams {
  projectId: string
  version: string
  comment: string
  releaseCategory: string
  patchFiles: File
  onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
}

export const useCreateVersion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreateVersionParams) =>
      releaseApi.createVersion(
        params.projectId,
        params.version,
        params.comment,
        params.releaseCategory,
        params.patchFiles,
        params.onUploadProgress
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: releaseKeys.trees() })
    },
  })
}

export const useDeleteVersion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (versionId: number) => releaseApi.deleteVersion(versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: releaseKeys.trees() })
      queryClient.invalidateQueries({ queryKey: releaseKeys.versions() })
    },
  })
}
