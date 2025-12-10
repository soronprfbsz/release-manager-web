/**
 * Fullscreen Hook
 * 요소를 전체화면으로 전환하는 재사용 가능한 훅
 */

import { useCallback, useEffect, useState, type RefObject } from 'react'

export interface UseFullscreenReturn {
  isFullscreen: boolean
  toggleFullscreen: () => void
  enterFullscreen: () => void
  exitFullscreen: () => void
}

/**
 * 전체화면 토글 훅
 *
 * @param elementRef 전체화면으로 전환할 요소의 ref
 * @returns 전체화면 상태와 제어 함수들
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null)
 * const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef)
 *
 * return (
 *   <div ref={containerRef}>
 *     <button onClick={toggleFullscreen}>
 *       {isFullscreen ? <Minimize2 /> : <Maximize2 />}
 *     </button>
 *   </div>
 * )
 * ```
 */
export function useFullscreen(elementRef: RefObject<HTMLElement>): UseFullscreenReturn {
  const [isFullscreen, setIsFullscreen] = useState(false)

  // 전체화면 진입
  const enterFullscreen = useCallback(async () => {
    if (!elementRef.current) return

    try {
      await elementRef.current.requestFullscreen()
    } catch (error) {
      console.error('Failed to enter fullscreen:', error)
    }
  }, [elementRef])

  // 전체화면 종료
  const exitFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) return

    try {
      await document.exitFullscreen()
    } catch (error) {
      console.error('Failed to exit fullscreen:', error)
    }
  }, [])

  // 전체화면 토글
  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen])

  // 전체화면 상태 변경 감지
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === elementRef.current)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [elementRef])

  // ESC 키로 전체화면 종료 시 상태 동기화
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen])

  return {
    isFullscreen,
    toggleFullscreen,
    enterFullscreen,
    exitFullscreen,
  }
}
