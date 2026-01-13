import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'

import type { PaginationParams, PageResponse } from '@/shared/api/types'

import { patchApi } from '../api/patchApi'

import type {
  CumulativePatch,
  CumulativePatchDetail,
  CumulativePatchGenerateRequest,
  CustomPatchGenerateRequest,
  CustomPatchCustomer,
  CustomPatchVersion,
  PatchFileStructure,
  PatchFileContent,
} from '../model/types'

// Query Keys Factory
export const patchKeys = {
  all: ['patches'] as const,
  lists: () => [...patchKeys.all, 'list'] as const,
  list: (params?: PaginationParams & { releaseType?: string; projectId?: string; customerCode?: string }) =>
    [...patchKeys.lists(), params] as const,
  details: () => [...patchKeys.all, 'detail'] as const,
  detail: (id: number) => [...patchKeys.details(), id] as const,
  fileStructure: (id: number) => [...patchKeys.all, 'file-structure', id] as const,
  fileContent: (id: number, path: string) => [...patchKeys.all, 'file-content', id, path] as const,
  // Custom patch keys
  customCustomers: (projectId: string) => [...patchKeys.all, 'custom-customers', projectId] as const,
  customVersions: (customerId: number, projectId: string) =>
    [...patchKeys.all, 'custom-versions', customerId, projectId] as const,
}

// Query Hooks
export const usePatches = (
  params?: PaginationParams & { releaseType?: string; projectId?: string; customerCode?: string },
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

/** 패치 파일 내용 조회 (통합 API - 텍스트/바이너리 모두 지원) */
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

// Custom Patch Query Hooks
export const useCustomPatchCustomers = (
  projectId: string,
  options?: Omit<UseQueryOptions<CustomPatchCustomer[]>, 'queryKey' | 'queryFn'>
) =>
  useQuery({
    queryKey: patchKeys.customCustomers(projectId),
    queryFn: () => patchApi.getCustomPatchCustomers(projectId),
    enabled: !!projectId,
    ...options,
  })

export const useCustomPatchVersions = (
  customerId: number | null,
  projectId: string,
  options?: Omit<UseQueryOptions<CustomPatchVersion[]>, 'queryKey' | 'queryFn'>
) =>
  useQuery({
    queryKey: patchKeys.customVersions(customerId!, projectId),
    queryFn: () => patchApi.getCustomPatchVersions(customerId!, projectId),
    enabled: !!customerId && !!projectId,
    ...options,
  })

// Mutation Hooks
export const useGenerateStandardPatch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CumulativePatchGenerateRequest) => patchApi.generateStandard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patchKeys.lists() })
    },
  })
}

export const useGenerateCustomPatch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CustomPatchGenerateRequest) => patchApi.generateCustom(data),
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
