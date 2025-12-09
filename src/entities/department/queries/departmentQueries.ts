/**
 * Department Query Keys and Hooks
 * 부서 관련 React Query 키 팩토리 및 훅
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { departmentApi } from '../api/departmentApi'
import type { Department } from '../model/types'

// ============================================================================
// Query Keys Factory
// ============================================================================

export const departmentKeys = {
  all: ['departments'] as const,
  lists: () => [...departmentKeys.all, 'list'] as const,
  list: () => [...departmentKeys.lists()] as const,
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 부서 목록 조회 훅
 */
export function useDepartments(
  options?: Omit<UseQueryOptions<Department[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: departmentKeys.list(),
    queryFn: () => departmentApi.getList(),
    staleTime: 5 * 60 * 1000, // 5분간 캐시
    ...options,
  })
}
