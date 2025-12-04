import { useState, useMemo } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Clipboard, ClipboardCheck, Loader2, AlertTriangle, Download } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog'
import { ScrollArea, ScrollBar } from '@/shared/ui/scroll-area'
import { Button } from '@/shared/ui/button'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { copyToClipboard } from '@/shared/lib/utils/clipboard'

// 미리보기 제한 설정
const PREVIEW_SIZE_LIMIT = 500 * 1024 // 500KB - 미리보기 최대 크기
const PREVIEW_LINES = 500 // 미리보기 시 표시할 최대 라인 수

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
}

function getLanguageFromFileName(fileName: string): string {
  const extension = fileName.toLowerCase().split('.').pop()
  switch (extension) {
    case 'sql':
      return 'sql'
    case 'sh':
    case 'bash':
      return 'bash'
    case 'md':
      return 'markdown'
    case 'json':
      return 'json'
    case 'xml':
      return 'xml'
    case 'yml':
    case 'yaml':
      return 'yaml'
    case 'js':
      return 'javascript'
    case 'ts':
      return 'typescript'
    case 'py':
      return 'python'
    case 'java':
      return 'java'
    case 'bat':
    case 'cmd':
      return 'batch'
    case 'ps1':
      return 'powershell'
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
}: FileContentViewerModalProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const language = getLanguageFromFileName(fileName)

  // 콘텐츠 크기 계산 및 미리보기 처리
  const { displayContent, isTruncated, totalLines, displayedLines, contentSize } = useMemo(() => {
    if (!content) {
      return {
        displayContent: null,
        isTruncated: false,
        totalLines: 0,
        displayedLines: 0,
        contentSize: 0,
      }
    }

    const size = new Blob([content]).size
    const lines = content.split('\n')
    const totalLineCount = lines.length

    // 500KB 이하면 전체 표시
    if (size <= PREVIEW_SIZE_LIMIT) {
      return {
        displayContent: content,
        isTruncated: false,
        totalLines: totalLineCount,
        displayedLines: totalLineCount,
        contentSize: size,
      }
    }

    // 500KB 초과 시 처음 500줄만 표시
    const previewLines = lines.slice(0, PREVIEW_LINES)
    const previewContent = previewLines.join('\n')

    return {
      displayContent: previewContent,
      isTruncated: true,
      totalLines: totalLineCount,
      displayedLines: Math.min(PREVIEW_LINES, totalLineCount),
      contentSize: size,
    }
  }, [content])

  const handleCopy = async () => {
    if (!content) return

    const success = await copyToClipboard(content)
    if (success) {
      setCopied(true)
      toast({
        title: '복사 완료',
        description: '파일 내용이 클립보드에 복사되었습니다.',
      })
      setTimeout(() => setCopied(false), 2000)
    } else {
      toast({
        title: '복사 실패',
        description: '클립보드 복사 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle className="font-mono text-base">{fileName}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {description}
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
          </DialogDescription>
          {/* X 버튼 왼쪽에 배치되는 액션 버튼 */}
          <div className="absolute top-0 right-10 flex items-center gap-1">
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
              onClick={handleCopy}
              disabled={!content || isLoading}
              className="h-8 w-8"
              title={copied ? '복사됨' : '클립보드에 복사'}
            >
              {copied ? (
                <ClipboardCheck className="h-4 w-4" />
              ) : (
                <Clipboard className="h-4 w-4" />
              )}
            </Button>
          </div>
        </DialogHeader>

        {/* 큰 파일 경고 */}
        {isTruncated && (
          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm">
            <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
            <span className="text-yellow-600 dark:text-yellow-500">
              파일이 큽니다 ({formatFileSize(contentSize)}). 처음 {PREVIEW_LINES}줄만 표시됩니다. 전체 내용은 다운로드하여 확인하세요.
            </span>
          </div>
        )}

        <div className="relative flex-1 min-h-0">

          <ScrollArea className="h-[55vh] w-full rounded-md border">
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
                  style={vscDarkPlus}
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
