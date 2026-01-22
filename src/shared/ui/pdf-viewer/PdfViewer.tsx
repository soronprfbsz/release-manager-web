/**
 * PDF Viewer Component
 * PDF 파일을 표시하는 뷰어 컴포넌트
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'

import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, Info } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { TypographyMuted } from '@/shared/ui/typography'

// PDF.js 워커 설정
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

/** 파일 크기 제한 에러인지 확인 */
function isFileSizeLimitError(error: Error | null | undefined): boolean {
  if (!error) return false
  const message = error.message || ''
  return message.includes('파일 크기가 너무 큽니다') || message.includes('최대 10MB')
}

/** 파일 크기 포맷팅 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/** 에러 메시지에서 파일 크기 정보 추출 */
function parseFileSizeFromError(error: Error | null | undefined): { currentSize: string; maxSize: string } | null {
  if (!error) return null
  const message = error.message || ''

  // "(최대 10MB): 485622000 bytes" 형식에서 추출
  const maxMatch = message.match(/최대\s*(\d+(?:\.\d+)?)\s*(MB|KB|GB)/i)
  const bytesMatch = message.match(/:\s*(\d+)\s*bytes/i)

  if (!maxMatch || !bytesMatch) return null

  const maxSize = `${maxMatch[1]}${maxMatch[2]}`
  const currentBytes = parseInt(bytesMatch[1], 10)
  const currentSize = formatFileSize(currentBytes)

  return { currentSize, maxSize }
}

interface PdfViewerProps {
  /** PDF 파일 URL 또는 Blob/ArrayBuffer */
  file: string | Blob | ArrayBuffer | null
  /** 로딩 상태 */
  isLoading?: boolean
  /** 에러 */
  error?: Error | null
}

