import { useState } from 'react'

import { Folder, FolderOpen, File, ChevronRight, ChevronDown, Download } from 'lucide-react'

import {
  patchApi,
  usePatchFileStructure,
  usePatchFileContent,
  type PatchFileNode,
} from '@/entities/patch'

import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog'
import { FileContentViewerModal } from '@/shared/ui/file-content-viewer'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { TypographyMuted } from '@/shared/ui/typography'

interface PatchFileExplorerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patchId: number | null
  patchName: string
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

interface FileNodeProps {
  node: PatchFileNode
  level: number
  onFileClick: (node: PatchFileNode) => void
}

function FileNode({ node, level, onFileClick }: FileNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (node.type === 'directory') {
    // 폴더 우선, 파일 나중 정렬
    const sortedChildren = node.children ? [...node.children].sort((a, b) => {
      if (a.type === 'directory' && b.type === 'file') return -1
      if (a.type === 'file' && b.type === 'directory') return 1
      return a.name.localeCompare(b.name)
    }) : []

    return (
      <div>
        <div
          className="flex items-center gap-2 py-1.5 px-2 hover:bg-muted/50 rounded cursor-pointer"
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-blue-500" />
          ) : (
            <Folder className="h-4 w-4 text-blue-500" />
          )}
          <span className="text-sm font-medium">{node.name}</span>
        </div>
        {isExpanded && sortedChildren.length > 0 && (
          <div>
            {sortedChildren.map((child: PatchFileNode, index: number) => (
              <FileNode
                key={`${child.path}-${index}`}
                node={child}
                level={level + 1}
                onFileClick={onFileClick}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  const fileName = node.name.toLowerCase()
  const isViewableFile = fileName.endsWith('.sql') || fileName.endsWith('.sh') || fileName.endsWith('.md') ||
    fileName.endsWith('.txt') || fileName.endsWith('.log') || fileName.endsWith('.json') ||
    fileName.endsWith('.xml') || fileName.endsWith('.yml') || fileName.endsWith('.yaml') ||
    fileName.endsWith('.ini') || fileName.endsWith('.conf') || fileName.endsWith('.properties') ||
    fileName.endsWith('.bat') || fileName.endsWith('.ps1') || fileName.endsWith('.env')

  return (
    <div
      className={`flex items-center justify-between gap-2 py-1.5 px-2 hover:bg-muted/50 rounded ${
        isViewableFile ? 'cursor-pointer' : ''
      }`}
      style={{ paddingLeft: `${level * 16 + 24}px` }}
      onClick={() => isViewableFile && onFileClick(node)}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className={`text-sm truncate ${isViewableFile ? 'hover:text-primary transition-colors' : ''}`}>
          {node.name}
        </span>
      </div>
      {node.size !== undefined && (
        <TypographyMuted className="text-xs flex-shrink-0">
          {formatFileSize(node.size)}
        </TypographyMuted>
      )}
    </div>
  )
}

export function PatchFileExplorer({ open, onOpenChange, patchId, patchName }: PatchFileExplorerProps) {
  const [fileViewerOpen, setFileViewerOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<{ path: string; name: string; size?: number } | null>(null)

  const { data: fileStructure, isLoading, error } = usePatchFileStructure(
    patchId ?? 0,
    open && patchId !== null
  )

  // 파일 내용 조회
  const { data: fileContentData, isLoading: isLoadingContent, error: contentError } = usePatchFileContent(
    patchId ?? 0,
    selectedFile?.path ?? '',
    fileViewerOpen && patchId !== null && selectedFile !== null
  )

  const handleDownload = () => {
    if (!patchId) return
    const fileName = `${patchName}.zip`
    patchApi.download(patchId, fileName)
  }

  const handleFileClick = (node: PatchFileNode) => {
    setSelectedFile({ path: node.path, name: node.name, size: node.size })
    setFileViewerOpen(true)
  }

  const handleDownloadFile = () => {
    if (!patchId || !selectedFile) return
    // 개별 파일 다운로드는 전체 패치 다운로드로 대체
    const fileName = `${patchName}.zip`
    patchApi.download(patchId, fileName)
  }

  const hasContent = fileStructure?.root?.children && fileStructure.root.children.length > 0

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{patchName}</DialogTitle>
            <DialogDescription>패치 파일 구조</DialogDescription>
            {/* X 버튼 왼쪽에 배치되는 다운로드 버튼 */}
            <div className="absolute top-0 right-10 flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                disabled={!patchId}
                className="h-8 w-8"
                title="전체 다운로드"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="relative">
            <ScrollArea className="h-[65vh] w-full rounded-md border">
              {isLoading && (
                <div className="flex items-center justify-center p-8">
                  <div className="text-muted-foreground">로딩 중...</div>
                </div>
              )}

              {error && (
                <div className="flex items-center justify-center p-8">
                  <div className="text-destructive">
                    파일 구조를 불러오는데 실패했습니다.
                    {error instanceof Error && <div className="text-sm mt-2">{error.message}</div>}
                  </div>
                </div>
              )}

              {fileStructure && !isLoading && !error && (
                <div className="p-2">
                  {!hasContent ? (
                    <div className="flex items-center justify-center p-8 text-muted-foreground">
                      파일이 없습니다.
                    </div>
                  ) : (
                    <div>
                      {[...fileStructure.root.children!].sort((a, b) => {
                        if (a.type === 'directory' && b.type === 'file') return -1
                        if (a.type === 'file' && b.type === 'directory') return 1
                        return a.name.localeCompare(b.name)
                      }).map((node, index) => (
                        <FileNode
                          key={`${node.path}-${index}`}
                          node={node}
                          level={0}
                          onFileClick={handleFileClick}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <FileContentViewerModal
        open={fileViewerOpen}
        onOpenChange={setFileViewerOpen}
        fileName={selectedFile?.name || ''}
        content={fileContentData?.content || null}
        isLoading={isLoadingContent}
        error={contentError as Error | null}
        description="파일 내용"
        fileSize={selectedFile?.size}
        onDownload={handleDownloadFile}
      />
    </>
  )
}
