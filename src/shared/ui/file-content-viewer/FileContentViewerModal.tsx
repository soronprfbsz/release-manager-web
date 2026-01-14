import { useMemo, useRef } from 'react'

import { Loader2, AlertTriangle, Download, Maximize2, Minimize2, X } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'

import { useFullscreen } from '@/shared/lib/hooks/use-fullscreen'
import { useThemeStore } from '@/shared/store'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogClose,
} from '@/shared/ui/dialog'
import { PdfViewer } from '@/shared/ui/pdf-viewer'
import { ScrollArea, ScrollBar } from '@/shared/ui/scroll-area'

// 미리보기 제한 설정
const PREVIEW_SIZE_LIMIT = 500 * 1024 // 500KB - 미리보기 최대 크기
const PREVIEW_LINES_LIMIT = 2000 // 미리보기 최대 라인 수 (이 이상이면 잘라서 표시)
const PREVIEW_LINES_DISPLAY = 500 // 잘릴 때 표시할 라인 수

interface FileContentViewerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileName: string
  content: string | null
  isLoading?: boolean
  error?: Error | null
  description?: string
  fileSize?: number
  onDownload?: () => void
  /** PDF 파일용 Blob 데이터 */
  pdfBlob?: Blob | null
  /** PDF 로딩 상태 */
  isPdfLoading?: boolean
  /** PDF 에러 */
  pdfError?: Error | null
  /** 이미지 파일용 Blob 데이터 */
  imageBlob?: Blob | null
  /** 이미지 로딩 상태 */
  isImageLoading?: boolean
  /** 이미지 에러 */
  imageError?: Error | null
}

/**
 * 파일이 PDF인지 확인
 */
function isPdfFile(fileName: string): boolean {
  return fileName.toLowerCase().endsWith('.pdf')
}

/**
 * 파일이 이미지인지 확인
 */
/**
 * 파일이 이미지인지 확인
 * SVG는 XML 기반 텍스트 파일이므로 제외 (코드 뷰어로 표시)
 */
function isImageFile(fileName: string): boolean {
  const extension = fileName.toLowerCase().split('.').pop()
  return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico'].includes(extension || '')
}

