/**
 * Publishing React Query Hooks
 * 퍼블리싱 리소스 관련 쿼리 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { fileContentKeys, useFileContentByPath } from '@/shared/api'

import { publishingApi } from './publishingApi'

import type {
  PublishingQueryParams,
  PublishingUploadRequest,
  PublishingUpdateRequest,
  PublishingReorderRequest,
} from '../model/types'

/** Query Keys */
export const publishingKeys = {
  all: ['publishing'] as const,
  lists: () => [...publishingKeys.all, 'list'] as const,
  list: (params?: PublishingQueryParams) => [...publishingKeys.lists(), params] as const,
  details: () => [...publishingKeys.all, 'detail'] as const,
  detail: (id: number) => [...publishingKeys.details(), id] as const,
  fileTree: (id: number) => [...publishingKeys.all, 'files', id] as const,
  /** @deprecated Use fileContentKeys from shared/api instead */
  fileContent: (filePath: string) => fileContentKeys.content(filePath),
}

/** 퍼블리싱 목록 조회 */
export function usePublishings(params?: PublishingQueryParams) {
  return useQuery({
    queryKey: publishingKeys.list(params),
    queryFn: () => publishingApi.getList(params),
  })
}

/** 퍼블리싱 상세 조회 */
export function usePublishing(id: number) {
  return useQuery({
    queryKey: publishingKeys.detail(id),
    queryFn: () => publishingApi.getDetail(id),
    enabled: !!id,
  })
}

/** 퍼블리싱 업로드 */
export function useUploadPublishing(options?: {
  onSuccess?: () => void
  onError?: (error: Error) => void
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PublishingUploadRequest & {
      onProgress?: (progressEvent: { loaded: number; total?: number }) => void
    }) => {
      const { onProgress, ...uploadData } = data
      return publishingApi.upload(uploadData, onProgress)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: publishingKeys.lists() })
      options?.onSuccess?.()
    },
    onError: options?.onError,
  })
}

/** 퍼블리싱 수정 */
export function useUpdatePublishing(options?: {
  onSuccess?: () => void
  onError?: (error: Error) => void
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PublishingUpdateRequest }) =>
      publishingApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: publishingKeys.all })
      options?.onSuccess?.()
    },
    onError: options?.onError,
  })
}

/** 퍼블리싱 삭제 */
export function useDeletePublishing(options?: {
  onSuccess?: () => void
  onError?: (error: Error) => void
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => publishingApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: publishingKeys.lists() })
      options?.onSuccess?.()
    },
    onError: options?.onError,
  })
}

/** 퍼블리싱 순서 변경 */
export function useReorderPublishing(options?: {
  onSuccess?: () => void
  onError?: (error: Error) => void
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PublishingReorderRequest) => publishingApi.reorder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: publishingKeys.lists() })
      options?.onSuccess?.()
    },
    onError: options?.onError,
  })
}

/** 퍼블리싱 파일 트리 조회 */
export function usePublishingFileTree(id: number, enabled: boolean = true) {
  return useQuery({
    queryKey: publishingKeys.fileTree(id),
    queryFn: () => publishingApi.getFileTree(id),
    enabled: enabled && !!id,
  })
}

/**
 * 퍼블리싱 파일 내용 조회 (통합 API - 텍스트/바이너리 모두 지원)
 * @param filePath 파일 경로 (예: publishing/1/css/style.css)
 * @param enabled 쿼리 활성화 여부
 */
export function usePublishingFileContent(
  filePath: string,
  enabled: boolean = true
) {
  return useFileContentByPath(filePath, enabled)
}
