import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'

import type { PaginationParams, PageResponse } from '@/shared/api/types'

import { patchApi } from '../api/patchApi'

import type {
  CumulativePatch,
  CumulativePatchDetail,
  CumulativePatchGenerateRequest,
  PatchFileStructure,
  PatchFileContent,
} from '../model/types'

// Query Keys Factory
export const patchKeys = {
  all: ['patches'] as const,
  lists: () => [...patchKeys.all, 'list'] as const,
  list: (params?: PaginationParams & { releaseType?: string; projectId?: string }) =>
    [...patchKeys.lists(), params] as const,
  details: () => [...patchKeys.all, 'detail'] as const,
  detail: (id: number) => [...patchKeys.details(), id] as const,
  fileStructure: (id: number) => [...patchKeys.all, 'file-structure', id] as const,
  fileContent: (id: number, path: string) => [...patchKeys.all, 'file-content', id, path] as const,
}

// Query Hooks
export const usePatches = (
  params?: PaginationParams & { releaseType?: string; projectId?: string },
  options?: Omit<UseQueryOptions<PageResponse<CumulativePatch>>, 'queryKey' | 'queryFn'>
) =>
  useQuery({
    queryKey: patchKeys.list(params),
    queryFn: () => patchApi.getList(params),
    ...options,
  })

export const usePatch = (
  id: number,
  options?: Omit<UseQueryOptions<CumulativePatchDetail>, 'queryKey' | 'queryFn'>
) =>
  useQuery({
    queryKey: patchKeys.detail(id),
    queryFn: () => patchApi.getById(id),
    enabled: !!id,
    ...options,
  })

export const usePatchFileStructure = (
  patchId: number,
  enabled: boolean = true,
  options?: Omit<UseQueryOptions<PatchFileStructure>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery({
    queryKey: patchKeys.fileStructure(patchId),
    queryFn: () => patchApi.getFileStructure(patchId),
    enabled: enabled && !!patchId,
    ...options,
  })

export const usePatchFileContent = (
  patchId: number,
  path: string,
  enabled: boolean = true,
  options?: Omit<UseQueryOptions<PatchFileContent>, 'queryKey' | 'queryFn' | 'enabled'>
) =>
  useQuery({
    queryKey: patchKeys.fileContent(patchId, path),
    queryFn: () => patchApi.getFileContent(patchId, path),
    enabled: enabled && !!patchId && !!path,
    staleTime: Infinity, // 파일 내용은 변경되지 않음
    ...options,
  })

// Mutation Hooks
export const useGeneratePatch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CumulativePatchGenerateRequest) => patchApi.generate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patchKeys.lists() })
    },
  })
}

export const useDeletePatch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (patchId: number) => patchApi.deleteById(patchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patchKeys.lists() })
      queryClient.invalidateQueries({ queryKey: patchKeys.details() })
    },
  })
}