function getLanguageFromFileName(fileName: string): string {
  const extension = fileName.toLowerCase().split('.').pop()
  switch (extension) {
    // Web
    case 'html':
    case 'htm':
      return 'html'
    case 'css':
      return 'css'
    case 'scss':
      return 'scss'
    case 'less':
      return 'less'
    case 'js':
    case 'jsx':
      return 'javascript'
    case 'ts':
    case 'tsx':
      return 'typescript'
    // Data
    case 'json':
      return 'json'
    case 'xml':
    case 'svg':
      return 'xml'
    case 'yml':
    case 'yaml':
      return 'yaml'
    // Database
    case 'sql':
      return 'sql'
    // Shell/Scripts
    case 'sh':
    case 'bash':
      return 'bash'
    case 'bat':
    case 'cmd':
      return 'batch'
    case 'ps1':
      return 'powershell'
    // Programming
    case 'py':
      return 'python'
    case 'java':
      return 'java'
    case 'c':
      return 'c'
    case 'cpp':
    case 'cc':
    case 'cxx':
      return 'cpp'
    case 'cs':
      return 'csharp'
    case 'go':
      return 'go'
    case 'rs':
      return 'rust'
    case 'rb':
      return 'ruby'
    case 'php':
      return 'php'
    // Markup/Config
    case 'md':
    case 'markdown':
      return 'markdown'
    case 'ini':
    case 'conf':
    case 'properties':
      return 'ini'
    default:
      return 'text'
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function FileContentViewerModal({
  open,
  onOpenChange,
  fileName,
  content,
  isLoading = false,
  error = null,
  description = '파일 내용',
  fileSize,
  onDownload,
  pdfBlob = null,
  isPdfLoading = false,
  pdfError = null,
  imageBlob = null,
  isImageLoading = false,
  imageError = null,
}: FileContentViewerModalProps) {
  const language = getLanguageFromFileName(fileName)
  const containerRef = useRef<HTMLDivElement>(null)
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef)
  const theme = useThemeStore((state) => state.theme)
  const isPdf = isPdfFile(fileName)
  const isImage = isImageFile(fileName)

  // 이미지 URL 생성
  const imageUrl = useMemo(() => {
    if (imageBlob) {
      return URL.createObjectURL(imageBlob)
    }
    return null
  }, [imageBlob])

  // 테마에 따른 syntax highlighter 스타일 선택
  const syntaxStyle = theme === 'white' ? vs : vscDarkPlus

  // 콘텐츠 크기 계산 및 미리보기 처리
  const { displayContent, isTruncated, totalLines, displayedLines, contentSize, truncateReason } = useMemo(() => {
    if (!content) {
      return {
        displayContent: null,
        isTruncated: false,
        totalLines: 0,
        displayedLines: 0,
        contentSize: 0,
        truncateReason: null as 'size' | 'lines' | null,
      }
    }

    const size = new Blob([content]).size
    const lines = content.split('\n')
    const totalLineCount = lines.length

    // 크기 제한 또는 라인 수 제한 체크
    const exceedsSize = size > PREVIEW_SIZE_LIMIT
    const exceedsLines = totalLineCount > PREVIEW_LINES_LIMIT

    // 제한에 걸리지 않으면 전체 표시
    if (!exceedsSize && !exceedsLines) {
      return {
        displayContent: content,
        isTruncated: false,
        totalLines: totalLineCount,
        displayedLines: totalLineCount,
        contentSize: size,
        truncateReason: null,
      }
    }

    // 제한 초과 시 처음 500줄만 표시
    const previewLines = lines.slice(0, PREVIEW_LINES_DISPLAY)
    const previewContent = previewLines.join('\n')

    return {
      displayContent: previewContent,
      isTruncated: true,
      totalLines: totalLineCount,
      displayedLines: Math.min(PREVIEW_LINES_DISPLAY, totalLineCount),
      contentSize: size,
      truncateReason: exceedsSize ? 'size' : 'lines',
    }
  }, [content])

  // 모니터 크기에 비례한 통일된 모달 사이즈
  const modalSizeClass = isFullscreen
    ? 'w-screen h-screen max-w-none max-h-none flex flex-col gap-4'
    : 'w-[60vw] max-w-none max-h-[90vh] flex flex-col gap-4'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={containerRef}
        hideClose
        className={modalSizeClass}
      >
        {/* 커스텀 헤더 */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1.5">
            <h2 className="font-mono text-base font-semibold leading-none tracking-tight">
              {fileName}
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{description}</span>
              {contentSize > 0 && (
                <span className="text-xs bg-muted px-2 py-0.5 rounded">
                  {formatFileSize(fileSize || contentSize)}
                </span>
              )}
              {totalLines > 0 && (
                <span className="text-xs bg-muted px-2 py-0.5 rounded">
                  {totalLines.toLocaleString()} lines
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onDownload && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDownload}
                className="h-8 w-8"
                title="파일 다운로드"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="h-8 w-8"
              title={isFullscreen ? '전체화면 종료' : '전체화면'}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="닫기"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </div>

        {/* 큰 파일 경고 (텍스트 파일만) */}
        {!isPdf && !isImage && isTruncated && (
          <div className="flex items-center gap-2 p-3 bg-accent/40 border border-accent rounded-lg text-sm">
            <AlertTriangle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-foreground">
              {truncateReason === 'size'
                ? `파일이 큽니다 (${formatFileSize(contentSize)}). `
                : `라인 수가 많습니다 (${totalLines.toLocaleString()}줄). `
              }
              처음 {PREVIEW_LINES_DISPLAY}줄만 표시됩니다. 전체 내용은 다운로드하여 확인하세요.
            </span>
          </div>
        )}

        <div className="relative flex-1 min-h-0">
          {/* PDF 뷰어 */}
          {isPdf && (
            <div className={`w-full rounded-md border overflow-hidden ${isFullscreen ? 'h-[calc(100vh-7rem)]' : 'h-[70vh]'}`}>
              <PdfViewer
                file={pdfBlob}
                isLoading={isPdfLoading}
                error={pdfError}
              />
            </div>
          )}

          {/* 이미지 뷰어 */}
          {isImage && (
            <div className={`w-full rounded-md border overflow-hidden bg-muted/30 flex items-center justify-center ${isFullscreen ? 'h-[calc(100vh-7rem)]' : 'h-[70vh]'}`}>
              {isImageLoading && (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-muted-foreground">이미지 로딩 중...</span>
                </div>
              )}

              {imageError && (
                <div className="text-destructive text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                  <div>이미지를 불러오는데 실패했습니다.</div>
                  {imageError.message && (
                    <div className="text-sm mt-2 text-muted-foreground">{imageError.message}</div>
                  )}
                </div>
              )}

              {imageUrl && !isImageLoading && !imageError && (
                <img
                  src={imageUrl}
                  alt={fileName}
                  className="max-w-full max-h-full object-contain"
                  style={{ imageRendering: 'auto' }}
                />
              )}
            </div>
          )}

          {/* 텍스트 파일 뷰어 */}
          {!isPdf && !isImage && (
            <>
              <ScrollArea className={`w-full rounded-md ${isFullscreen ? 'h-[calc(100vh-7rem)]' : 'h-[70vh]'}`}>
                <div className="min-w-max">
                  {isLoading && (
                    <div className="flex items-center justify-center p-8 gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-muted-foreground">로딩 중...</span>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center justify-center p-8">
                      <div className="text-destructive text-center">
                        <div>파일을 불러오는데 실패했습니다.</div>
                        {error.message && (
                          <div className="text-sm mt-2 text-muted-foreground">{error.message}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {displayContent && !isLoading && !error && (
                    <SyntaxHighlighter
                      language={language}
                      style={syntaxStyle}
                      showLineNumbers
                      customStyle={{
                        margin: 0,
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        minHeight: '100%',
                      }}
                      wrapLongLines={false}
                    >
                      {displayContent}
                    </SyntaxHighlighter>
                  )}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>

              {/* 더 보기 안내 */}
              {isTruncated && (
                <div className="mt-3 text-center text-sm text-muted-foreground">
                  {displayedLines.toLocaleString()} / {totalLines.toLocaleString()} 줄 표시 중
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
