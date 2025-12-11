/**
 * SSH Shell Custom Hook
 * SSH 터미널 세션 관리 및 비즈니스 로직
 */

import { useState, useCallback, type RefObject } from 'react'

import { useConnectShell, useDisconnectShell } from '@/entities/ssh-shell'
import type { ShellConnectRequest, OutputMessage } from '@/entities/ssh-shell'
import { useToast } from '@/shared/lib/hooks/use-toast'

import { useSshShellWebSocket } from './use-ssh-shell-websocket'
import { validateSshConnectionForm } from '../model/validation'
import type { SshConnectionFormData } from '../model/types'
import type { XtermTerminalHandle } from '../ui/XtermTerminal'

/**
 * SSH 세션 정보
 */
export interface SshSession {
  sessionId: string
  host: string
  username: string
}

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
  const [session, setSession] = useState<SshSession | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const { toast } = useToast()
  const connectMutation = useConnectShell()
  const disconnectMutation = useDisconnectShell()

  // WebSocket 메시지 핸들러
  const handleWebSocketMessage = useCallback((message: OutputMessage) => {
    // 상태 메시지 처리
    if (message.type === 'STATUS') {
      if (message.status === 'CONNECTED') {
        setIsConnected(true)
      } else if (message.status === 'ERROR' || message.status === 'DISCONNECTED') {
        setIsConnected(false)
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
  }, [terminalRef])

  const handleWebSocketDisconnect = useCallback(() => {
    setIsConnected(false)
  }, [])

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
  const { sendCommand, disconnect: wsDisconnect } = useSshShellWebSocket({
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

      // 상태 초기화
      setSession(null)
      setIsConnected(false)

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
  }, [session, wsDisconnect, disconnectMutation, terminalRef, toast])

  return {
    session,
    isConnected,
    isConnecting: connectMutation.isPending,
    connect,
    disconnect,
    sendCommand,
  }
}
