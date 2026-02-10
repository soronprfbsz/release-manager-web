/**
 * File Query Keys and Hooks
 * 파일 관련 React Query 키 팩토리 및 훅
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query'

import { fileContentKeys, useFileContentByPath } from '@/shared/api'

import { fileApi } from '../api/fileApi'

import type {
  File,
  FileUploadRequest,
  FileUpdateRequest,
  ResourceCategoriesResponse,
  ResourceCategoryFilesResponse,
  ResourceFileUploadResponse,
  ResourceFileDeleteResponse,
  ResourceDirectoryCreateResponse,
  ResourceCategoryCreateRequest,
  ResourceCategoryCreateResponse,
  ResourceCategoryDeleteResponse,
} from '../model/types'

// ============================================================================
// Query Keys Factory
// ============================================================================

export const fileKeys = {
  all: ['files'] as const,
  lists: () => [...fileKeys.all, 'list'] as const,
  list: (params?: { keyword?: string }) => [...fileKeys.lists(), params] as const,
  details: () => [...fileKeys.all, 'detail'] as const,
  detail: (id: number) => [...fileKeys.details(), id] as const,
  /** @deprecated Use fileContentKeys from shared/api instead */
  fileContent: (filePath: string) => fileContentKeys.content(filePath),
  // 트리 기반 API 키
  tree: () => [...fileKeys.all, 'tree'] as const,
  treeByCategory: (category: string) => [...fileKeys.tree(), category] as const,
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 파일 목록 조회 훅
 */
export function useFiles(
  params?: { keyword?: string } & Omit<UseQueryOptions<File[], Error>, 'queryKey' | 'queryFn'>
) {
  const { keyword, ...options } = params || {}
  return useQuery({
    queryKey: fileKeys.list({ keyword }),
    queryFn: () => fileApi.getList({ keyword }),
    ...options,
  })
}

/**
 * 파일 상세 조회 훅
 */
export function useFile(
  id: number,
  options?: Omit<UseQueryOptions<File, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: fileKeys.detail(id),
    queryFn: () => fileApi.getDetail(id),
    enabled: !!id,
    ...options,
  })
}

/**
 * 파일 내용 조회 훅 (통합 API - 텍스트/바이너리 모두 지원)
 * @param filePath 파일 경로 (예: resources/file/script/MARIADB/backup.sh)
 * @param enabled 쿼리 활성화 여부
 */
export function useFileContent(
  filePath: string,
  enabled: boolean = true
) {
  return useFileContentByPath(filePath, enabled)
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * 파일 업로드 훅
 */
export function useUploadFile(
  options?: UseMutationOptions<
    File,
    Error,
    FileUploadRequest & { onProgress?: (progressEvent: { loaded: number; total?: number }) => void }
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ file, fileCategory, resourceFileName, subCategory, description, onProgress }) =>
      fileApi.upload(file, fileCategory, resourceFileName, subCategory, description, onProgress),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: fileKeys.all })
      options?.onSuccess?.(...args)
    },
  })
}

/**
 * 파일 수정 훅
 */
export function useUpdateFile(
  options?: UseMutationOptions<
    File,
    Error,
    { fileId: number; data: FileUpdateRequest }
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ fileId, data }) => fileApi.update(fileId, data),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: fileKeys.all })
      options?.onSuccess?.(...args)
    },
  })
}

/**
 * 파일 삭제 훅
 */
export function useDeleteFile(options?: UseMutationOptions<void, Error, number>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => fileApi.delete(id),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: fileKeys.all })
      options?.onSuccess?.(...args)
    },
  })
}

/**
 * 파일 순서 변경 훅
 */
export function useReorderFiles() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ fileCategory, fileIds }: { fileCategory: string; fileIds: number[] }) =>
      fileApi.reorder(fileCategory, fileIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.lists() })
    },
  })
}

// ============================================================================
// 트리 기반 API Query/Mutation Hooks
// ============================================================================

/**
 * 카테고리 목록 조회 훅
 */
export function useResourceCategories(
  options?: Omit<UseQueryOptions<ResourceCategoriesResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: fileKeys.tree(),
    queryFn: () => fileApi.getCategories(),
    ...options,
  })
}

/**
 * 특정 카테고리 파일 트리 조회 훅
 */
export function useResourceCategoryFiles(
  category: string,
  options?: Omit<UseQueryOptions<ResourceCategoryFilesResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: fileKeys.treeByCategory(category),
    queryFn: () => fileApi.getCategoryFiles(category),
    enabled: !!category,
    ...options,
  })
}

/**
 * 카테고리 내 파일 업로드 훅
 */
export function useUploadResourceToCategory(
  category: string,
  options?: UseMutationOptions<
    ResourceFileUploadResponse,
    Error,
    { file: globalThis.File; targetPath: string; extractZip?: boolean; onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void; signal?: AbortSignal }
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ file, targetPath, extractZip, onUploadProgress, signal }) =>
      fileApi.uploadToCategory(category, file, targetPath, extractZip, onUploadProgress, signal),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: fileKeys.tree() })
      options?.onSuccess?.(...args)
    },
  })
}

/**
 * 카테고리 내 파일/디렉토리 삭제 훅
 */
export function useDeleteResourceFromCategory(
  category: string,
  options?: UseMutationOptions<ResourceFileDeleteResponse, Error, string>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (path: string) => fileApi.deleteFromCategory(category, path),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: fileKeys.tree() })
      options?.onSuccess?.(...args)
    },
  })
}

/**
 * 카테고리 내 디렉토리 생성 훅
 */
export function useCreateResourceDirectory(
  category: string,
  options?: UseMutationOptions<ResourceDirectoryCreateResponse, Error, string>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (path: string) => fileApi.createDirectoryInCategory(category, path),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: fileKeys.tree() })
      options?.onSuccess?.(...args)
    },
  })
}

/**
 * 카테고리 생성 훅
 */
export function useCreateResourceCategory(
  options?: UseMutationOptions<ResourceCategoryCreateResponse, Error, ResourceCategoryCreateRequest>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ResourceCategoryCreateRequest) => fileApi.createCategory(data),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: fileKeys.tree() })
      options?.onSuccess?.(...args)
    },
  })
}

/**
 * 카테고리 삭제 훅
 */
export function useDeleteResourceCategory(
  options?: UseMutationOptions<ResourceCategoryDeleteResponse, Error, string>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (category: string) => fileApi.deleteCategory(category),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: fileKeys.tree() })
      options?.onSuccess?.(...args)
    },
  })
}

