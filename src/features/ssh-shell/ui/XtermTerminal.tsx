/**
 * Xterm Terminal Component
 * xterm.js 기반 완전한 터미널 에뮬레이터
 */

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { Terminal as TerminalIcon, Maximize2, Minimize2 } from 'lucide-react'
import '@xterm/xterm/css/xterm.css'

import { useFullscreen } from '@/shared/lib/hooks/use-fullscreen'
import { Button } from '@/shared/ui/button'

interface XtermTerminalProps {
  shellSessionId: string | null
  host: string | null
  username: string | null
  isConnected: boolean
  onData: (data: string) => void
}

export interface XtermTerminalHandle {
  write: (data: string) => void
  clear: () => void
  focus: () => void
}

export const XtermTerminal = forwardRef<XtermTerminalHandle, XtermTerminalProps>(
  function XtermTerminal({ shellSessionId, host, username, isConnected, onData }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const terminalRef = useRef<HTMLDivElement>(null)
    const xtermRef = useRef<XTerm | null>(null)
    const fitAddonRef = useRef<FitAddon | null>(null)

    // 전체화면 훅
    const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef)

    // 연결 상태를 ref로 관리 (onData 핸들러에서 최신 값 참조용)
    const isConnectedRef = useRef(isConnected)
    const onDataRef = useRef(onData)

    // ref 업데이트
    useEffect(() => {
      isConnectedRef.current = isConnected
      onDataRef.current = onData
    }, [isConnected, onData])

    // 외부에서 터미널 제어 가능하도록 imperative handle 노출
    useImperativeHandle(ref, () => ({
      write: (data: string) => {
        xtermRef.current?.write(data)
      },
      clear: () => {
        xtermRef.current?.clear()
      },
      focus: () => {
        xtermRef.current?.focus()
      },
    }))

    // xterm 인스턴스 초기화 (마운트 시 한 번만)
    useEffect(() => {
      if (!terminalRef.current) return

      // Terminal 인스턴스 생성
      const term = new XTerm({
        cursorBlink: true,
        cursorStyle: 'block',
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        fontSize: 14,
        convertEol: true, // 개행 문자 자동 변환
        theme: {
          background: '#0f172a', // slate-950
          foreground: '#e5e7eb', // text-gray-200
          cursor: '#10b981', // green-500
          cursorAccent: '#0f172a',
          selectionBackground: '#334155', // slate-700
          black: '#1e293b',
          red: '#ef4444',
          green: '#10b981',
          yellow: '#f59e0b',
          blue: '#3b82f6',
          magenta: '#a855f7',
          cyan: '#06b6d4',
          white: '#e5e7eb',
          brightBlack: '#475569',
          brightRed: '#f87171',
          brightGreen: '#34d399',
          brightYellow: '#fbbf24',
          brightBlue: '#60a5fa',
          brightMagenta: '#c084fc',
          brightCyan: '#22d3ee',
          brightWhite: '#f9fafb',
        },
        rows: 30,
        cols: 100,
        scrollback: 1000,
      })

      // Addons 추가
      const fitAddon = new FitAddon()
      const webLinksAddon = new WebLinksAddon()

      term.loadAddon(fitAddon)
      term.loadAddon(webLinksAddon)

      // DOM에 마운트
      term.open(terminalRef.current)

      // 사용자 입력 처리 - ref를 사용하여 최신 상태 참조
      term.onData((data) => {
        if (isConnectedRef.current) {
          onDataRef.current(data)
        }
      })

      // 크기 맞추기 - DOM 렌더링 완료 후 실행
      requestAnimationFrame(() => {
        try {
          fitAddon.fit()
        } catch (error) {
          console.error('Failed to fit terminal:', error)
        }
      })

      // refs에 저장
      xtermRef.current = term
      fitAddonRef.current = fitAddon

      // Window resize 처리
      const handleResize = () => {
        fitAddon.fit()
      }
      window.addEventListener('resize', handleResize)

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize)
        term.dispose()
        xtermRef.current = null
        fitAddonRef.current = null
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // 마운트 시 한 번만 실행

    // 전체화면 상태 변경 시 터미널 크기 조정
    useEffect(() => {
      if (!fitAddonRef.current) return

      // 전체화면 전환 시 DOM 렌더링 완료 후 크기 조정
      const timer = setTimeout(() => {
        requestAnimationFrame(() => {
          try {
            fitAddonRef.current?.fit()
          } catch (error) {
            console.error('Failed to fit terminal on fullscreen change:', error)
          }
        })
      }, 100)

      return () => clearTimeout(timer)
    }, [isFullscreen])

    // 연결되지 않은 경우
    if (!shellSessionId) {
      return (
        <div className="h-[calc(100vh-320px)] flex items-center justify-center rounded-lg border border-dashed bg-muted/10">
          <div className="text-center text-muted-foreground">
            <TerminalIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>SSH 연결 버튼을 눌러 원격 서버에 연결하세요.</p>
          </div>
        </div>
      )
    }

    return (
      <div
        ref={containerRef}
        className={`flex flex-col rounded-lg border bg-slate-950 overflow-hidden ${
          isFullscreen ? 'h-screen' : 'h-[calc(100vh-320px)]'
        }`}
      >
        {/* 터미널 헤더 */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/50 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <TerminalIcon className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-medium text-slate-300">
              {username}@{host}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isConnected && (
              <div className="flex items-center gap-1.5 text-xs text-green-400">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span>연결됨</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-slate-400 hover:text-slate-200"
              onClick={toggleFullscreen}
              title={isFullscreen ? '전체화면 종료' : '전체화면'}
            >
              {isFullscreen ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* xterm.js 터미널 영역 */}
        <div ref={terminalRef} className="flex-1 p-2" />
      </div>
    )
  }
)
