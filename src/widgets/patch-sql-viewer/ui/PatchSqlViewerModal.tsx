import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Clipboard, ClipboardCheck } from 'lucide-react'
import { patchApi } from '@/entities/patch'
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

interface PatchSqlViewerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patchId: number | null
  filePath: string | null
  fileName: string
}

function getLanguageFromFileName(fileName: string): string {
  const extension = fileName.toLowerCase().split('.').pop()
  switch (extension) {
    case 'sql':
      return 'sql'
    case 'sh':
      return 'bash'
    case 'md':
      return 'markdown'
    default:
      return 'text'
  }
}

export function PatchSqlViewerModal({
  open,
  onOpenChange,
  patchId,
  filePath,
  fileName
}: PatchSqlViewerModalProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const language = getLanguageFromFileName(fileName)

  const { data: fileContent, isLoading, error } = useQuery({
    queryKey: ['patchFileContent', patchId, filePath],
    queryFn: () => patchApi.getFileContent(patchId!, filePath!),
    enabled: open && patchId !== null && filePath !== null,
    retry: 1,
  })

  const handleCopy = async () => {
    if (!fileContent?.content) return

    try {
      await navigator.clipboard.writeText(fileContent.content)
      setCopied(true)
      toast({
        title: '복사 완료',
        description: '파일 내용이 클립보드에 복사되었습니다.',
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
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
          <DialogTitle>{fileName}</DialogTitle>
          <DialogDescription>파일 내용</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            disabled={!fileContent?.content || isLoading}
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
                <div className="flex items-center justify-center p-8">
                  <div className="text-muted-foreground">로딩 중...</div>
                </div>
              )}

              {error && (
                <div className="flex items-center justify-center p-8">
                  <div className="text-destructive">
                    파일을 불러오는데 실패했습니다.
                    {error instanceof Error && <div className="text-sm mt-2">{error.message}</div>}
                  </div>
                </div>
              )}

              {fileContent?.content && !isLoading && !error && (
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
                  {fileContent.content}
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
