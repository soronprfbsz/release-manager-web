/**
 * Docx Viewer Component
 * Word 문서(.docx) 파일을 표시하는 뷰어 컴포넌트
 */

import { useState, useEffect } from 'react'

import mammoth from 'mammoth'
import { Loader2, Info } from 'lucide-react'

import { ScrollArea, ScrollBar } from '@/shared/ui/scroll-area'
import { TypographyMuted } from '@/shared/ui/typography'

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

interface DocxViewerProps {
  /** Docx 파일 Blob 데이터 */
  file: Blob | null
  /** 로딩 상태 */
  isLoading?: boolean
  /** 에러 */
  error?: Error | null
}

export function DocxViewer({ file, isLoading = false, error = null }: DocxViewerProps) {
  const [htmlContent, setHtmlContent] = useState<string | null>(null)
  const [parseError, setParseError] = useState<Error | null>(null)
  const [isParsing, setIsParsing] = useState(false)

  // Docx 파일 파싱
  useEffect(() => {
    if (!file) {
      setHtmlContent(null)
      return
    }

    const parseDocx = async () => {
      setIsParsing(true)
      setParseError(null)

      try {
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.convertToHtml({ arrayBuffer })
        setHtmlContent(result.value)

        // 경고 메시지가 있으면 콘솔에 출력
        if (result.messages.length > 0) {
          console.warn('Mammoth warnings:', result.messages)
        }
      } catch (err) {
        console.error('Failed to parse DOCX:', err)
        setParseError(err instanceof Error ? err : new Error('Word 문서 파싱 실패'))
      } finally {
        setIsParsing(false)
      }
    }

    parseDocx()
  }, [file])

  if (isLoading || isParsing) {
    return (
      <div className="flex items-center justify-center p-8 gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-muted-foreground">Word 문서 로딩 중...</span>
      </div>
    )
  }

  if (error || parseError) {
    const displayError = error || parseError
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
            <div>Word 문서를 불러오는데 실패했습니다.</div>
            {displayError?.message && (
              <div className="text-sm mt-2 text-muted-foreground">{displayError.message}</div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (!file || !htmlContent) {
    return (
      <div className="flex items-center justify-center p-8">
        <TypographyMuted>Word 문서가 없거나 내용이 비어있습니다.</TypographyMuted>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div
        className="p-6 prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
