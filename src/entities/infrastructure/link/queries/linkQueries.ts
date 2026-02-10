/**
 * Link Queries
 * 링크 관련 React Query 훅
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { linkApi } from '../api/linkApi'

import type { LinkCreateRequest } from '../model/types'

// Query Keys
export const linkKeys = {
  all: ['links'] as const,
  lists: () => [...linkKeys.all, 'list'] as const,
  list: (params: { linkCategory?: string; keyword?: string } = {}) =>
    [...linkKeys.lists(), params] as const,
  detail: (id: number) => [...linkKeys.all, 'detail', id] as const,
}

// Hooks

/** 링크 목록 조회 */
export const useLinks = (params: { linkCategory?: string; keyword?: string; enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: linkKeys.list({ linkCategory: params.linkCategory, keyword: params.keyword }),
    queryFn: () => linkApi.getList({ linkCategory: params.linkCategory, keyword: params.keyword }),
    enabled: params.enabled !== false,
  })
}

/** 링크 상세 조회 */
export const useLink = (linkId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: linkKeys.detail(linkId),
    queryFn: () => linkApi.getDetail(linkId),
    enabled: options?.enabled,
  })
}

/** 링크 생성 */
export const useCreateLink = (options?: {
  onSuccess?: () => void
  onError?: (error: Error) => void
}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LinkCreateRequest) => linkApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkKeys.lists() })
      options?.onSuccess?.()
    },
    onError: options?.onError,
  })
}

/** 링크 수정 */
export const useUpdateLink = (options?: {
  onSuccess?: () => void
  onError?: (error: Error) => void
}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ linkId, data }: { linkId: number; data: LinkCreateRequest }) =>
      linkApi.update(linkId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkKeys.lists() })
      options?.onSuccess?.()
    },
    onError: options?.onError,
  })
}

/** 링크 삭제 */
export const useDeleteLink = (options?: {
  onSuccess?: () => void
  onError?: (error: Error) => void
}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (linkId: number) => linkApi.delete(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkKeys.lists() })
      options?.onSuccess?.()
    },
    onError: options?.onError,
  })
}

/** 링크 순서 변경 */
export const useReorderLinks = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ linkCategory, linkIds }: { linkCategory: string; linkIds: number[] }) =>
      linkApi.reorder(linkCategory, linkIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkKeys.lists() })
    },
  })
}

