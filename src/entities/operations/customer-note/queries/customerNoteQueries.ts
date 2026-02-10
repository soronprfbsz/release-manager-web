/**
 * CustomerNote Queries
 * 고객사 특이사항 React Query hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { customerNoteApi } from '../api/customerNoteApi'

import type {
  CustomerNoteCreateRequest,
  CustomerNoteUpdateRequest,
} from '../model/types'

// Query Keys Factory
export const customerNoteKeys = {
  all: ['customerNotes'] as const,
  lists: () => [...customerNoteKeys.all, 'list'] as const,
  list: (customerId: number) => [...customerNoteKeys.lists(), customerId] as const,
}

// Query Hooks
export const useCustomerNotes = (customerId: number) =>
  useQuery({
    queryKey: customerNoteKeys.list(customerId),
    queryFn: () => customerNoteApi.getList(customerId),
    enabled: !!customerId,
  })

// Mutation Hooks
export const useCreateCustomerNote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      customerId,
      data,
    }: {
      customerId: number
      data: CustomerNoteCreateRequest
    }) => customerNoteApi.create(customerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: customerNoteKeys.list(variables.customerId),
      })
    },
  })
}

export const useUpdateCustomerNote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      customerId,
      noteId,
      data,
    }: {
      customerId: number
      noteId: number
      data: CustomerNoteUpdateRequest
    }) => customerNoteApi.update(customerId, noteId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: customerNoteKeys.list(variables.customerId),
      })
    },
  })
}

export const useDeleteCustomerNote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      customerId,
      noteId,
    }: {
      customerId: number
      noteId: number
    }) => customerNoteApi.delete(customerId, noteId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: customerNoteKeys.list(variables.customerId),
      })
    },
  })
}
