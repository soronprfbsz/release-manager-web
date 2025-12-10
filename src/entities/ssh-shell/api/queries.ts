/**
 * SSH Shell React Query Hooks
 * Interactive SSH Shell React Query 훅
 */

import { useMutation, useQuery } from '@tanstack/react-query'

import { sshShellApi } from './sshShellApi'
import type { ShellConnectRequest } from '../model/types'

/**
 * 셸 연결 Mutation
 */
export function useConnectShell() {
  return useMutation({
    mutationFn: (request: ShellConnectRequest) => sshShellApi.connect(request),
  })
}

/**
 * 세션 정보 조회 Query
 */
export function useShellSessionInfo(shellSessionId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['sshShell', 'session', shellSessionId],
    queryFn: () => sshShellApi.getSessionInfo(shellSessionId!),
    enabled: enabled && !!shellSessionId,
    refetchInterval: 5000, // 5초마다 갱신
  })
}

/**
 * 셸 연결 종료 Mutation
 */
export function useDisconnectShell() {
  return useMutation({
    mutationFn: (shellSessionId: string) => sshShellApi.disconnect(shellSessionId),
  })
}
