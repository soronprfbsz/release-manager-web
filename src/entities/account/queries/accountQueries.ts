import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { PaginationParams } from '@/shared/api/types'

import { accountApi } from '../api/accountApi'
import type { AccountUpdateRequest } from '../model/types'

export const accountKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountKeys.all, 'list'] as const,
  list: (params?: PaginationParams & { keyword?: string }) => [...accountKeys.lists(), params] as const,
}

/** 계정 목록 조회 */
export function useAccounts(params?: PaginationParams & { keyword?: string }) {
  return useQuery({
    queryKey: accountKeys.list(params),
    queryFn: () => accountApi.getList(params),
  })
}

/** 계정 수정 */
export function useUpdateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AccountUpdateRequest }) =>
      accountApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() })
    },
  })
}

/** 계정 삭제 */
export function useDeleteAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => accountApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() })
    },
  })
}
