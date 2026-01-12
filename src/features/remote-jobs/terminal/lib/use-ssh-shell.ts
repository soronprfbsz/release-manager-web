/**
 * SSH Shell Custom Hook
 * SSH 터미널 세션 관리 및 비즈니스 로직
 */

import { useCallback, useEffect, type RefObject } from 'react'

import { useConnectShell, useDisconnectShell } from '@/entities/remote-jobs/terminal'
import type { ShellConnectRequest, OutputMessage } from '@/entities/remote-jobs/terminal'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { useSshSessionStore, type SshSession } from '@/shared/store/useSshSessionStore'
import { useAuthStore } from '@/shared/store/useAuthStore'

import { useSshShellWebSocket } from './use-ssh-shell-websocket'
import { validateSshConnectionForm } from '../model/validation'
import type { SshConnectionFormData } from '../model/types'
import type { XtermTerminalHandle } from '../ui/XtermTerminal'

/**
 * useSshShell Hook 반환 타입
 */
export interface UseSshShellReturn {
  /** 현재 SSH 세션 정보 (연결되지 않은 경우 null) */
  session: SshSession | null
  /** WebSocket 연결 상태 */
  isConnected: boolean
  /** SSH 연결 중 여부 */
  isConnecting: boolean
  /** SSH 연결 */
  connect: (formData: SshConnectionFormData) => Promise<{ success: boolean; errors?: Record<string, string> }>
  /** SSH 연결 종료 */
  disconnect: () => Promise<void>
  /** 터미널 명령어 전송 */
  sendCommand: (data: string) => void
  /** 터미널 크기 변경 전송 */
  sendResize: (cols: number, rows: number) => void
}

/**
 * SSH Shell 관리 Hook
 *
 * @param terminalRef - XtermTerminal ref (출력용)
 * @returns SSH Shell 관리 객체
 */
