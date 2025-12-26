import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import type { PaginationParams } from '@/shared/api/types'

import { customerApi } from '../api/customerApi'

import type { CustomerCreateRequest, CustomerUpdateRequest } from '../model/types'

// Query Keys Factory
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (params?: PaginationParams & { isActive?: boolean; keyword?: string }) =>
    [...customerKeys.lists(), params] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: number) => [...customerKeys.details(), id] as const,
}

// Query Hooks
export const useCustomers = (params?: PaginationParams & { isActive?: boolean; keyword?: string }) =>
  useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customerApi.getList(params),
  })

export const useCustomer = (id: number) =>
  useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customerApi.getById(id),
    enabled: !!id,
  })

// Mutation Hooks
export const useCreateCustomer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CustomerCreateRequest) => customerApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
    },
  })
}

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CustomerUpdateRequest }) =>
      customerApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
    },
  })
}

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => customerApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
    },
  })
}

export const useUpdateCustomerStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      customerApi.updateStatus(id, isActive),

    // Optimistic update for instant UI feedback
    onMutate: async ({ id, isActive }) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: customerKeys.lists() })

      // Snapshot previous value for rollback
      const previousData = queryClient.getQueriesData({ queryKey: customerKeys.lists() })

      // Optimistically update all list queries
      queryClient.setQueriesData({ queryKey: customerKeys.lists() }, (old: any) => {
        if (!old?.content) return old

        return {
          ...old,
          content: old.content.map((customer: any) =>
            customer.customerId === id ? { ...customer, isActive } : customer
          ),
        }
      })

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
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
    },
  })
}
