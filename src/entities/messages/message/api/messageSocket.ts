/**
 * 신규 메시지 실시간 알림 소켓 (STOMP over SockJS)
 *
 * 기존 터미널 WebSocket 과 같은 스택을 쓰되 엔드포인트와 연결 관리는 분리한다.
 * 개인 큐(`/user/queue/messages`)는 CONNECT 시 JWT 를 실어야 구독이 허용된다
 * (ADR-0004).
 *
 * 앱 전체에서 연결은 하나만 유지하므로 모듈 수준 싱글턴으로 둔다.
 */

import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

import { apiClient } from '@/shared/api/client'

import type { MessageType } from '../model/types'
import type { IMessage } from '@stomp/stompjs'


/** 서버 MessageDto.NewMessageEvent 와 1:1 대응 */
export interface NewMessageEvent {
  messageId: number
  messageType: MessageType
  title: string
  senderName: string
}

type MessageHandler = (event: NewMessageEvent) => void
type ConnectHandler = () => void

const ENDPOINT = '/ws/notifications'
const USER_QUEUE = '/user/queue/messages'
const RECONNECT_DELAY_MS = 5000

class MessageSocketManager {
  private client: Client | null = null
  private messageHandlers = new Set<MessageHandler>()
  private connectHandlers = new Set<ConnectHandler>()

  /** 신규 메시지 수신 핸들러 등록 — 해제 함수를 돌려준다 */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler)
    return () => this.messageHandlers.delete(handler)
  }

  /**
   * 연결(재연결) 시점 핸들러 등록
   *
   * 끊겨 있던 동안 놓친 메시지가 있을 수 있으므로 재연결 때 배지를 다시 조회한다.
   */
  onConnect(handler: ConnectHandler): () => void {
    this.connectHandlers.add(handler)
    return () => this.connectHandlers.delete(handler)
  }

  /** 이미 연결되어 있으면 아무것도 하지 않는다 */
  connect(): void {
    if (this.client) return

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`${window.location.protocol}//${window.location.host}${ENDPOINT}`),
      reconnectDelay: RECONNECT_DELAY_MS,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      /**
       * access token 은 15분마다 갱신되므로 매 연결 시도 시점에 최신 값을 읽는다.
       * (재연결 때도 이 콜백이 다시 호출된다)
       */
      beforeConnect: () => {
        const token = apiClient.getAccessToken()
        client.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {}
      },

      onConnect: () => {
        client.subscribe(USER_QUEUE, (frame: IMessage) => {
          try {
            const event = JSON.parse(frame.body) as NewMessageEvent
            this.messageHandlers.forEach((handler) => handler(event))
          } catch (error) {
            console.error('알림 메시지 파싱 실패:', error)
          }
        })
        this.connectHandlers.forEach((handler) => handler())
      },

      onStompError: (frame) => {
        console.error('알림 STOMP 오류:', frame.headers['message'])
      },
    })

    this.client = client
    client.activate()
  }

  disconnect(): void {
    if (!this.client) return

    try {
      this.client.deactivate()
    } catch (error) {
      console.error('알림 소켓 해제 중 오류:', error)
    }
    this.client = null
  }
}

export const messageSocket = new MessageSocketManager()
