import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'

import type { PaginationParams, PageResponse } from '@/shared/api/types'
import { fileContentKeys, useFileContentByPath } from '@/shared/api'

import { patchApi } from '../api/patchApi'

import type {
  CumulativePatch,
  CumulativePatchDetail,
  CumulativePatchGenerateRequest,
  CustomPatchGenerateRequest,
  CustomPatchCustomer,
  CustomPatchVersion,
  PatchFileStructure,
} from '../model/types'

// Query Keys Factory
export const patchKeys = {
  all: ['patches'] as const,
  lists: () => [...patchKeys.all, 'list'] as const,
  list: (params?: PaginationParams & { releaseType?: string; projectId?: string; customerCode?: string }) =>
    [...patchKeys.lists(), params] as const,
  histories: () => [...patchKeys.all, 'histories'] as const,
  history: (params: { projectId: string; customerId: number; page?: number; size?: number; sort?: string }) =>
    [...patchKeys.histories(), params] as const,
  details: () => [...patchKeys.all, 'detail'] as const,
  detail: (id: number) => [...patchKeys.details(), id] as const,
  fileStructure: (id: number) => [...patchKeys.all, 'file-structure', id] as const,
  /** @deprecated Use fileContentKeys from shared/api instead */
  fileContent: (filePath: string) => fileContentKeys.content(filePath),
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

/** 고객사별 패치 이력 조회 */
export const usePatchHistories = (
  params: { projectId: string; customerId: number; page?: number; size?: number; sort?: string },
  options?: Omit<UseQueryOptions<PageResponse<CumulativePatch>>, 'queryKey' | 'queryFn'>
) =>
  useQuery({
    queryKey: patchKeys.history(params),
    queryFn: () => patchApi.getHistories(params),
    enabled: !!params.projectId && !!params.customerId,
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

/**
 * 패치 파일 내용 조회 (통합 API - 텍스트/바이너리 모두 지원)
 * @param filePath 파일 경로 (예: patches/standard/1.0.0/files/script.sql)
 * @param enabled 쿼리 활성화 여부
 */
export const usePatchFileContent = (
  filePath: string,
  enabled: boolean = true
) => useFileContentByPath(filePath, enabled)

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

export const useDeletePatchHistory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (historyId: number) => patchApi.deleteHistory(historyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patchKeys.histories() })
    },
  })
}

export const useBulkDeletePatches = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (patchIds: number[]) => patchApi.bulkDelete(patchIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patchKeys.lists() })
      queryClient.invalidateQueries({ queryKey: patchKeys.details() })
    },
  })
}
