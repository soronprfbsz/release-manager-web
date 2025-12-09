/**
 * Terminal Container Component
 * 셸 터미널 세션 관리 및 WebSocket 통합
 *
 * xterm.js 표준 패턴:
 * - 사용자 입력 → WebSocket → 서버 → bash stdin
 * - bash stdout → 서버 → WebSocket → xterm.write()
 * - NO 로컬 에코: 서버가 에코를 담당
 */

import { useEffect, useRef, useState } from 'react'
import { Play, Square, Terminal as TerminalIcon } from 'lucide-react'

import { useCreateTerminalSession, useDeleteTerminalSession } from '@/entities/terminal'

import { useToast } from '@/shared/lib/hooks/use-toast'
import { createErrorHandler } from '@/shared/lib/utils/error-handler'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { TypographyMuted } from '@/shared/ui/typography'

import { useTerminalWebSocket } from '../lib/useTerminalWebSocket'
import { Terminal, type TerminalHandle } from './Terminal'

export function TerminalContainer() {
  const { toast } = useToast()
  const terminalRef = useRef<TerminalHandle>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const sessionIdRef = useRef<string | null>(null)

  const createSessionMutation = useCreateTerminalSession()
  const deleteSessionMutation = useDeleteTerminalSession()

  // sessionId를 ref에도 동기화
  useEffect(() => {
    sessionIdRef.current = sessionId
  }, [sessionId])

  // WebSocket 연결 및 메시지 핸들링
  const { connectionStatus, sendInput, disconnect } = useTerminalWebSocket({
    sessionId,
    onMessage: (message) => {
      // 서버에서 받은 출력을 xterm에 그대로 표시
      terminalRef.current?.write(message)
    },
    onExit: (exitCode) => {
      terminalRef.current?.write(`\r\n\n\x1b[1;33m[프로세스 종료: exit code ${exitCode || 0}]\x1b[0m\r\n`)
      toast({
        title: '세션 종료',
        description: '터미널 프로세스가 종료되었습니다.',
      })
    },
    onError: (error) => {
      terminalRef.current?.write(`\r\n\n\x1b[1;31m[오류: ${error}]\x1b[0m\r\n`)
      toast({
        title: '터미널 오류',
        description: error,
        variant: 'destructive',
      })
    },
  })

  // 세션 생성
  const handleCreateSession = () => {
    createSessionMutation.mutate(undefined, {
      onSuccess: (data) => {
        console.log('[Container] 세션 생성 성공:', data.sessionId)
        setSessionId(data.sessionId)
        toast({
          title: '세션 시작',
          description: `터미널 세션이 시작되었습니다.`,
        })
      },
      onError: createErrorHandler(toast, '세션 생성 실패'),
    })
  }

  // 세션 종료
  const handleDeleteSession = () => {
    if (!sessionId) return

    const currentSessionId = sessionId
    disconnect()

    // 먼저 sessionId를 null로 설정 (cleanup 방지)
    setSessionId(null)

    // 그 다음 API 호출
    deleteSessionMutation.mutate(currentSessionId, {
      onSuccess: () => {
        terminalRef.current?.clear()
        console.log('[Container] 세션 종료 성공')
        toast({
          title: '세션 종료',
          description: '터미널 세션이 종료되었습니다.',
        })
      },
      onError: createErrorHandler(toast, '세션 종료 실패'),
    })
  }

  // 터미널 입력 처리 (xterm.onData → 서버 전송)
  const handleTerminalInput = (data: string) => {
    sendInput(data)
  }

  // 컴포넌트 언마운트 시 세션 정리
  useEffect(() => {
    return () => {
      const currentSessionId = sessionIdRef.current
      if (currentSessionId) {
        disconnect()
        deleteSessionMutation.mutate(currentSessionId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TerminalIcon className="h-5 w-5" />
            <span>터미널 세션</span>
            {sessionId && (
              <span className="text-xs text-muted-foreground font-mono">
                {sessionId.substring(0, 20)}...
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                connectionStatus === 'connected'
                  ? 'default'
                  : connectionStatus === 'connecting'
                    ? 'secondary'
                    : connectionStatus === 'error'
                      ? 'destructive'
                      : 'outline'
              }
            >
              {connectionStatus === 'connected'
                ? '🟢 연결됨'
                : connectionStatus === 'connecting'
                  ? '🟡 연결 중'
                  : connectionStatus === 'error'
                    ? '🔴 오류'
                    : '⚪ 대기'}
            </Badge>
            {!sessionId ? (
              <Button
                onClick={handleCreateSession}
                disabled={createSessionMutation.isPending}
                variant="outline"
                size="sm"
              >
                <Play className="h-4 w-4" />
                {createSessionMutation.isPending ? '시작 중...' : '세션 시작'}
              </Button>
            ) : (
              <Button
                onClick={handleDeleteSession}
                disabled={deleteSessionMutation.isPending}
                variant="outline"
                size="sm"
              >
                <Square className="h-4 w-4" />
                {deleteSessionMutation.isPending ? '종료 중...' : '세션 종료'}
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 p-4">
        {!sessionId ? (
          <div className="flex-1 flex items-center justify-center border rounded-lg bg-muted/50">
            <div className="text-center space-y-4">
              <TerminalIcon className="h-16 w-16 mx-auto text-muted-foreground" />
              <TypographyMuted>
                '세션 시작' 버튼을 클릭하여 터미널에 연결하세요.
              </TypographyMuted>
            </div>
          </div>
        ) : (
          <Terminal
            ref={terminalRef}
            sessionId={sessionId}
            onInput={handleTerminalInput}
            className="rounded border flex-1"
          />
        )}
      </CardContent>
    </Card>
  )
}
