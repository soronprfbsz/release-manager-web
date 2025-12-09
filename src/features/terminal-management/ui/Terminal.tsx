/**
 * Terminal Component
 * xterm.js 기반 웹 터미널 UI (로컬 에코 + 라인 버퍼링)
 *
 * 동작 방식:
 * - 로컬 에코: 사용자 입력을 로컬에서 즉시 화면에 표시
 * - 라인 버퍼링: Enter 키를 누를 때만 서버로 전송
 * - 서버 응답: 명령 실행 결과만 서버에서 받아 표시
 */

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'

import { useThemeStore } from '@/shared/store'

import { getTerminalTheme } from '../lib/terminalThemes'

interface TerminalProps {
  sessionId: string | null
  onInput: (data: string) => void
  className?: string
}

export interface TerminalHandle {
  write: (data: string) => void
  clear: () => void
  focus: () => void
}

export const Terminal = forwardRef<TerminalHandle, TerminalProps>(
  ({ sessionId, onInput, className = '' }, ref) => {
    const terminalRef = useRef<HTMLDivElement>(null)
    const xtermRef = useRef<XTerm | null>(null)
    const fitAddonRef = useRef<FitAddon | null>(null)
    const inputBufferRef = useRef<string>('')
    const appTheme = useThemeStore((state) => state.theme)

    // xterm.js 초기화
    useEffect(() => {
      if (!terminalRef.current || !sessionId) return

      const terminalTheme = getTerminalTheme(appTheme)

      // Terminal 인스턴스 생성
      const xterm = new XTerm({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Consolas, "Courier New", monospace',
        theme: terminalTheme,
        rows: 30,
        cols: 120,
        scrollback: 1000,
        convertEol: false,
      })

      // FitAddon 추가
      const fitAddon = new FitAddon()
      xterm.loadAddon(fitAddon)

      // DOM에 마운트
      xterm.open(terminalRef.current)

      // fit()은 DOM 렌더링 후 호출
      setTimeout(() => {
        try {
          fitAddon.fit()
          xterm.focus()
        } catch (error) {
          console.warn('[Terminal] Failed to fit terminal:', error)
        }
      }, 0)

      // 환영 메시지
      xterm.writeln('\x1b[1;34m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m')
      xterm.writeln('\x1b[1;36m   Release Manager Terminal\x1b[0m')
      xterm.writeln('\x1b[1;34m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m')
      xterm.writeln('\x1b[90m   서버 연결 중...\x1b[0m')
      xterm.writeln('')

      // 사용자 입력 처리 (로컬 에코 + 라인 버퍼링)
      xterm.onData((data) => {
        const code = data.charCodeAt(0)

        // Enter (Carriage Return)
        if (code === 13) {
          const command = inputBufferRef.current
          console.log('[Terminal] 📤 Sending command:', JSON.stringify(command))

          // 로컬 에코: 개행
          xterm.write('\r\n')

          // 서버로 전송
          onInput(command + '\r')

          // 버퍼 초기화
          inputBufferRef.current = ''
        }
        // Backspace / Delete
        else if (code === 127 || code === 8) {
          if (inputBufferRef.current.length > 0) {
            inputBufferRef.current = inputBufferRef.current.slice(0, -1)
            // 로컬 에코: 커서 왼쪽 이동 → 공백 → 커서 왼쪽 이동
            xterm.write('\b \b')
          }
        }
        // Ctrl+C
        else if (code === 3) {
          console.log('[Terminal] 🛑 Ctrl+C pressed')
          // 로컬 에코: ^C 표시 후 개행
          xterm.write('^C\r\n')
          // 서버로 SIGINT 전송
          onInput('\x03')
          // 버퍼 초기화
          inputBufferRef.current = ''
        }
        // Ctrl+D (EOF)
        else if (code === 4) {
          console.log('[Terminal] 📄 Ctrl+D pressed')
          if (inputBufferRef.current.length === 0) {
            onInput('\x04')
          }
        }
        // 일반 문자 (출력 가능한 문자)
        else if (code >= 32 && code <= 126) {
          inputBufferRef.current += data
          // 로컬 에코: 입력한 문자 즉시 표시
          xterm.write(data)
        }
        // 기타 제어 문자는 무시 (방향키 등)
      })

      // 리사이즈 처리
      const handleResize = () => {
        try {
          fitAddon.fit()
        } catch (error) {
          console.warn('[Terminal] Resize error:', error)
        }
      }
      window.addEventListener('resize', handleResize)

      xtermRef.current = xterm
      fitAddonRef.current = fitAddon

      return () => {
        window.removeEventListener('resize', handleResize)
        xterm.dispose()
        xtermRef.current = null
        fitAddonRef.current = null
        inputBufferRef.current = ''
      }
    }, [sessionId, onInput, appTheme])

    // 앱 테마 변경 시 터미널 테마도 업데이트
    useEffect(() => {
      if (xtermRef.current) {
        const terminalTheme = getTerminalTheme(appTheme)
        xtermRef.current.options.theme = terminalTheme
      }
    }, [appTheme])

    // 외부에서 호출할 수 있는 메서드 노출
    useImperativeHandle(ref, () => ({
      write: (data: string) => {
        if (xtermRef.current) {
          console.log('[Terminal] 📥 Server output:', JSON.stringify(data.substring(0, 100)))
          xtermRef.current.write(data)
        }
      },
      clear: () => {
        xtermRef.current?.clear()
        inputBufferRef.current = ''
      },
      focus: () => {
        xtermRef.current?.focus()
      },
    }))

    return (
      <div
        ref={terminalRef}
        className={`terminal-container ${className}`}
        style={{ height: '600px', width: '100%' }}
      />
    )
  }
)

Terminal.displayName = 'Terminal'