export function useSshShell(
  terminalRef: RefObject<XtermTerminalHandle>
): UseSshShellReturn {
  // 전역 상태 사용 (페이지 이동 시에도 유지)
  const session = useSshSessionStore((state) => state.session)
  const isConnected = useSshSessionStore((state) => state.isConnected)
  const setSession = useSshSessionStore((state) => state.setSession)
  const setConnected = useSshSessionStore((state) => state.setConnected)
  const clearSession = useSshSessionStore((state) => state.disconnect)
  const clearHistory = useSshSessionStore((state) => state.clearHistory)

  const { toast } = useToast()
  const connectMutation = useConnectShell()
  const disconnectMutation = useDisconnectShell()

  const user = useAuthStore((state) => state.user)

  // 컴포넌트 마운트 시 세션 사용자 검증
  /* useEffect(() => {
    if (session && user) {
      if (session.userEmail !== user.email) {
        // 세션 사용자와 현재 로그인 사용자가 다르면 세션 종료
        // (비동기 처리로 인해 렌더링 중 업데이트 방지)
        setTimeout(() => {
          disconnect() // disconnect 함수가 정의되기 전이므로 아래 disconnect 로직을 직접 호출하거나 useEffect 위치를 아래로 이동해야 함
          // 하지만 disconnect 함수는 useCallback으로 정의되어 있어서 순서 문제가 있음.
          // 여기서 직접 store action을 호출하는 것이 안전함.
          if (session.sessionId) {
             clearHistory(session.sessionId)
          }
           clearSession()
           terminalRef.current?.clear()
        }, 0)
      }
    } else if (session && !user) {
         // 로그아웃 상태면 세션 종료
        setTimeout(() => {
             if (session.sessionId) {
                clearHistory(session.sessionId)
             }
            clearSession()
            terminalRef.current?.clear()
        }, 0)
    }
  }, [session, user, clearHistory, clearSession, terminalRef]) */
  // 위 useEffect 로직은 disconnect 정의 후에 작성하거나, store action을 직접 사용해야 함.
  // 간단하게 useEffect를 disconnect 정의 아래에 추가하거나, 여기서 store action을 사용.

  // 그냥 disconnect 함수 정의 후에 useEffect를 배치하는 것이 깔끔함 via multi-chunk editing.

  // WebSocket 메시지 핸들러
  const handleWebSocketMessage = useCallback(
    (message: OutputMessage) => {
      // 상태 메시지 처리
      if (message.type === 'STATUS') {
        if (message.status === 'CONNECTED') {
          setConnected(true)
        } else if (message.status === 'ERROR' || message.status === 'DISCONNECTED') {
          // 에러 또는 연결 종료 시 세션 초기화
          if (session) {
            clearHistory(session.sessionId)
          }
          clearSession()
          terminalRef.current?.clear()

          toast({
            title: '연결 종료',
            description: 'SSH 연결이 종료되었습니다.',
          })
        }
        return
      }

      // 에러 메시지 처리
      if (message.type === 'ERROR') {
        const errorMsg = message.data || message.message || ''
        if (errorMsg && terminalRef.current) {
          terminalRef.current.write(`\x1b[31m${errorMsg}\x1b[0m\r\n`)
        }
        return
      }

      // 일반 출력 처리
      const output = message.data || message.message || ''
      if (output && terminalRef.current) {
        terminalRef.current.write(output)
      }
    },
    [terminalRef, setConnected, session, clearHistory, clearSession, toast]
  )

  const handleWebSocketDisconnect = useCallback(() => {
    // WebSocket 연결이 끊어지면 세션도 함께 초기화
    if (session) {
      clearHistory(session.sessionId)
    }
    clearSession()
    terminalRef.current?.clear()

    toast({
      title: '연결 종료',
      description: 'SSH 연결이 종료되었습니다.',
    })
  }, [session, clearHistory, clearSession, terminalRef, toast])

  const handleWebSocketError = useCallback(
    (error: Error) => {
      console.error('WebSocket error:', error)
      toast({
        title: 'WebSocket 오류',
        description: error.message,
        variant: 'destructive',
      })
    },
    [toast]
  )

  // WebSocket 연결
  const { sendCommand, sendResize, disconnect: wsDisconnect } = useSshShellWebSocket({
    sessionId: session?.sessionId || null,
    onMessage: handleWebSocketMessage,
    onDisconnect: handleWebSocketDisconnect,
    onError: handleWebSocketError,
  })

  // SSH 연결
  const connect = useCallback(
    async (formData: SshConnectionFormData) => {
      // 유효성 검증
      const validation = validateSshConnectionForm(formData)
      if (!validation.isValid) {
        return { success: false, errors: validation.errors }
      }

      // 연결 요청
      const request: ShellConnectRequest = {
        host: formData.host,
        port: formData.port,
        username: formData.username,
        password: formData.password,
      }

      try {
        const response = await connectMutation.mutateAsync(request)

        // 세션 상태 업데이트
        setSession({
          sessionId: response.terminalId,
          host: response.host,
          username: formData.username,
          userEmail: user?.email || '',
        })

        toast({
          title: 'SSH 연결 성공',
          description: `세션 ${response.terminalId}이(가) 시작되었습니다.`,
        })

        return { success: true }
      } catch (error) {
        console.error('Failed to connect:', error)
        toast({
          title: '연결 실패',
          description: error instanceof Error ? error.message : 'SSH 연결에 실패했습니다.',
          variant: 'destructive',
        })
        return { success: false }
      }
    },
    [connectMutation, toast]
  )

  // SSH 연결 종료
  const disconnect = useCallback(async () => {
    if (!session) return

    try {
      // WebSocket 먼저 종료
      wsDisconnect()

      // REST API로 세션 종료
      await disconnectMutation.mutateAsync(session.sessionId)

      // 터미널 히스토리 정리
      clearHistory(session.sessionId)

      // 전역 상태 초기화
      clearSession()

      // 터미널 초기화
      terminalRef.current?.clear()

      toast({
        title: '연결 종료',
        description: 'SSH 연결이 종료되었습니다.',
      })
    } catch (error) {
      console.error('Failed to disconnect:', error)
      toast({
        title: '종료 실패',
        description: error instanceof Error ? error.message : '연결 종료에 실패했습니다.',
        variant: 'destructive',
      })
    }
  }, [session, wsDisconnect, disconnectMutation, clearHistory, clearSession, terminalRef, toast])

  // 세션 사용자 검증 (다른 사용자로 로그인 시 이전 세션 정리)
  useEffect(() => {
    if (session && user) {
      if (session.userEmail !== user.email) {
        // 세션 사용자와 현재 로그인 사용자가 다르면 세션 종료
        if (session.sessionId) {
          clearHistory(session.sessionId)
        }
        clearSession()
        terminalRef.current?.clear()
      }
    } else if (session && !user) {
      // 로그아웃 상태면 세션 종료
      if (session.sessionId) {
        clearHistory(session.sessionId)
      }
      clearSession()
      terminalRef.current?.clear()
    }
  }, [session, user, clearHistory, clearSession, terminalRef])

  return {
    session,
    isConnected,
    isConnecting: connectMutation.isPending,
    connect,
    disconnect,
    sendCommand,
    sendResize,
  }
}
