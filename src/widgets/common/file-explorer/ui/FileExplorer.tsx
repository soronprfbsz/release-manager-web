/**
 * File Explorer Component
 * 공통 파일 탐색기 컴포넌트
 * - 패치, 퍼블리싱 등 여러 도메인에서 사용
 * - @tanstack/react-virtual 기반 가상 스크롤
 * - 기본 1단계 펼침
 */

import { useState, useMemo, useCallback, useEffect, useRef, type ReactNode } from 'react'

import { useVirtualizer } from '@tanstack/react-virtual'
import { Folder, FolderOpen, ChevronRight, ChevronDown, Info, type LucideIcon } from 'lucide-react'

import { useFileContentViewer } from '@/shared/lib/hooks/use-file-content-viewer'
import { getFileIcon, isViewableFile as checkIsViewableFile } from '@/shared/lib/utils/file-icon'
import { FileViewer } from '@/shared/ui/file-viewer'
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
  /** UI 표시용 경로 (트리 구조) */
  path: string
  /** API 호출용 전체 경로 (다운로드/내용 조회) */
  filePath: string
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
  /** Sheet 헤더와 파일 트리 사이에 표시할 추가 영역 (메타데이터 등) */
  headerSlot?: ReactNode
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

/** 파일 크기 제한 에러인지 확인 */
function isFileSizeLimitError(error: Error | null): boolean {
  if (!error) return false
  const message = error.message || ''
  return message.includes('파일 크기가 너무 큽니다') || message.includes('최대 10MB')
}

