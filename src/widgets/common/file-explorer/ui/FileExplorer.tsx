/**
 * File Explorer Component
 * 공통 파일 탐색기 컴포넌트
 * - 패치, 퍼블리싱 등 여러 도메인에서 사용
 */

import { useState, useMemo } from 'react'

import { Folder, FolderOpen, File, ChevronRight, ChevronDown, type LucideIcon } from 'lucide-react'

import { base64ToBlob, base64ToText, isPdfFile as checkIsPdfFile, isImageFile as checkIsImageFile } from '@/shared/lib/utils/file-content'

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

// ============================================================================
// Types
// ============================================================================

/** 파일 노드 타입 (트리 구조) */
export interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  children?: FileNode[]
}

/** 파일 트리 데이터 */
export interface FileTreeData {
  root: {
    children?: FileNode[]
  }
}

/** 파일 내용 데이터 */
export interface FileContentData {
  content: string
  mimeType?: string
  isBinary?: boolean
}

/** FileExplorer Props */
export interface FileExplorerProps {
  /** Sheet 열림 상태 */
  open: boolean
  /** Sheet 열림 상태 변경 콜백 */
  onOpenChange: (open: boolean) => void
  /** 타이틀 */
  title: string
  /** 타이틀 아이콘 */
  icon: LucideIcon
  /** Sheet 설명 */
  description: string
  /** 파일 트리 데이터 */
  fileTree: FileTreeData | undefined
  /** 파일 트리 로딩 상태 */
  isLoading: boolean
  /** 파일 트리 에러 */
  error: Error | null
  /** 파일 내용 조회 함수 (path를 받아 content data 반환) */
  useFileContent: (path: string, enabled: boolean) => {
    data: FileContentData | undefined
    isLoading: boolean
    error: Error | null
  }
  /** 조회 가능한 파일 확장자 목록 (선택적) */
  viewableExtensions?: string[]
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/** 기본 조회 가능 확장자 */
const DEFAULT_VIEWABLE_EXTENSIONS = [
  // 텍스트/코드
  '.html', '.htm', '.css', '.scss', '.less',
  '.js', '.ts', '.jsx', '.tsx',
  '.json', '.xml', '.svg',
  '.md', '.txt', '.log',
  '.yml', '.yaml',
  '.sql', '.sh', '.bat', '.ps1',
  '.ini', '.conf', '.properties', '.env',
  // PDF
  '.pdf',
  // 이미지
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.ico',
]

function isViewableFile(fileName: string, viewableExtensions: string[]): boolean {
  const lowerName = fileName.toLowerCase()
  return viewableExtensions.some(ext => lowerName.endsWith(ext))
}

// ============================================================================
// FileNode Component (Internal)
// ============================================================================

interface FileNodeComponentProps {
  node: FileNode
  level: number
  onFileClick: (node: FileNode) => void
  viewableExtensions: string[]
}

function FileNodeComponent({ node, level, onFileClick, viewableExtensions }: FileNodeComponentProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (node.type === 'directory') {
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
            {sortedChildren.map((child, index) => (
              <FileNodeComponent
                key={`${child.path}-${index}`}
                node={child}
                level={level + 1}
                onFileClick={onFileClick}
                viewableExtensions={viewableExtensions}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  const viewable = isViewableFile(node.name, viewableExtensions)

  return (
    <div
      className={`flex items-center justify-between gap-2 py-1.5 px-2 hover:bg-muted/50 rounded ${
        viewable ? 'cursor-pointer' : ''
      }`}
      style={{ paddingLeft: `${level * 16 + 24}px` }}
      onClick={() => viewable && onFileClick(node)}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className={`text-sm truncate ${viewable ? 'hover:text-primary transition-colors' : ''}`}>
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

// ============================================================================
// FileExplorer Component
// ============================================================================

export function FileExplorer({
  open,
  onOpenChange,
  title,
  icon: Icon,
  description,
  fileTree,
  isLoading,
  error,
  useFileContent,
  viewableExtensions = DEFAULT_VIEWABLE_EXTENSIONS,
}: FileExplorerProps) {
  const [fileViewerOpen, setFileViewerOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<{ path: string; name: string; size?: number } | null>(null)

  // PDF/이미지 파일 여부 확인
  const isPdfFile = selectedFile ? checkIsPdfFile(selectedFile.name) : false
  const isImageFile = selectedFile ? checkIsImageFile(selectedFile.name) : false

  // 파일 내용 조회
  const { data: fileContentData, isLoading: isLoadingContent, error: contentError } = useFileContent(
    selectedFile?.path ?? '',
    fileViewerOpen && selectedFile !== null
  )

  // isBinary가 true이면서 PDF/이미지인 경우 Blob으로 변환
  const binaryBlob = useMemo(() => {
    if (!fileContentData?.isBinary || !fileContentData?.content) return null
    if (!isPdfFile && !isImageFile) return null
    return base64ToBlob(fileContentData.content, fileContentData.mimeType)
  }, [fileContentData, isPdfFile, isImageFile])

  // isBinary가 true이면서 텍스트 파일인 경우 텍스트로 디코딩
  const decodedTextContent = useMemo(() => {
    if (!fileContentData?.isBinary || !fileContentData?.content) return null
    if (isPdfFile || isImageFile) return null
    return base64ToText(fileContentData.content)
  }, [fileContentData, isPdfFile, isImageFile])

  // 텍스트 콘텐츠 결정
  const textContent = useMemo(() => {
    if (isPdfFile || isImageFile) return null
    if (fileContentData?.isBinary) return decodedTextContent
    return fileContentData?.content || null
  }, [fileContentData, isPdfFile, isImageFile, decodedTextContent])

  const handleFileClick = (node: FileNode) => {
    setSelectedFile({ path: node.path, name: node.name, size: node.size })
    setFileViewerOpen(true)
  }

  const hasContent = fileTree?.root?.children && fileTree.root.children.length > 0

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[800px] sm:max-w-[800px] flex flex-col gap-4">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              {title}
            </SheetTitle>
            <SheetDescription>{description}</SheetDescription>
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

            {fileTree && !isLoading && !error && (
              <div>
                {!hasContent ? (
                  <div className="flex items-center justify-center p-8 text-muted-foreground">
                    파일이 없습니다.
                  </div>
                ) : (
                  <div>
                    {[...fileTree.root.children!].sort((a, b) => {
                      if (a.type === 'directory' && b.type === 'file') return -1
                      if (a.type === 'file' && b.type === 'directory') return 1
                      return a.name.localeCompare(b.name)
                    }).map((node, index) => (
                      <FileNodeComponent
                        key={`${node.path}-${index}`}
                        node={node}
                        level={0}
                        onFileClick={handleFileClick}
                        viewableExtensions={viewableExtensions}
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
        content={textContent}
        isLoading={isLoadingContent && !isPdfFile && !isImageFile}
        error={!isPdfFile && !isImageFile ? contentError : null}
        description="파일 내용"
        fileSize={selectedFile?.size}
        pdfBlob={isPdfFile ? binaryBlob : null}
        isPdfLoading={isPdfFile && isLoadingContent}
        pdfError={isPdfFile ? contentError : null}
        imageBlob={isImageFile ? binaryBlob : null}
        isImageLoading={isImageFile && isLoadingContent}
        imageError={isImageFile ? contentError : null}
      />
    </>
  )
}

