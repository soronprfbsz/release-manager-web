import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'

import { fileContentKeys, useFileContentByPath } from '@/shared/api'
import type { PaginationParams, PageResponse } from '@/shared/api/types'

import { patchApi } from '../api/patchApi'

import type {
  CumulativePatch,
  CumulativePatchDetail,
  CumulativePatchGenerateRequest,
  CustomPatchGenerateRequest,
  CustomPatchSite,
  CustomPatchVersion,
  GenerateResponse,
  PatchFileStructure,
} from '../model/types'

// Query Keys Factory
export const patchKeys = {
  all: ['patches'] as const,
  lists: () => [...patchKeys.all, 'list'] as const,
  list: (params?: PaginationParams & { releaseType?: string; projectId?: string; siteCode?: string }) =>
    [...patchKeys.lists(), params] as const,
  histories: () => [...patchKeys.all, 'histories'] as const,
  history: (params: { projectId: string; siteId: number; page?: number; size?: number; sort?: string }) =>
    [...patchKeys.histories(), params] as const,
  details: () => [...patchKeys.all, 'detail'] as const,
  detail: (id: number) => [...patchKeys.details(), id] as const,
  fileStructure: (id: number) => [...patchKeys.all, 'file-structure', id] as const,
  /** @deprecated Use fileContentKeys from shared/api instead */
  fileContent: (filePath: string) => fileContentKeys.content(filePath),
  // Custom patch keys
  customSites: (projectId: string) => [...patchKeys.all, 'custom-sites', projectId] as const,
  customVersions: (siteId: number, projectId: string) =>
    [...patchKeys.all, 'custom-versions', siteId, projectId] as const,
  /** 자동 패치명 미리보기 — site 별 + KST 일자별 캐시 */
  previewName: (siteCode: string | undefined) =>
    [...patchKeys.all, 'preview-name', siteCode ?? '__undefined__'] as const,
}

// Query Hooks
export const usePatches = (
  params?: PaginationParams & { releaseType?: string; projectId?: string; siteCode?: string },
  options?: Omit<UseQueryOptions<PageResponse<CumulativePatch>>, 'queryKey' | 'queryFn'>
) =>
  useQuery({
    queryKey: patchKeys.list(params),
    queryFn: () => patchApi.getList(params),
    ...options,
  })

/** 사이트별 패치 이력 조회 */
export const usePatchHistories = (
  params: { projectId: string; siteId: number; page?: number; size?: number; sort?: string },
  options?: Omit<UseQueryOptions<PageResponse<CumulativePatch>>, 'queryKey' | 'queryFn'>
) =>
  useQuery({
    queryKey: patchKeys.history(params),
    queryFn: () => patchApi.getHistories(params),
    enabled: !!params.projectId && !!params.siteId,
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
export const useCustomPatchSites = (
  projectId: string,
  options?: Omit<UseQueryOptions<CustomPatchSite[]>, 'queryKey' | 'queryFn'>
) =>
  useQuery({
    queryKey: patchKeys.customSites(projectId),
    queryFn: () => patchApi.getCustomPatchSites(projectId),
    enabled: !!projectId,
    ...options,
  })

export const useCustomPatchVersions = (
  siteId: number | null,
  projectId: string,
  options?: Omit<UseQueryOptions<CustomPatchVersion[]>, 'queryKey' | 'queryFn'>
) =>
  useQuery({
    queryKey: patchKeys.customVersions(siteId!, projectId),
    queryFn: () => patchApi.getCustomPatchVersions(siteId!, projectId),
    enabled: !!siteId && !!projectId,
    ...options,
  })

// Mutation Hooks
type GenerateStandardArgs = { data: CumulativePatchGenerateRequest; progressId?: string }
type GenerateCustomArgs = { data: CustomPatchGenerateRequest; progressId?: string }

export const useGenerateStandardPatch = () => {
  const queryClient = useQueryClient()

  return useMutation<GenerateResponse, Error, GenerateStandardArgs>({
    mutationFn: ({ data, progressId }) => patchApi.generateStandard(data, progressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patchKeys.lists() })
    },
  })
}

export const useGenerateCustomPatch = () => {
  const queryClient = useQueryClient()

  return useMutation<CumulativePatch, Error, GenerateCustomArgs>({
    mutationFn: ({ data, progressId }) => patchApi.generateCustom(data, progressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patchKeys.lists() })
    },
  })
}

/** 패치 완료 처리 — 완료 후 patch 삭제, 이력 생성 */
export const useCompletePatch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (patchId: number) => patchApi.completePatch(patchId),
    onSuccess: () => {
      // 패치 목록 갱신 (완료된 patch 제거)
      queryClient.invalidateQueries({ queryKey: patchKeys.lists() })
      // 패치 이력 갱신 (완료 이력 추가)
      queryClient.invalidateQueries({ queryKey: patchKeys.histories() })
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

/**
 * 자동 패치명 미리보기 — 실제 확정될 이름 (충돌 시 -N suffix 포함).
 * siteCode 가 `''` / undefined 이면 "undefined" prefix 로 backend 가 처리.
 * enabled 가 truthy 일 때만 fetch.
 */
export const usePatchNamePreview = (siteCode: string | undefined, enabled: boolean) =>
  useQuery({
    queryKey: patchKeys.previewName(siteCode),
    queryFn: () => patchApi.previewName(siteCode),
    enabled,
    // 짧게 사용되는 미리보기 — 같은 site 로 다시 열 때마다 fresh 값
    staleTime: 0,
  })
