/**
 * Session Query Keys and Hooks
 * 인증 도메인 React Query 키 팩토리 및 훅
 */

import { useQuery } from '@tanstack/react-query'

import { sessionApi } from '../api/sessionApi'

// ============================================================================
// Query Keys Factory
// ============================================================================

export const sessionKeys = {
  all: ['session'] as const,
  adminContacts: () => [...sessionKeys.all, 'adminContacts'] as const,
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 활성 관리자 연락처 목록 조회
 * 비밀번호 재설정 안내 모달에서 사용. enabled=false 이면 fetch 안 함.
 */
export function useAdminContacts(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: sessionKeys.adminContacts(),
    queryFn: async () => {
      const response = await sessionApi.getAdminContacts()
      return response.data
    },
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5분 캐시 (관리자 목록은 자주 변경되지 않음)
  })
}
