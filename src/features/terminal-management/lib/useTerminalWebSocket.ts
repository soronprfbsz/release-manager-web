/**
 * Terminal WebSocket Hook
 * STOMP를 통한 WebSocket 셸 터미널 연결 관리
 *
 * xterm.js 표준 패턴:
 * - 사용자 입력 → 서버 전송
 * - 서버 응답 → xterm.write() 호출 (서버 에코)
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { Client, type IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

import { apiClient } from '@/shared/api'
import { getWebSocketUrl } from '@/shared/config/constants'
import type {
  TerminalOutputMessage,
  TerminalInputMessage,
  TerminalConnectionStatus,
} from '@/entities/terminal'

interface UseTerminalWebSocketProps {
  sessionId: string | null
  onMessage: (message: string) => void
  onExit: (exitCode?: number) => void
  onError: (error: string) => void
}

export function useTerminalWebSocket({
  sessionId,
  onMessage,
  onExit,
  onError,
}: UseTerminalWebSocketProps) {
  const clientRef = useRef<Client | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<TerminalConnectionStatus>('disconnected')

  // WebSocket 연결
  const connect = useCallback(() => {
    if (!sessionId) return

    const token = apiClient.getAccessToken()
    if (!token) {
      console.error('[WebSocket] No access token available')
      setConnectionStatus('error')
      onError('인증 토큰이 없습니다. 다시 로그인해주세요.')
      return
    }

    setConnectionStatus('connecting')

    const wsUrl = getWebSocketUrl()
    console.log('[WebSocket] 🔌 Connecting to:', wsUrl)

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        if (str.includes('CONNECT') || str.includes('CONNECTED')) {
          console.log('[STOMP] 🟢', str)
        } else if (str.includes('MESSAGE')) {
          console.log('[STOMP] 📨', str)
        } else {
          console.log('[STOMP]', str)
        }
      },
      reconnectDelay: 0, // 자동 재연결 비활성화
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    client.onConnect = () => {
      console.log('[WebSocket] ✅ Connected')
      setConnectionStatus('connected')

      // 터미널 출력 구독
      const subscription = client.subscribe(`/topic/terminal/${sessionId}`, (message: IMessage) => {
        console.log('[WebSocket] 📥 Raw message:', message.body)

        try {
          const outputMessage: TerminalOutputMessage = JSON.parse(message.body)
          console.log('[WebSocket] 📦 Parsed:', outputMessage.type, outputMessage.data)

          if (outputMessage.type === 'output') {
            // 서버에서 받은 출력 그대로 xterm에 표시
            onMessage(outputMessage.data)
          } else if (outputMessage.type === 'exit') {
            console.log('[WebSocket] 🚪 Process exited:', outputMessage.exitCode)
            onExit(outputMessage.exitCode)
          } else if (outputMessage.type === 'error') {
            console.error('[WebSocket] ❌ Server error:', outputMessage.data)
            onError(outputMessage.data)
          }
        } catch (error) {
          console.error('[WebSocket] ⚠️ Message parse error:', error)
          console.error('[WebSocket] Raw body:', message.body)
          onError('메시지 파싱 실패')
        }
      })

      console.log('[WebSocket] 📻 Subscribed to:', `/topic/terminal/${sessionId}`)
      console.log('[WebSocket] 📡 Subscription ID:', subscription.id)
    }

    client.onStompError = (frame) => {
      console.error('[WebSocket] ❌ STOMP error:', frame.headers['message'])
      console.error('[WebSocket] Error frame:', frame)
      setConnectionStatus('error')
      onError(frame.headers['message'] || '연결 오류가 발생했습니다')
      client.deactivate()
    }

    client.onWebSocketClose = () => {
      console.log('[WebSocket] 🔌 Connection closed')
      setConnectionStatus('disconnected')
    }

    client.onWebSocketError = (error) => {
      console.error('[WebSocket] ⚠️ WebSocket error:', error)
      setConnectionStatus('error')
    }

    client.activate()
    clientRef.current = client
  }, [sessionId, onMessage, onExit, onError])

  // 터미널 입력 전송
  const sendInput = useCallback(
    (input: string) => {
      if (!clientRef.current?.connected || !sessionId) {
        console.warn('[WebSocket] ⚠️ Cannot send: not connected')
        return
      }

      const inputMessage: TerminalInputMessage = {
        type: 'input',
        data: input,
        timestamp: new Date().toISOString(),
      }

      console.log('[WebSocket] 📤 Sending:', JSON.stringify(inputMessage))

      try {
        clientRef.current.publish({
          destination: `/app/terminal/${sessionId}/input`,
          body: JSON.stringify(inputMessage),
        })
      } catch (error) {
        console.error('[WebSocket] ❌ Send failed:', error)
      }
    },
    [sessionId]
  )

  // 시그널 전송
  const sendSignal = useCallback(
    (signal: 'SIGINT' | 'SIGTERM' | 'SIGKILL') => {
      if (!clientRef.current?.connected || !sessionId) {
        console.warn('[WebSocket] ⚠️ Cannot send signal: not connected')
        return
      }

      const signalMessage: TerminalInputMessage = {
        type: 'signal',
        data: signal,
        timestamp: new Date().toISOString(),
      }

      console.log('[WebSocket] 📤 Sending signal:', signal)

      clientRef.current.publish({
        destination: `/app/terminal/${sessionId}/input`,
        body: JSON.stringify(signalMessage),
      })
    },
    [sessionId]
  )

  // 연결 해제
  const disconnect = useCallback(() => {
    if (clientRef.current?.connected) {
      console.log('[WebSocket] 🔌 Disconnecting...')
      clientRef.current.deactivate()
      clientRef.current = null
      setConnectionStatus('disconnected')
    }
  }, [])

  // sessionId 변경 시 재연결
  useEffect(() => {
    if (sessionId) {
      connect()
    }

    return () => {
      disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  return {
    connectionStatus,
    sendInput,
    sendSignal,
    disconnect,
  }
}
