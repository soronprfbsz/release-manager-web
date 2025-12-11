/**
 * SSH Shell WebSocket Hook
 * Interactive SSH Shell 실시간 통신을 위한 WebSocket 훅
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { Client, IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

import type { OutputMessage, CommandMessage } from '@/entities/ssh-shell'

interface UseSshShellWebSocketProps {
  sessionId: string | null
  onMessage: (message: OutputMessage) => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
}

interface UseSshShellWebSocketReturn {
  isConnected: boolean
  sendCommand: (command: string) => void
  disconnect: () => void
}

/**
 * SSH Shell WebSocket 연결 훅
 */
export function useSshShellWebSocket({
  sessionId,
  onMessage,
  onDisconnect,
  onError,
}: UseSshShellWebSocketProps): UseSshShellWebSocketReturn {
  const clientRef = useRef<Client | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const sendCommand = useCallback(
    (command: string) => {
      if (!clientRef.current || !sessionId) {
        console.warn('WebSocket not connected or no session ID')
        return
      }

      const message: CommandMessage = {
        command,
      }

      try {
        clientRef.current.publish({
          destination: `/app/terminal/${sessionId}/command`,
          body: JSON.stringify(message),
        })
      } catch (error) {
        console.error('Failed to send command:', error)
        onError?.(error instanceof Error ? error : new Error('Failed to send command'))
      }
    },
    [sessionId, onError]
  )

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      try {
        clientRef.current.deactivate()
      } catch (error) {
        console.error('Error during disconnect:', error)
      }
      clientRef.current = null
      setIsConnected(false)
      onDisconnect?.()
    }
  }, [onDisconnect])

  useEffect(() => {
    if (!sessionId) {
      disconnect()
      return
    }

    // WebSocket URL 생성 - SockJS는 http/https 프로토콜 사용
    const protocol = window.location.protocol
    const host = window.location.host
    const wsUrl = `${protocol}//${host}/ws/terminal`

    // STOMP 클라이언트 생성
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        setIsConnected(true)

        // SSH Shell 세션 구독
        client.subscribe(`/topic/terminal/${sessionId}`, (message: IMessage) => {
          try {
            const wsMessage = JSON.parse(message.body)
            // WebSocketMessage 래퍼에서 payload 추출
            const outputMessage: OutputMessage = wsMessage.payload || wsMessage
            onMessage(outputMessage)
          } catch (error) {
            console.error('Failed to parse message:', error)
            onError?.(error instanceof Error ? error : new Error('Failed to parse message'))
          }
        })
      },

      onStompError: (frame) => {
        console.error('STOMP error:', frame)
        setIsConnected(false)
        const error = new Error(`STOMP error: ${frame.headers['message'] || 'Unknown error'}`)
        onError?.(error)
      },

      onWebSocketError: (event) => {
        console.error('WebSocket error:', event)
        setIsConnected(false)
        onError?.(new Error('WebSocket connection error'))
      },

      onDisconnect: () => {
        console.log('WebSocket disconnected')
        setIsConnected(false)
        onDisconnect?.()
      },
    })

    clientRef.current = client
    client.activate()

    return () => {
      disconnect()
    }
  }, [sessionId, onMessage, onDisconnect, onError, disconnect])

  return {
    isConnected,
    sendCommand,
    disconnect,
  }
}
