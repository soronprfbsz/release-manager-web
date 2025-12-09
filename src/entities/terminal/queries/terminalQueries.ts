/**
 * Terminal Query Keys and Hooks
 * 터미널 관련 React Query 키 팩토리 및 훅
 */

import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query'

import { terminalApi } from '../api/terminalApi'
import type { TerminalSession } from '../model/types'

// ============================================================================
// Query Keys Factory
// ============================================================================

export const terminalKeys = {
  all: ['terminal'] as const,
  sessions: () => [...terminalKeys.all, 'sessions'] as const,
  session: (sessionId: string) => [...terminalKeys.sessions(), sessionId] as const,
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * 활성 셸 세션 목록 조회 훅
 */
export function useTerminalSessions(
  options?: Omit<UseQueryOptions<TerminalSession[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: terminalKeys.sessions(),
    queryFn: () => terminalApi.listSessions(),
    ...options,
  })
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * 셸 터미널 세션 생성 훅
 */
export function useCreateTerminalSession(
  options?: Omit<UseMutationOptions<TerminalSession, Error, void>, 'mutationFn'>
) {
  return useMutation({
    mutationFn: () => terminalApi.createSession(),
    ...options,
  })
}

/**
 * 셸 터미널 세션 삭제 훅
 */
export function useDeleteTerminalSession(
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) {
  return useMutation({
    mutationFn: (sessionId) => terminalApi.deleteSession(sessionId),
    ...options,
  })
}
