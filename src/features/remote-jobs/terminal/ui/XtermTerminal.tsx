/**
 * Xterm Terminal Component
 * xterm.js 기반 완전한 터미널 에뮬레이터
 */

import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback, useState } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import type { ITheme } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { Terminal as TerminalIcon, Maximize2, Minimize2 } from 'lucide-react'
import '@xterm/xterm/css/xterm.css'

import { useFullscreen } from '@/shared/lib/hooks/use-fullscreen'
import { Button } from '@/shared/ui/button'
import { useThemeStore } from '@/shared/store/useThemeStore'
import type { Theme } from '@/shared/store/useThemeStore'
import { useSshSessionStore } from '@/shared/store/useSshSessionStore'
import { XTERM_THEMES } from '../config/xterm-themes'

interface XtermTerminalProps {
  sessionId: string | null
  host: string | null
  username: string | null
  isConnected: boolean
  onData: (data: string) => void
  onResize?: (cols: number, rows: number) => void
  onConnect?: () => void
  headerActions?: React.ReactNode
}

export interface XtermTerminalHandle {
  write: (data: string) => void
  clear: () => void
  focus: () => void
}

export const XtermTerminal = forwardRef<XtermTerminalHandle, XtermTerminalProps>(
  function XtermTerminal({ sessionId, host, username, isConnected, onData, onResize, onConnect, headerActions }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const terminalRef = useRef<HTMLDivElement>(null)
    const xtermRef = useRef<XTerm | null>(null)
    const fitAddonRef = useRef<FitAddon | null>(null)

    // 전체화면 훅
    const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef)

    // SSH 세션 store
    const appendOutput = useSshSessionStore((state) => state.appendOutput)
    const terminalHistory = useSshSessionStore((state) => state.terminalHistory)

    // 연결 상태를 ref로 관리 (onData 핸들러에서 최신 값 참조용)
    const isConnectedRef = useRef(isConnected)
    const onDataRef = useRef(onData)
    const onResizeRef = useRef(onResize)

    // ref 업데이트
    useEffect(() => {
      isConnectedRef.current = isConnected
      onDataRef.current = onData
      onResizeRef.current = onResize
    }, [isConnected, onData, onResize])

    // 외부에서 터미널 제어 가능하도록 imperative handle 노출
    useImperativeHandle(ref, () => ({
      write: (data: string) => {
        xtermRef.current?.write(data)
        // 출력을 store에 저장
        if (sessionId) {
          appendOutput(sessionId, data)
        }
      },
      clear: () => {
        xtermRef.current?.clear()
      },
      focus: () => {
        xtermRef.current?.focus()
      },
    }), [sessionId, appendOutput])

    // Theme 관리
    const theme = useThemeStore((state) => state.theme)

    // 테마 적용 함수
    const getTerminalTheme = useCallback((currentTheme: Theme) => {
      if (currentTheme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        return isDark ? XTERM_THEMES.black : XTERM_THEMES.white
      }
      return XTERM_THEMES[currentTheme] || XTERM_THEMES.black
    }, [])

    // 현재 제마 상태 관리
    const [activeTheme, setActiveTheme] = useState<ITheme>(() => getTerminalTheme(theme))

    // 테마 변경 감지 및 적용
    useEffect(() => {
      if (!xtermRef.current) return

      const newTheme = getTerminalTheme(theme)
      xtermRef.current.options.theme = newTheme
      setActiveTheme(newTheme)
    }, [theme, getTerminalTheme])

    // 시스템 테마 변경 감지
    useEffect(() => {
      if (theme !== 'system') return

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => {
        if (!xtermRef.current) return
        const newTheme = getTerminalTheme('system')
        xtermRef.current.options.theme = newTheme
        setActiveTheme(newTheme)
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }, [theme, getTerminalTheme])

    // xterm 인스턴스 초기화 (마운트 시 한 번만)
    useEffect(() => {
      if (!terminalRef.current) return

      // 초기 테마
      const initialTheme = getTerminalTheme(theme)
      setActiveTheme(initialTheme)

      // Terminal 인스턴스 생성
      // cols/rows는 fitAddon이 컨테이너에 맞춰 자동 계산하므로 지정하지 않음
      const term = new XTerm({
        cursorBlink: true,
        cursorStyle: 'block',
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        fontSize: 14,
        convertEol: true, // 개행 문자 자동 변환
        theme: initialTheme, // 초기 테마 적용
        scrollback: 1000,
      })

      // Addons 추가
      const fitAddon = new FitAddon()
      const webLinksAddon = new WebLinksAddon()

      term.loadAddon(fitAddon)
      term.loadAddon(webLinksAddon)

      // DOM에 마운트
      term.open(terminalRef.current)

      // 사용자 입력 처리 - SSH 연결이 완료된 경우에만 입력 전송
      term.onData((data) => {
        if (isConnectedRef.current) {
          onDataRef.current(data)
        }
      })

      // 크기 맞추기 - DOM 렌더링 완료 후 실행
      requestAnimationFrame(() => {
        try {
          fitAddon.fit()
          // 리사이즈 후 서버에 새로운 크기 전송
          if (onResizeRef.current && term.cols && term.rows) {
            onResizeRef.current(term.cols, term.rows)
          }
        } catch (error) {
          console.error('Failed to fit terminal:', error)
        }
      })

      // refs에 저장
      xtermRef.current = term
      fitAddonRef.current = fitAddon

      // 저장된 터미널 히스토리 복원 (sessionId가 있는 경우)
      if (sessionId && terminalHistory[sessionId]) {
        const history = terminalHistory[sessionId]
        history.forEach((output) => {
          term.write(output)
        })
      }

      // Window resize 처리
      const handleResize = () => {
        try {
          fitAddon.fit()
          // 리사이즈 후 서버에 새로운 크기 전송
          if (onResizeRef.current && term.cols && term.rows) {
            onResizeRef.current(term.cols, term.rows)
          }
        } catch (error) {
          console.error('Failed to fit terminal on resize:', error)
        }
      }
      window.addEventListener('resize', handleResize)

      // ResizeObserver로 컨테이너 크기 변경 감지
      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          try {
            fitAddon.fit()
            if (onResizeRef.current && term.cols && term.rows) {
              onResizeRef.current(term.cols, term.rows)
            }
          } catch (error) {
            console.error('Failed to fit terminal on container resize:', error)
          }
        })
      })

      if (terminalRef.current) {
        resizeObserver.observe(terminalRef.current)
      }

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize)
        resizeObserver.disconnect()
        term.dispose()
        xtermRef.current = null
        fitAddonRef.current = null
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]) // sessionId 변경 시 터미널 재생성 및 히스토리 복원

    // 전체화면 상태 변경 시 터미널 크기 조정
    useEffect(() => {
      if (!fitAddonRef.current || !xtermRef.current) return

      // 전체화면 전환 시 DOM 렌더링 완료 후 크기 조정
      const timer = setTimeout(() => {
        requestAnimationFrame(() => {
          try {
            fitAddonRef.current?.fit()
            // 리사이즈 후 서버에 새로운 크기 전송
            const term = xtermRef.current
            if (onResizeRef.current && term?.cols && term?.rows) {
              onResizeRef.current(term.cols, term.rows)
            }
          } catch (error) {
            console.error('Failed to fit terminal on fullscreen change:', error)
          }
        })
      }, 100)

      return () => clearTimeout(timer)
    }, [isFullscreen])

    // SSH 연결 완료 시 터미널 크기를 서버에 전송
    // PTY가 올바른 크기로 설정되도록 보장
    useEffect(() => {
      if (!isConnected || !xtermRef.current || !fitAddonRef.current) return

      // 연결 완료 후 약간의 지연을 두고 크기 전송
      const timer = setTimeout(() => {
        try {
          // 먼저 fit을 수행하여 최신 크기 계산
          fitAddonRef.current?.fit()
          const term = xtermRef.current
          if (onResizeRef.current && term?.cols && term?.rows) {
            console.log(`Sending initial resize: ${term.cols}x${term.rows}`)
            onResizeRef.current(term.cols, term.rows)
          }
        } catch (error) {
          console.error('Failed to send initial resize:', error)
        }
      }, 200)

      return () => clearTimeout(timer)
    }, [isConnected])

    // 터미널 높이 계산: 100vh - (NavigationBar 4rem + main py 3rem + Breadcrumb/PageHeader/spacing 약 9rem)
    const terminalHeight = 'calc(100vh - 18.5rem)'

    // 연결되지 않은 경우
    if (!sessionId) {
      return (
        <div
          className="flex items-center justify-center rounded-lg border border-dashed bg-card cursor-pointer hover:bg-accent/40 transition-colors"
          style={{ height: terminalHeight }}
          onClick={onConnect}
        >
          <div className="text-center text-muted-foreground">
            <TerminalIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>클릭하여 원격 서버에 연결하세요.</p>
          </div>
        </div>
      )
    }

    return (
      <div
        ref={containerRef}
        className="flex flex-col rounded-lg border overflow-hidden"
        style={{
          height: isFullscreen ? '100vh' : terminalHeight,
          backgroundColor: activeTheme.background,
          borderColor: activeTheme.selectionBackground || activeTheme.brightBlack,
        }}
      >
        {/* 터미널 헤더 */}
        <div
          className="flex items-center justify-between px-4 py-2.5 border-b"
          style={{
            backgroundColor: activeTheme.background,
            borderColor: activeTheme.selectionBackground || activeTheme.brightBlack,
          }}
        >
          <div className="flex items-center gap-2">
            <TerminalIcon
              className="h-3.5 w-3.5"
              style={{ color: activeTheme.foreground }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: activeTheme.foreground }}
            >
              {username}@{host}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Header Actions Injection */}
            {headerActions}

            {isConnected && (
              <div
                className="flex items-center gap-1.5 text-xs"
                style={{ color: activeTheme.green || activeTheme.brightGreen }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: activeTheme.green || activeTheme.brightGreen }}
                />
                <span>연결됨</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:opacity-80 transition-opacity"
              onClick={toggleFullscreen}
              title={isFullscreen ? '전체화면 종료' : '전체화면'}
              style={{ color: activeTheme.foreground }}
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
        <div
          className="flex-1 overflow-hidden min-h-0 cursor-text"
          onMouseDown={() => {
            // 터미널 영역 클릭 시 즉시 포커스
            // onMouseDown은 브라우저가 포커스를 받기 전에도 발생
            xtermRef.current?.focus()
          }}
        >
          <div ref={terminalRef} className="h-full w-full" />
        </div>
      </div>
    )
  }
)
