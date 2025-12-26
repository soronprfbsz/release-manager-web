/**
 * Terminal React Query Hooks
 * Interactive Terminal React Query 훅
 */

import { useMutation, useQuery } from '@tanstack/react-query'

import { terminalApi } from '../api/terminalApi'
import type { ShellConnectRequest } from '../model/types'

// ============================================================================
// Query Keys Factory
// ============================================================================

export const terminalKeys = {
  all: ['terminal'] as const,
  session: (sessionId: string | null) => [...terminalKeys.all, 'session', sessionId] as const,
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 세션 정보 조회 Query
 */
export function useShellSessionInfo(sessionId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: terminalKeys.session(sessionId),
    queryFn: () => terminalApi.getSessionInfo(sessionId!),
    enabled: enabled && !!sessionId,
    refetchInterval: 5000, // 5초마다 갱신
  })
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * 셸 연결 Mutation
 */
export function useConnectShell() {
  return useMutation({
    mutationFn: (request: ShellConnectRequest) => terminalApi.connect(request),
  })
}

/**
 * 셸 연결 종료 Mutation
 */
export function useDisconnectShell() {
  return useMutation({
    mutationFn: (sessionId: string) => terminalApi.disconnect(sessionId),
  })
}
