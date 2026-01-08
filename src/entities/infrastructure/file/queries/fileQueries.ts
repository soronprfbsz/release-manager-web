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

import { fileApi } from '../api/fileApi'
import type { File, FileUploadRequest, FileUpdateRequest, FileContent } from '../model/types'

// ============================================================================
// Query Keys Factory
// ============================================================================

export const fileKeys = {
  all: ['files'] as const,
  lists: () => [...fileKeys.all, 'list'] as const,
  list: (params?: { keyword?: string }) => [...fileKeys.lists(), params] as const,
  details: () => [...fileKeys.all, 'detail'] as const,
  detail: (id: number) => [...fileKeys.details(), id] as const,
  fileContent: (id: number) => [...fileKeys.all, 'file-content', id] as const,
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
 * 파일 내용 조회 훅
 */
export function useFileContent(
  id: number,
  enabled: boolean = true,
  options?: Omit<UseQueryOptions<FileContent, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  return useQuery({
    queryKey: fileKeys.fileContent(id),
    queryFn: () => fileApi.getFileContent(id),
    enabled: enabled && !!id,
    staleTime: Infinity,
    ...options,
  })
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

