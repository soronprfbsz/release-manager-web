/**
 * Code Query Keys and Hooks
 * 코드 관련 React Query 키 팩토리 및 훅
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { codeApi } from '../api/codeApi'

import type { CodeSimpleResponse } from '../model/types'

// ============================================================================
// Query Keys Factory
// ============================================================================

export const codeKeys = {
  all: ['codes'] as const,
  lists: () => [...codeKeys.all, 'list'] as const,
  list: (codeTypeId: string) => [...codeKeys.lists(), codeTypeId] as const,
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 코드 타입별 목록 조회 훅
 * @param codeTypeId 코드 타입 ID
 * @param options 추가 옵션
 */
export function useCodesByType(
  codeTypeId: string,
  options?: Omit<UseQueryOptions<CodeSimpleResponse[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: codeKeys.list(codeTypeId),
    queryFn: () => codeApi.getCodesByType(codeTypeId),
    staleTime: 10 * 60 * 1000, // 10분간 캐시 (코드는 자주 변경되지 않음)
    enabled: !!codeTypeId,
    ...options,
  })
}