export function PdfViewer({ file, isLoading = false, error = null }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [pdfError, setPdfError] = useState<Error | null>(null)
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(null)
  const [pageSize, setPageSize] = useState<{ width: number; height: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // 이전 크기를 저장하여 불필요한 업데이트 방지
  const lastContainerSizeRef = useRef<{ width: number; height: number } | null>(null)
  // ResizeObserver 콜백 디바운싱
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 컨테이너 크기 측정 (디바운싱 + threshold 적용)
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        // 스크롤바 공간을 고려한 고정 여백 (스크롤바 유무와 상관없이 일정한 크기)
        const width = containerRef.current.clientWidth - 32 // 패딩 + 스크롤바 공간
        const height = containerRef.current.clientHeight - 32
        
        // 이전 크기와 비교하여 10px 이상 차이가 날 때만 업데이트 (진동 방지)
        const lastSize = lastContainerSizeRef.current
        const threshold = 10
        
        if (
          width > 0 && height > 0 &&
          (!lastSize || 
           Math.abs(lastSize.width - width) > threshold || 
           Math.abs(lastSize.height - height) > threshold)
        ) {
          lastContainerSizeRef.current = { width, height }
          setContainerSize({ width, height })
        }
      }
    }

    // 초기 측정을 약간 지연시켜 레이아웃이 완료된 후 측정
    const timeoutId = setTimeout(updateSize, 100)

    // ResizeObserver로 컨테이너 크기 변경 감지 (디바운싱 적용)
    const resizeObserver = new ResizeObserver(() => {
      // 이전 디바운스 타이머 취소
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
      // 150ms 디바운싱으로 연속 호출 방지
      resizeTimeoutRef.current = setTimeout(updateSize, 150)
    })
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      clearTimeout(timeoutId)
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
      resizeObserver.disconnect()
    }
  }, [file])

  // 컨테이너에 맞는 PDF 크기 계산 (스크롤 없이 딱 맞게)
  const fittedWidth = useMemo(() => {
    if (!containerSize || !pageSize) return undefined

    // PDF 페이지의 원본 비율
    const pageAspectRatio = pageSize.width / pageSize.height
    // 컨테이너의 비율
    const containerAspectRatio = containerSize.width / containerSize.height

    let fitWidth: number

    if (pageAspectRatio > containerAspectRatio) {
      // 페이지가 더 넓음 → 너비에 맞춤
      fitWidth = containerSize.width
    } else {
      // 페이지가 더 높음 → 높이에 맞춰서 너비 계산
      fitWidth = containerSize.height * pageAspectRatio
    }

    // 정수로 반올림하여 서브픽셀 렌더링 문제 방지
    return Math.floor(fitWidth * scale)
  }, [containerSize, pageSize, scale])

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setPageNumber(1)
    setPdfError(null)
  }, [])

  // 페이지 로드 성공 시 페이지 크기 저장
  const onPageLoadSuccess = useCallback((page: { width: number; height: number }) => {
    setPageSize({ width: page.width, height: page.height })
  }, [])

  const onDocumentLoadError = useCallback((error: Error) => {
    setPdfError(error)
  }, [])

  const goToPreviousPage = useCallback(() => {
    setPageNumber((prev) => Math.max(prev - 1, 1))
  }, [])

  const goToNextPage = useCallback(() => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1))
  }, [numPages])

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.25, 3.0))
  }, [])

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.25, 0.5))
  }, [])

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 다른 입력 요소에 포커스가 있으면 무시
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          goToPreviousPage()
          break
        case 'ArrowRight':
          event.preventDefault()
          goToNextPage()
          break
        case '+':
        case '=':
          event.preventDefault()
          zoomIn()
          break
        case '-':
          event.preventDefault()
          zoomOut()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [goToPreviousPage, goToNextPage, zoomIn, zoomOut])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-muted-foreground">PDF 로딩 중...</span>
      </div>
    )
  }

  if (error || pdfError) {
    const displayError = error || pdfError
    const sizeInfo = parseFileSizeFromError(displayError)
    return (
      <div className="flex items-center justify-center p-8">
        {isFileSizeLimitError(displayError) ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-3 rounded-full bg-muted">
              <Info className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                파일 크기가 커서 미리보기가 제한됩니다
              </p>
              {sizeInfo && (
                <p className="text-sm text-muted-foreground mt-1">
                  현재 파일: {sizeInfo.currentSize} / 최대: {sizeInfo.maxSize}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                파일을 다운로드하여 내용을 확인해주세요.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-destructive text-center">
            <div>PDF를 불러오는데 실패했습니다.</div>
            {displayError?.message && (
              <div className="text-sm mt-2 text-muted-foreground">{displayError.message}</div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (!file) {
    return (
      <div className="flex items-center justify-center p-8">
        <TypographyMuted>PDF 파일이 없습니다.</TypographyMuted>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* 컨트롤 바 */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/30">
        {/* 페이지 네비게이션 */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={goToPreviousPage}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft />
          </Button>
          <span className="text-sm min-w-[80px] text-center">
            {pageNumber} / {numPages || '-'}
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={goToNextPage}
            disabled={pageNumber >= (numPages || 1)}
          >
            <ChevronRight />
          </Button>
        </div>

        {/* 키보드 단축키 안내 */}
        <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px] font-mono">←</kbd>
            <kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px] font-mono">→</kbd>
            <span className="ml-0.5">페이지 이동</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px] font-mono">+</kbd>
            <kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px] font-mono">-</kbd>
            <span className="ml-0.5">확대/축소</span>
          </span>
        </div>

        {/* 줌 컨트롤 */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={zoomOut}
            disabled={scale <= 0.5}
          >
            <ZoomOut />
          </Button>
          <span className="text-sm min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={zoomIn}
            disabled={scale >= 3.0}
          >
            <ZoomIn />
          </Button>
        </div>
      </div>

      {/* PDF 문서 */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-2 bg-muted/20"
      >
        {/* 100% 이하일 때는 중앙 정렬, 확대 시에는 왼쪽 상단부터 스크롤 */}
        <div className={`min-w-max min-h-max ${scale <= 1 ? 'flex justify-center items-center h-full' : ''}`}>
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center p-8 gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground">PDF 로딩 중...</span>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              width={fittedWidth}
              onLoadSuccess={onPageLoadSuccess}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="shadow-lg"
            />
          </Document>
        </div>
      </div>
    </div>
  )
}

