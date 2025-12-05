import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import type { PaginationParams } from '@/shared/api/types'

import { patchApi } from '../api/patchApi'

import type { CumulativePatchGenerateRequest } from '../model/types'

// Query Keys Factory
export const patchKeys = {
  all: ['patches'] as const,
  lists: () => [...patchKeys.all, 'list'] as const,
  list: (params?: PaginationParams & { releaseType?: string }) =>
    [...patchKeys.lists(), params] as const,
  details: () => [...patchKeys.all, 'detail'] as const,
  detail: (id: number) => [...patchKeys.details(), id] as const,
}

// Query Hooks
export const usePatches = (params?: PaginationParams & { releaseType?: string }) =>
  useQuery({
    queryKey: patchKeys.list(params),
    queryFn: () => patchApi.getList(params),
  })

export const usePatch = (id: number) =>
  useQuery({
    queryKey: patchKeys.detail(id),
    queryFn: () => patchApi.getById(id),
    enabled: !!id,
  })

// Mutation Hooks
export const useGeneratePatch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CumulativePatchGenerateRequest) => patchApi.generate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patchKeys.lists() })
    },
  })
}
