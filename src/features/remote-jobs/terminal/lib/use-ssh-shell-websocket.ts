/**
 * SSH Shell WebSocket Hook
 * Interactive SSH Shell 실시간 통신을 위한 WebSocket 훅
 * 전역 WebSocket Manager를 사용하여 페이지 이동 시에도 연결 유지
 */

import { useEffect, useCallback } from 'react'

import type { OutputMessage } from '@/entities/remote-jobs/terminal'

import { sshWebSocketManager } from './ssh-websocket-manager'

interface UseSshShellWebSocketProps {
  sessionId: string | null
  onMessage: (message: OutputMessage) => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
}

interface UseSshShellWebSocketReturn {
  sendCommand: (command: string) => void
  sendResize: (cols: number, rows: number) => void
  disconnect: () => void
}

/**
 * SSH Shell WebSocket 연결 훅
 * 전역 싱글톤 매니저를 사용하여 컴포넌트 unmount 시에도 연결 유지
 */
export function useSshShellWebSocket({
  sessionId,
  onMessage,
  onDisconnect,
  onError,
}: UseSshShellWebSocketProps): UseSshShellWebSocketReturn {
  const sendCommand = useCallback(
    (command: string) => {
      if (!sessionId) {
        console.warn('No session ID')
        return
      }

      sshWebSocketManager.sendCommand(sessionId, command)
    },
    [sessionId]
  )

  const sendResize = useCallback(
    (cols: number, rows: number) => {
      if (!sessionId) {
        console.warn('No session ID')
        return
      }

      sshWebSocketManager.sendResize(sessionId, cols, rows)
    },
    [sessionId]
  )

  const disconnect = useCallback(() => {
    sshWebSocketManager.disconnect()
  }, [])

  // 핸들러 등록/해제
  useEffect(() => {
    // 핸들러 등록
    sshWebSocketManager.addMessageHandler(onMessage)

    if (onDisconnect) {
      sshWebSocketManager.addDisconnectHandler(onDisconnect)
    }

    if (onError) {
      sshWebSocketManager.addErrorHandler(onError)
    }

    // Cleanup: 핸들러 제거 (연결은 유지)
    return () => {
      sshWebSocketManager.removeMessageHandler(onMessage)

      if (onDisconnect) {
        sshWebSocketManager.removeDisconnectHandler(onDisconnect)
      }

      if (onError) {
        sshWebSocketManager.removeErrorHandler(onError)
      }
    }
  }, [onMessage, onDisconnect, onError])

  // sessionId 변경 시 연결/재연결
  useEffect(() => {
    if (!sessionId) {
      return
    }

    // 연결 (이미 연결되어 있으면 무시)
    sshWebSocketManager.connect(sessionId)
  }, [sessionId])

  return {
    sendCommand,
    sendResize,
    disconnect,
  }
}
