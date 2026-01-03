/**
 * PDF Viewer Component
 * PDF 파일을 표시하는 뷰어 컴포넌트
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'

import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { TypographyMuted } from '@/shared/ui/typography'

// PDF.js 워커 설정
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

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

  // 컨테이너 크기 측정
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth - 16 // 패딩 고려
        const height = containerRef.current.clientHeight - 16
        setContainerSize(width > 0 && height > 0 ? { width, height } : null)
      }
    }

    // 초기 측정을 약간 지연시켜 레이아웃이 완료된 후 측정
    const timeoutId = setTimeout(updateSize, 100)

    // ResizeObserver로 컨테이너 크기 변경 감지
    const resizeObserver = new ResizeObserver(updateSize)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      clearTimeout(timeoutId)
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

    return fitWidth * scale
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

  const goToPreviousPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1))
  }

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3.0))
  }

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5))
  }

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
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-destructive text-center">
          <div>PDF를 불러오는데 실패했습니다.</div>
          {displayError?.message && (
            <div className="text-sm mt-2 text-muted-foreground">{displayError.message}</div>
          )}
        </div>
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
            size="icon"
            onClick={goToPreviousPage}
            disabled={pageNumber <= 1}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm min-w-[80px] text-center">
            {pageNumber} / {numPages || '-'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextPage}
            disabled={pageNumber >= (numPages || 1)}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* 줌 컨트롤 */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="h-8 w-8"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomIn}
            disabled={scale >= 3.0}
            className="h-8 w-8"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF 문서 */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto flex justify-center p-2 bg-muted/20"
      >
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
  )
}

