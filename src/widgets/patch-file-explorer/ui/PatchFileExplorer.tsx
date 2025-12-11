import { useState } from 'react'

import { Folder, FolderOpen, File, ChevronRight, ChevronDown, Package } from 'lucide-react'

import {
  usePatchFileStructure,
  usePatchFileContent,
  type PatchFileNode,
} from '@/entities/patch'

import { FileContentViewerModal } from '@/shared/ui/file-content-viewer'
import { ScrollArea } from '@/shared/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/shared/ui/sheet'
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

  const handleFileClick = (node: PatchFileNode) => {
    setSelectedFile({ path: node.path, name: node.name, size: node.size })
    setFileViewerOpen(true)
  }

  const hasContent = fileStructure?.root?.children && fileStructure.root.children.length > 0

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[800px] sm:max-w-[800px] flex flex-col gap-4">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {patchName}
            </SheetTitle>
            <SheetDescription>패치 파일 구조를 확인합니다.</SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-8rem)] w-full">
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
              <div>
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
        </SheetContent>
      </Sheet>

      <FileContentViewerModal
        open={fileViewerOpen}
        onOpenChange={setFileViewerOpen}
        fileName={selectedFile?.name || ''}
        content={fileContentData?.content || null}
        isLoading={isLoadingContent}
        error={contentError as Error | null}
        description="파일 내용"
        fileSize={selectedFile?.size}
      />
    </>
  )
}
