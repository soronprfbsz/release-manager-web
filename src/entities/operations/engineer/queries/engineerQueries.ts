import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import type { PaginationParams } from '@/shared/api/types'

import { engineerApi } from '../api/engineerApi'

import type { EngineerCreateRequest, EngineerUpdateRequest } from '../model/types'

// Query Keys Factory
export const engineerKeys = {
  all: ['engineers'] as const,
  lists: () => [...engineerKeys.all, 'list'] as const,
  list: (params?: PaginationParams & { department?: string; keyword?: string }) =>
    [...engineerKeys.lists(), params] as const,
  details: () => [...engineerKeys.all, 'detail'] as const,
  detail: (id: number) => [...engineerKeys.details(), id] as const,
}

// Query Hooks
export const useEngineers = (params?: PaginationParams & { department?: string; keyword?: string }) =>
  useQuery({
    queryKey: engineerKeys.list(params),
    queryFn: () => engineerApi.getList(params),
  })

export const useEngineer = (id: number) =>
  useQuery({
    queryKey: engineerKeys.detail(id),
    queryFn: () => engineerApi.getById(id),
    enabled: !!id,
  })

// Mutation Hooks
export const useCreateEngineer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: EngineerCreateRequest) => engineerApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: engineerKeys.lists() })
    },
  })
}

export const useUpdateEngineer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EngineerUpdateRequest }) =>
      engineerApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: engineerKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: engineerKeys.lists() })
    },
  })
}

export const useDeleteEngineer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => engineerApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: engineerKeys.lists() })
    },
  })
}
