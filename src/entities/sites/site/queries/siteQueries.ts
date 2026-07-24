import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import type { PaginationParams } from '@/shared/api/types'

import { siteApi } from '../api/siteApi'

import type { SiteCreateRequest, SiteUpdateRequest, ResetPatchStateResponse } from '../model/types'

// Query Keys Factory
export const siteKeys = {
  all: ['sites'] as const,
  lists: () => [...siteKeys.all, 'list'] as const,
  list: (params?: PaginationParams & { isActive?: boolean; keyword?: string; projectId?: string }) =>
    [...siteKeys.lists(), params] as const,
  details: () => [...siteKeys.all, 'detail'] as const,
  detail: (id: number) => [...siteKeys.details(), id] as const,
}

// Query Hooks
export const useSites = (params?: PaginationParams & { isActive?: boolean; keyword?: string; projectId?: string }) =>
  useQuery({
    queryKey: siteKeys.list(params),
    queryFn: () => siteApi.getList(params),
  })

export const useSite = (id: number) =>
  useQuery({
    queryKey: siteKeys.detail(id),
    queryFn: () => siteApi.getById(id),
    enabled: !!id,
  })

// Mutation Hooks
export const useCreateSite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SiteCreateRequest) => siteApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteKeys.lists() })
    },
  })
}

export const useUpdateSite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SiteUpdateRequest }) =>
      siteApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: siteKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: siteKeys.lists() })
    },
  })
}

export const useDeleteSite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => siteApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteKeys.lists() })
    },
  })
}

export const useResetSitePatchState = () => {
  const queryClient = useQueryClient()

  return useMutation<ResetPatchStateResponse, Error, number>({
    mutationFn: (siteId: number) => siteApi.resetPatchState(siteId),
    onSuccess: (_, siteId) => {
      // 사이트 목록 / 상세 캐시 무효화
      queryClient.invalidateQueries({ queryKey: siteKeys.lists() })
      queryClient.invalidateQueries({ queryKey: siteKeys.detail(siteId) })
      // 사이트 버전 캐시 무효화 (site-versions 키 prefix)
      queryClient.invalidateQueries({ queryKey: ['site-versions'] })
      // 패치 이력 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['patch-histories'] })
      // 사이트 프로젝트 관련 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['site-projects'] })
    },
  })
}

export const useUpdateSiteStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      siteApi.updateStatus(id, isActive),

    // Optimistic update for instant UI feedback
    onMutate: async ({ id, isActive }) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: siteKeys.lists() })

      // Snapshot previous value for rollback
      const previousData = queryClient.getQueriesData({ queryKey: siteKeys.lists() })

      // Optimistically update all list queries
      queryClient.setQueriesData<{ content: Array<{ siteId: number; isActive: boolean }> }>(
        { queryKey: siteKeys.lists() },
        (old) => {
          if (!old?.content) return old

          return {
            ...old,
            content: old.content.map((site) =>
              site.siteId === id ? { ...site, isActive } : site
            ),
          }
        }
      )

      return { previousData }
    },

    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },

    onSettled: (_, __, variables) => {
      // Refetch to ensure server state is correct
      queryClient.invalidateQueries({ queryKey: siteKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: siteKeys.lists() })
    },
  })
}
