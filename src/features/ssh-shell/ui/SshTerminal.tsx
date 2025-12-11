/**
 * SSH Terminal Component
 * SSH 터미널 컴포넌트
 */

import { useEffect, useRef, KeyboardEvent, useMemo } from 'react'
import { Input } from '@/shared/ui/input'
import { Loader2, Terminal } from 'lucide-react'
import AnsiToHtml from 'ansi-to-html'

import type { TerminalLine } from '../model/types'

interface SshTerminalProps {
  sessionId: string | null
  status: string | null
  lines: TerminalLine[]
  host: string | null
  username: string | null
  isConnected: boolean
  currentCommand: string
  onCommandChange: (command: string) => void
  onSendCommand: (command: string) => void
  onHistoryUp: () => void
  onHistoryDown: () => void
}

export function SshTerminal({
  sessionId,
  status,
  lines,
  host,
  username,
  isConnected,
  currentCommand,
  onCommandChange,
  onSendCommand,
  onHistoryUp,
  onHistoryDown,
}: SshTerminalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ANSI to HTML converter
  const ansiConverter = useMemo(
    () =>
      new AnsiToHtml({
        fg: '#e5e7eb', // text-gray-200
        bg: '#0f172a', // slate-950
        newline: false,
        escapeXML: true,
      }),
    []
  )

  // 새 출력이 추가되면 자동 스크롤
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [lines])

  // 연결되면 입력 필드에 포커스
  useEffect(() => {
    if (isConnected && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isConnected])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentCommand.trim()) {
      onSendCommand(currentCommand)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      onHistoryUp()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      onHistoryDown()
    }
  }

  const getLineClassName = (type: TerminalLine['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-400'
      case 'status':
        return 'text-blue-400'
      case 'command':
        return 'text-green-400'
      default:
        return 'text-gray-200'
    }
  }

  const getPrompt = () => {
    if (!isConnected) return ''
    return `${username}@${host}$ `
  }

  // 연결되지 않은 경우 메시지만 표시
  if (!sessionId) {
    return (
      <div className="h-[calc(100vh-280px)] flex items-center justify-center rounded-lg border border-dashed bg-muted/10">
        <div className="text-center text-muted-foreground max-w-md">
          <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="mb-4">SSH 연결 버튼을 눌러 원격 서버에 연결하세요.</p>
          <div className="text-xs text-left bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 space-y-1">
            <p className="font-semibold text-amber-600 dark:text-amber-500">⚠️ 제한사항</p>
            <p className="text-muted-foreground">
              vi, vim, nano, top 등 전체 화면 편집기는 지원되지 않습니다.
              <br />
              간단한 명령어(ls, cd, cat, echo 등)만 사용해주세요.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] rounded-lg border bg-slate-950 overflow-hidden">
      {/* 터미널 헤더 */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/50 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Terminal className="h-3.5 w-3.5" />
          <span className="font-medium">
            {username}@{host}
          </span>
          {isConnected && (
            <div className="flex items-center gap-1.5 text-green-400">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span>연결됨</span>
            </div>
          )}
        </div>
        <div className="text-xs text-slate-500 font-mono">{sessionId}</div>
      </div>

      {/* 터미널 출력 영역 */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 terminal-scroll"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'hsl(var(--border)) transparent'
        }}
      >
        {lines.length === 0 ? (
          <div className="flex h-full items-center justify-center text-slate-500 text-sm">
            터미널 출력이 여기에 표시됩니다.
          </div>
        ) : (
          <div className="font-mono text-sm space-y-0.5">
            {lines.map((line) => (
              <div key={line.id} className={getLineClassName(line.type)}>
                {line.type === 'command' && <span className="text-green-400">{getPrompt()}</span>}
                <span
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: ansiConverter.toHtml(line.content) }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 명령어 입력 영역 */}
      {isConnected ? (
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 border-t border-slate-800">
          <span className="font-mono text-sm text-green-400 shrink-0">{getPrompt()}</span>
          <Input
            ref={inputRef}
            value={currentCommand}
            onChange={(e) => onCommandChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="간단한 명령어만 사용 (pwd, ls, cd, cat 등) - vi, vim, nano 등은 미지원"
            className="flex-1 border-0 bg-transparent font-mono text-sm text-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-600"
            disabled={!isConnected}
            autoComplete="off"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center px-4 py-3 bg-slate-900/50 border-t border-slate-800">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            {status === 'CONNECTING' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>연결 중...</span>
              </>
            )}
            {status === 'DISCONNECTED' && <span>연결이 끊어졌습니다. 다시 연결해주세요.</span>}
            {status === 'ERROR' && <span className="text-red-400">연결 오류가 발생했습니다.</span>}
          </div>
        </div>
      )}
    </div>
  )
}