/** 에러 메시지에서 파일 크기 정보 추출 */
function parseFileSizeFromError(error: Error | null): { currentSize: string; maxSize: string } | null {
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

/** 파일 조회 가능 여부 확인 (커스텀 확장자 또는 공통 확장자 사용) */
function isViewable(fileName: string, customExtensions?: string[]): boolean {
  if (customExtensions) {
    const lowerName = fileName.toLowerCase()
    return customExtensions.some(ext => lowerName.endsWith(ext))
  }
  return checkIsViewableFile(fileName)
}

// ============================================================================
// Flat List Types & Builder
// ============================================================================

interface FlatRow {
  node: FileNode
  depth: number
  key: string
}

/**
 * 트리를 DFS로 순회하여 expanded set 기준으로 보이는 행만 flat list로 변환.
 * 디렉터리는 children 정렬(디렉터리 우선, 이름 오름차순) 후 포함.
 */
function buildFlatRows(
  nodes: FileNode[],
  expanded: Set<string>,
  depth: number,
  rows: FlatRow[],
) {
  const sorted = [...nodes].sort((a, b) => {
    if (a.type === 'directory' && b.type === 'file') return -1
    if (a.type === 'file' && b.type === 'directory') return 1
    return a.name.localeCompare(b.name)
  })

  for (const node of sorted) {
    const key = node.path
    rows.push({ node, depth, key })
    if (node.type === 'directory' && expanded.has(key) && node.children && node.children.length > 0) {
      buildFlatRows(node.children, expanded, depth + 1, rows)
    }
  }
}

// ============================================================================
// VirtualFileTree Component
// ============================================================================

interface VirtualFileTreeProps {
  rootChildren: FileNode[]
  onFileClick: (node: FileNode) => void
  customViewableExtensions?: string[]
}

function VirtualFileTree({ rootChildren, onFileClick, customViewableExtensions }: VirtualFileTreeProps) {
  // 기본 expanded: 루트 직계 children 중 디렉터리만 펼침 (depth=1)
  const defaultExpanded = useMemo(() => {
    const paths: string[] = []
    for (const node of rootChildren) {
      if (node.type === 'directory') {
        paths.push(node.path)
      }
    }
    return new Set(paths)
  }, [rootChildren])

  const [expanded, setExpanded] = useState<Set<string>>(defaultExpanded)

  // fileTree가 변경되면 default expanded 재초기화
  useEffect(() => {
    setExpanded(defaultExpanded)
  }, [defaultExpanded])

  const toggleExpanded = useCallback((key: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  // flat list: expanded set 기준으로 visible 행만 포함
  const flatRows = useMemo(() => {
    const rows: FlatRow[] = []
    buildFlatRows(rootChildren, expanded, 0, rows)
    return rows
  }, [rootChildren, expanded])

  // Radix ScrollArea viewport를 ref로 가져오기 위해 일반 div + overflow-auto 사용
  const scrollRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: flatRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 32,
    overscan: 10,
  })

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  return (
    <div className="flex flex-col h-full">
      {/* 가상 스크롤 컨테이너 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto"
        style={{ height: '100%' }}
      >
        <div
          style={{ height: `${totalSize}px`, width: '100%', position: 'relative' }}
        >
          {virtualItems.map((virtualItem) => {
            const row = flatRows[virtualItem.index]
            const { node, depth, key } = row

            if (node.type === 'directory') {
              const isNodeExpanded = expanded.has(key)
              return (
                <div
                  key={key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <div
                    className="flex items-center gap-2 py-1.5 px-2 hover:bg-accent rounded cursor-pointer h-full"
                    style={{ paddingLeft: `${depth * 16 + 8}px` }}
                    onClick={() => toggleExpanded(key)}
                  >
                    {isNodeExpanded ? (
                      <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    )}
                    {isNodeExpanded ? (
                      <FolderOpen className="h-4 w-4 flex-shrink-0 text-blue-500" />
                    ) : (
                      <Folder className="h-4 w-4 flex-shrink-0 text-blue-500" />
                    )}
                    <span className="text-sm font-medium truncate">{node.name}</span>
                  </div>
                </div>
              )
            }

            // 파일 노드
            const viewable = isViewable(node.name, customViewableExtensions)
            const { icon: FileIcon, color: iconColor } = getFileIcon(node.name)

            return (
              <div
                key={key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <div
                  className={`flex items-center justify-between gap-2 py-1.5 px-2 hover:bg-accent rounded h-full ${
                    viewable ? 'cursor-pointer' : ''
                  }`}
                  style={{ paddingLeft: `${depth * 16 + 24}px` }}
                  onClick={() => viewable && onFileClick(node)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileIcon className={`h-4 w-4 flex-shrink-0 ${iconColor}`} />
                    <span className="text-sm truncate">{node.name}</span>
                  </div>
                  {node.size !== undefined && (
                    <TypographyMuted className="text-xs flex-shrink-0">
                      {formatFileSize(node.size)}
                    </TypographyMuted>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
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
  viewableExtensions,
  headerSlot,
}: FileExplorerProps) {
  const [fileViewerOpen, setFileViewerOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<{ filePath: string; name: string; size?: number } | null>(null)

  // File content viewer hook
  const viewer = useFileContentViewer({
    filePath: selectedFile?.filePath,
    fileName: selectedFile?.name,
    fileSize: selectedFile?.size,
    enabled: fileViewerOpen && selectedFile !== null,
    useContentQuery: useFileContent,
  })

  const handleFileClick = (node: FileNode) => {
    setSelectedFile({ filePath: node.filePath, name: node.name, size: node.size })
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

          {headerSlot && <div className="shrink-0">{headerSlot}</div>}

          <div className="flex-1 min-h-0 overflow-hidden">
            {isLoading && (
              <div className="flex items-center justify-center p-8 h-full">
                <div className="text-muted-foreground">로딩 중...</div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center p-8 h-full">
                {isFileSizeLimitError(error) ? (
                  (() => {
                    const sizeInfo = parseFileSizeFromError(error)
                    return (
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
                    )
                  })()
                ) : (
                  <div className="text-destructive text-center">
                    파일 구조를 불러오는데 실패했습니다.
                    {error instanceof Error && <div className="text-sm mt-2">{error.message}</div>}
                  </div>
                )}
              </div>
            )}

            {fileTree && !isLoading && !error && (
              <div className="h-full">
                {!hasContent ? (
                  <div className="flex items-center justify-center p-8 text-muted-foreground h-full">
                    파일이 없습니다.
                  </div>
                ) : (
                  <VirtualFileTree
                    rootChildren={fileTree.root.children!}
                    onFileClick={handleFileClick}
                    customViewableExtensions={viewableExtensions}
                  />
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <FileViewer
        {...viewer.viewerProps}
        open={fileViewerOpen}
        onOpenChange={setFileViewerOpen}
        description="파일 내용"
      />
    </>
  )
}
