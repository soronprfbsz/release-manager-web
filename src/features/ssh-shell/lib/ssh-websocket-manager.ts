/**
 * SSH WebSocket Manager (Singleton)
 * 페이지 이동 시에도 WebSocket 연결을 유지하기 위한 전역 관리자
 */

import { Client, IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

import type { OutputMessage, CommandMessage } from '@/entities/ssh-shell'

type MessageHandler = (message: OutputMessage) => void
type DisconnectHandler = () => void
type ErrorHandler = (error: Error) => void

class SshWebSocketManager {
  private client: Client | null = null
  private currentSessionId: string | null = null
  private messageHandlers = new Set<MessageHandler>()
  private disconnectHandlers = new Set<DisconnectHandler>()
  private errorHandlers = new Set<ErrorHandler>()
  private isConnected = false

  /**
   * WebSocket 연결
   */
  connect(sessionId: string): void {
    // 이미 같은 세션으로 연결되어 있으면 무시
    if (this.currentSessionId === sessionId && this.client && this.isConnected) {
      return
    }

    // 기존 연결 정리
    this.disconnect()

    this.currentSessionId = sessionId

    // WebSocket URL 생성
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
        this.isConnected = true

        // SSH Shell 세션 구독
        client.subscribe(`/topic/terminal/${sessionId}`, (message: IMessage) => {
          try {
            const wsMessage = JSON.parse(message.body)
            const outputMessage: OutputMessage = wsMessage.payload || wsMessage

            // 모든 등록된 핸들러에게 메시지 전달
            this.messageHandlers.forEach((handler) => handler(outputMessage))
          } catch (error) {
            console.error('Failed to parse message:', error)
            const err = error instanceof Error ? error : new Error('Failed to parse message')
            this.errorHandlers.forEach((handler) => handler(err))
          }
        })
      },

      onStompError: (frame) => {
        console.error('STOMP error:', frame)
        this.isConnected = false
        const error = new Error(`STOMP error: ${frame.headers['message'] || 'Unknown error'}`)
        this.errorHandlers.forEach((handler) => handler(error))
      },

      onWebSocketError: (event) => {
        console.error('WebSocket error:', event)
        this.isConnected = false
        const error = new Error('WebSocket connection error')
        this.errorHandlers.forEach((handler) => handler(error))
      },

      onDisconnect: () => {
        console.log('WebSocket disconnected')
        this.isConnected = false
        this.disconnectHandlers.forEach((handler) => handler())
      },
    })

    this.client = client
    client.activate()
  }

  /**
   * WebSocket 연결 해제
   */
  disconnect(): void {
    if (this.client) {
      try {
        this.client.deactivate()
      } catch (error) {
        console.error('Error during disconnect:', error)
      }
      this.client = null
      this.currentSessionId = null
      this.isConnected = false
    }
  }

  /**
   * 명령어 전송
   */
  sendCommand(sessionId: string, command: string): void {
    if (!this.client || !this.isConnected) {
      console.warn('WebSocket not connected')
      return
    }

    if (this.currentSessionId !== sessionId) {
      console.warn('Session ID mismatch')
      return
    }

    const message: CommandMessage = { command }

    try {
      this.client.publish({
        destination: `/app/terminal/${sessionId}/command`,
        body: JSON.stringify(message),
      })
    } catch (error) {
      console.error('Failed to send command:', error)
      const err = error instanceof Error ? error : new Error('Failed to send command')
      this.errorHandlers.forEach((handler) => handler(err))
    }
  }

  /**
   * 메시지 핸들러 등록
   */
  addMessageHandler(handler: MessageHandler): void {
    this.messageHandlers.add(handler)
  }

  /**
   * 메시지 핸들러 제거
   */
  removeMessageHandler(handler: MessageHandler): void {
    this.messageHandlers.delete(handler)
  }

  /**
   * 연결 해제 핸들러 등록
   */
  addDisconnectHandler(handler: DisconnectHandler): void {
    this.disconnectHandlers.add(handler)
  }

  /**
   * 연결 해제 핸들러 제거
   */
  removeDisconnectHandler(handler: DisconnectHandler): void {
    this.disconnectHandlers.delete(handler)
  }

  /**
   * 에러 핸들러 등록
   */
  addErrorHandler(handler: ErrorHandler): void {
    this.errorHandlers.add(handler)
  }

  /**
   * 에러 핸들러 제거
   */
  removeErrorHandler(handler: ErrorHandler): void {
    this.errorHandlers.delete(handler)
  }

  /**
   * 연결 상태 확인
   */
  getIsConnected(): boolean {
    return this.isConnected
  }

  /**
   * 현재 세션 ID 확인
   */
  getCurrentSessionId(): string | null {
    return this.currentSessionId
  }
}

// 싱글톤 인스턴스
export const sshWebSocketManager = new SshWebSocketManager()
