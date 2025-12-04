import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Clipboard, ClipboardCheck, Loader2 } from 'lucide-react'
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

interface FileContentViewerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileName: string
  content: string | null
  isLoading?: boolean
  error?: Error | null
  description?: string
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

export function FileContentViewerModal({
  open,
  onOpenChange,
  fileName,
  content,
  isLoading = false,
  error = null,
  description = '파일 내용',
}: FileContentViewerModalProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const language = getLanguageFromFileName(fileName)

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
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            disabled={!content || isLoading}
            className="absolute -top-10 right-0 h-8 w-8 z-10"
            title={copied ? '복사됨' : '클립보드에 복사'}
          >
            {copied ? (
              <ClipboardCheck className="h-4 w-4" />
            ) : (
              <Clipboard className="h-4 w-4" />
            )}
          </Button>

          <ScrollArea className="h-[60vh] w-full rounded-md border">
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

              {content && !isLoading && !error && (
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
                  {content}
                </SyntaxHighlighter>
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
