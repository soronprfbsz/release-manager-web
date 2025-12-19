/**
 * Resource Query Keys and Hooks
 * 리소스 관련 React Query 키 팩토리 및 훅
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query'

import { resourceApi } from '../api/resourceApi'
import type { ResourceFile, ResourceFileUploadRequest, ResourceFileUpdateRequest } from '../model/types'

// ============================================================================
// Query Keys Factory
// ============================================================================

export const resourceKeys = {
  all: ['resources'] as const,
  lists: () => [...resourceKeys.all, 'list'] as const,
  list: () => [...resourceKeys.lists()] as const,
  details: () => [...resourceKeys.all, 'detail'] as const,
  detail: (id: number) => [...resourceKeys.details(), id] as const,
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 리소스 파일 목록 조회 훅
 */
export function useResources(
  options?: Omit<UseQueryOptions<ResourceFile[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: resourceKeys.list(),
    queryFn: () => resourceApi.getList(),
    ...options,
  })
}

/**
 * 리소스 파일 상세 조회 훅
 */
export function useResource(
  id: number,
  options?: Omit<UseQueryOptions<ResourceFile, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: resourceKeys.detail(id),
    queryFn: () => resourceApi.getDetail(id),
    enabled: !!id,
    ...options,
  })
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * 리소스 파일 업로드 훅
 */
export function useUploadResource(
  options?: UseMutationOptions<
    ResourceFile,
    Error,
    ResourceFileUploadRequest & { onProgress?: (progressEvent: { loaded: number; total?: number }) => void }
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ file, fileCategory, resourceFileName, subCategory, description, onProgress }) =>
      resourceApi.upload(file, fileCategory, resourceFileName, subCategory, description, onProgress),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.all })
      options?.onSuccess?.(...args)
    },
  })
}

/**
 * 리소스 파일 수정 훅
 */
export function useUpdateResource(
  options?: UseMutationOptions<
    ResourceFile,
    Error,
    { resourceFileId: number; data: ResourceFileUpdateRequest }
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ resourceFileId, data }) => resourceApi.update(resourceFileId, data),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.all })
      options?.onSuccess?.(...args)
    },
  })
}

/**
 * 리소스 파일 삭제 훅
 */
export function useDeleteResource(options?: UseMutationOptions<void, Error, number>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => resourceApi.delete(id),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.all })
      options?.onSuccess?.(...args)
    },
  })
}

/**
 * 리소스 파일 순서 변경 훅
 */
export function useReorderResources() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ fileCategory, resourceFileIds }: { fileCategory: string; resourceFileIds: number[] }) =>
      resourceApi.reorderResources(fileCategory, resourceFileIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
    },
  })
}
