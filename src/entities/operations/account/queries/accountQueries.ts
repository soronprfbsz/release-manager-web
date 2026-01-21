import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  accountApi,
  type AccountListParams,
  type BatchTransferDepartmentRequest,
} from '../api/accountApi'
import type { AccountUpdateRequest, MyAccountUpdateRequest } from '../model/types'

export const accountKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountKeys.all, 'list'] as const,
  list: (params?: AccountListParams) => [...accountKeys.lists(), params] as const,
  byDepartment: (departmentId: number | null) => [...accountKeys.all, 'department', departmentId] as const,
  me: () => [...accountKeys.all, 'me'] as const,
}

/** 계정 목록 조회 */
export function useAccounts(params?: AccountListParams) {
  return useQuery({
    queryKey: accountKeys.list(params),
    queryFn: () => accountApi.getList(params),
  })
}

/** 부서별 계정 목록 조회 (기본: 하위 부서 포함) */
export function useAccountsByDepartment(
  departmentId: number | null,
  options?: { enabled?: boolean; includeSubDepartments?: boolean }
) {
  const includeSubDepartments = options?.includeSubDepartments ?? true
  return useQuery({
    queryKey: [...accountKeys.byDepartment(departmentId), { includeSubDepartments }],
    queryFn: () => accountApi.getList({ departmentId, size: 10000, includeSubDepartments }),
    enabled: options?.enabled ?? true,
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

/** 내 정보 조회 */
export function useMyAccount() {
  return useQuery({
    queryKey: accountKeys.me(),
    queryFn: () => accountApi.getMe(),
  })
}

/** 내 정보 수정 */
export function useUpdateMyAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: MyAccountUpdateRequest) => accountApi.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.me() })
    },
  })
}

/** 일괄 부서 이동 */
export function useBatchTransferDepartment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: BatchTransferDepartmentRequest) =>
      accountApi.batchTransferDepartment(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all })
    },
  })
}
