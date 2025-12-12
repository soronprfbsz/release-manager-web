/**
 * SSH Shell Page
 * Interactive SSH Shell 페이지
 */

import { useState, useCallback, useRef } from 'react'
import { PlugZap, Unplug, Terminal, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  SshConnectionSheet,
  XtermTerminal,
  INITIAL_FORM_DATA,
  useSshShell,
  useSshConnectionHistory,
  type XtermTerminalHandle,
} from '@/features/ssh-shell'
import { FileTransferSheet } from '@/features/ssh-shell/ui/FileTransferSheet'
import type { SshConnectionFormData } from '@/features/ssh-shell'
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
  // 로컬 UI 상태
  const [connectionSheetOpen, setConnectionSheetOpen] = useState(false)
  const [fileTransferSheetOpen, setFileTransferSheetOpen] = useState(false)
  const [formData, setFormData] = useState<SshConnectionFormData>(INITIAL_FORM_DATA)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const terminalRef = useRef<XtermTerminalHandle>(null)

  // SSH Shell 비즈니스 로직 (Custom Hook)
  const { session, isConnected, isConnecting, connect, disconnect, sendCommand } =
    useSshShell(terminalRef)

  // SSH 연결 히스토리
  const { saveToHistory } = useSshConnectionHistory()

  // SSH 연결 핸들러
  const handleConnect = useCallback(async () => {
    const result = await connect(formData)

    if (result.success) {
      // 연결 성공 - 히스토리 저장 (비밀번호 제외)
      saveToHistory(formData.host, formData.port, formData.username)
      setConnectionSheetOpen(false)
      setErrors({})
    } else if (result.errors) {
      // 유효성 검증 실패
      setErrors(result.errors)
    }
  }, [formData, connect, saveToHistory])

  // SSH 연결 종료 핸들러
  const handleDisconnect = useCallback(async () => {
    await disconnect()
  }, [disconnect])

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
              <BreadcrumbPage>터미널</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Page Header */}
      <PageHeader
        icon={<Terminal className="h-5 w-5 text-primary" />}
        title="터미널"
        description="SSH를 통해 원격 서버에 터미널로 연결합니다."
        actions={
          <>
            {session ? (
              <Button onClick={handleDisconnect} variant="outline">
                <Unplug className="h-4 w-4" />
                연결 종료
              </Button>
            ) : (
              <Button onClick={() => setConnectionSheetOpen(true)} variant="outline">
                <PlugZap className="h-4 w-4" />
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
        isConnecting={isConnecting}
        onFormDataChange={setFormData}
        onConnect={handleConnect}
        onClose={() => {
          setConnectionSheetOpen(false)
          setErrors({})
        }}
      />

      {/* 파일 전송 Sheet */}
      <FileTransferSheet
        open={fileTransferSheetOpen}
        onOpenChange={setFileTransferSheetOpen}
        shellSessionId={session?.sessionId || null}
        isConnected={isConnected}
      />

      {/* xterm.js 터미널 */}
      <div className="h-[calc(100vh-300px)]">
        <XtermTerminal
          key={session?.sessionId || 'no-session'}
          ref={terminalRef}
          sessionId={session?.sessionId || null}
          host={session?.host || null}
          username={session?.username || null}
          isConnected={isConnected}
          onData={sendCommand}
          headerActions={
            isConnected && session?.sessionId && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs flex items-center gap-1.5 border border-transparent hover:border-border"
                onClick={() => setFileTransferSheetOpen(true)}
              >
                <Upload className="h-3 w-3" />
                파일 전송
              </Button>
            )
          }
        />
      </div>
    </div>
  )
}
