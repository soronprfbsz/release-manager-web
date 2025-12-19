/**
 * Link Resource Queries
 * 링크 리소스 관련 React Query 훅
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { linkResourceApi } from '../api/linkResourceApi'
import type { LinkResourceCreateRequest } from '../model/types'

// Query Keys
export const linkResourceKeys = {
    all: ['linkResources'] as const,
    lists: () => [...linkResourceKeys.all, 'list'] as const,
    list: (params: { linkCategory?: string } = {}) =>
        [...linkResourceKeys.lists(), params] as const,
    detail: (id: number) => [...linkResourceKeys.all, 'detail', id] as const,
}

// Hooks

/** 링크 리소스 목록 조회 */
export const useLinkResources = (params: { linkCategory?: string; enabled?: boolean } = {}) => {
    return useQuery({
        queryKey: linkResourceKeys.list({ linkCategory: params.linkCategory }),
        queryFn: () => linkResourceApi.getList(params.linkCategory),
        enabled: params.enabled !== false,
    })
}

/** 링크 리소스 상세 조회 */
export const useLinkResource = (resourceLinkId: number, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: linkResourceKeys.detail(resourceLinkId),
        queryFn: () => linkResourceApi.getDetail(resourceLinkId),
        enabled: options?.enabled,
    })
}

/** 링크 리소스 추가 */
export const useCreateLinkResource = (options?: {
    onSuccess?: () => void
    onError?: (error: Error) => void
}) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: LinkResourceCreateRequest) => linkResourceApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: linkResourceKeys.lists() })
            options?.onSuccess?.()
        },
        onError: options?.onError,
    })
}

/** 링크 리소스 수정 */
export const useUpdateLinkResource = (options?: {
    onSuccess?: () => void
    onError?: (error: Error) => void
}) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ resourceLinkId, data }: { resourceLinkId: number; data: LinkResourceCreateRequest }) =>
            linkResourceApi.update(resourceLinkId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: linkResourceKeys.lists() })
            options?.onSuccess?.()
        },
        onError: options?.onError,
    })
}

/** 링크 리소스 삭제 */
export const useDeleteLinkResource = (options?: {
    onSuccess?: () => void
    onError?: (error: Error) => void
}) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (resourceLinkId: number) => linkResourceApi.delete(resourceLinkId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: linkResourceKeys.lists() })
            options?.onSuccess?.()
        },
        onError: options?.onError,
    })
}
