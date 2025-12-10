/**
 * SSH Shell Page
 * Interactive SSH Shell 페이지
 */

import { useState, useCallback, useRef } from 'react'
import { Plus, Terminal } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useConnectShell, useDisconnectShell } from '@/entities/ssh-shell'
import type { ShellConnectRequest, OutputMessage } from '@/entities/ssh-shell'

import {
  SshConnectionSheet,
  XtermTerminal,
  INITIAL_FORM_DATA,
  validateSshConnectionForm,
  useSshShellWebSocket,
  type XtermTerminalHandle,
} from '@/features/ssh-shell'
import type { SshConnectionFormData } from '@/features/ssh-shell'
import { useToast } from '@/shared/lib/hooks/use-toast'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'
import { Button } from '@/shared/ui/button'
import { PageHeader } from '@/shared/ui/page-header'

export function SshShellPage() {
  // 상태 관리
  const [connectionSheetOpen, setConnectionSheetOpen] = useState(false)
  const [formData, setFormData] = useState<SshConnectionFormData>(INITIAL_FORM_DATA)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [shellSessionId, setShellSessionId] = useState<string | null>(null)
  const [host, setHost] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const terminalRef = useRef<XtermTerminalHandle>(null)

  const { toast } = useToast()
  const connectMutation = useConnectShell()
  const disconnectMutation = useDisconnectShell()

  // WebSocket 메시지 핸들러 - xterm에 직접 출력
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
      // xterm에 직접 쓰기 (ANSI 이스케이프 시퀀스 포함)
      terminalRef.current.write(output)
    }
  }, [])

  const handleWebSocketConnect = useCallback(() => {
    console.log('WebSocket connected')
  }, [])

  const handleWebSocketDisconnect = useCallback(() => {
    console.log('WebSocket disconnected')
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
    shellSessionId,
    onMessage: handleWebSocketMessage,
    onConnect: handleWebSocketConnect,
    onDisconnect: handleWebSocketDisconnect,
    onError: handleWebSocketError,
  })

  // SSH 연결
  const handleConnect = useCallback(async () => {
    // 유효성 검증
    const validation = validateSshConnectionForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setErrors({})

    // 연결 요청
    const request: ShellConnectRequest = {
      host: formData.host,
      port: formData.port,
      username: formData.username,
      password: formData.password,
    }

    try {
      const response = await connectMutation.mutateAsync(request)

      // 셸 상태 업데이트
      setShellSessionId(response.shellSessionId)
      setHost(response.host)
      setUsername(formData.username)

      // Sheet 닫기
      setConnectionSheetOpen(false)

      toast({
        title: 'SSH 연결 성공',
        description: `세션 ${response.shellSessionId}이(가) 시작되었습니다.`,
      })
    } catch (error) {
      console.error('Failed to connect:', error)
      toast({
        title: '연결 실패',
        description: error instanceof Error ? error.message : 'SSH 연결에 실패했습니다.',
        variant: 'destructive',
      })
    }
  }, [formData, connectMutation, toast])

  // SSH 연결 종료
  const handleDisconnect = useCallback(async () => {
    if (!shellSessionId) return

    try {
      // WebSocket 먼저 종료
      wsDisconnect()

      // REST API로 세션 종료
      await disconnectMutation.mutateAsync(shellSessionId)

      // 상태 초기화
      setShellSessionId(null)
      setHost(null)
      setUsername(null)
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
  }, [shellSessionId, wsDisconnect, disconnectMutation, toast])

  // xterm 사용자 입력 처리 (onData 콜백)
  const handleTerminalData = useCallback(
    (data: string) => {
      // xterm의 사용자 입력을 WebSocket으로 전송
      sendCommand(data)
    },
    [sendCommand]
  )

  return (
    <div className="flex flex-col space-y-6">
      {/* Breadcrumb */}
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>작업 관리</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>SSH 터미널</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Page Header */}
      <PageHeader
        icon={<Terminal className="h-5 w-5 text-primary" />}
        title="SSH 터미널"
        description="SSH를 통해 원격 서버에 연결하여 터미널을 사용합니다."
          actions={
            <>
              {shellSessionId ? (
                <Button onClick={handleDisconnect} variant="outline">
                  연결 종료
                </Button>
              ) : (
                <Button onClick={() => setConnectionSheetOpen(true)} variant="outline">
                  <Plus className="h-4 w-4" />
                  연결
                </Button>
              )}
            </>
          }
        />

      {/* 연결 Sheet */}
      <SshConnectionSheet
        open={connectionSheetOpen}
        formData={formData}
        errors={errors}
        isConnecting={connectMutation.isPending}
        onFormDataChange={setFormData}
        onConnect={handleConnect}
        onClose={() => {
          setConnectionSheetOpen(false)
          setErrors({})
        }}
      />

      {/* xterm.js 터미널 */}
      <div className="h-[calc(100vh-300px)]">
        <XtermTerminal
          key={shellSessionId || 'no-session'}
          ref={terminalRef}
          shellSessionId={shellSessionId}
          host={host}
          username={username}
          isConnected={isConnected}
          onData={handleTerminalData}
        />
      </div>
    </div>
  )
}
