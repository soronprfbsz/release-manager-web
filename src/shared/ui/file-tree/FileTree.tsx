/**
 * File Tree Component
 * 공통 파일 트리 컴포넌트
 *
 * 다양한 도메인(온보딩, 인스톨, 리소스, 릴리즈 등)에서 사용 가능한
 * 범용 파일 트리 컴포넌트입니다.
 *
 * 사용 예시:
 * <FileTree
 *   data={fileTreeData}
 *   onFileClick={handleFileClick}
 *   onDownload={handleDownload}
 *   showMetadata
 * />
 */

import { useState, type ReactNode } from 'react'

import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Download,
  Trash2,
  FolderPlus,
  File,
} from 'lucide-react'

import { formatFileSize } from '@/shared/lib/utils/format'
import { formatDateTime } from '@/shared/lib/utils/date'
import { getFileIcon, isViewableFile } from '@/shared/lib/utils/file-icon'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { TypographyMuted } from '@/shared/ui/typography'

// ============================================================================
// Types
// ============================================================================

/** 파일 노드 기본 타입 */
export interface FileTreeNode {
  name: string
  path: string
  /** API 호출용 전체 경로 (다운로드/내용 조회) */
  filePath: string
  type: 'file' | 'directory'
  size?: number | null
  modifiedAt?: string
  children?: FileTreeNode[]
}

/** 파일 트리 데이터 */
export interface FileTreeData {
  children?: FileTreeNode[]
}

/** 관리 기능 콜백 */
export interface FileTreeManageCallbacks {
  /** 파일 업로드 콜백 */
  onUpload?: (targetPath: string) => void
  /** 삭제 콜백 */
  onDelete?: (node: FileTreeNode) => void
  /** 디렉토리 생성 콜백 */
  onCreateDirectory?: (parentPath: string) => void
}

/** FileTree Props */
export interface FileTreeProps extends FileTreeManageCallbacks {
  /** 파일 트리 데이터 */
  data: FileTreeData | FileTreeNode
  /** 파일 클릭 콜백 */
  onFileClick?: (node: FileTreeNode) => void
  /** 다운로드 콜백 */
  onDownload?: (node: FileTreeNode) => void
  /** 다운로드 가능 여부 */
  canDownload?: boolean
  /** 관리 기능 활성화 여부 (업로드, 삭제, 디렉토리 생성) */
  canManage?: boolean
  /** 메타데이터 표시 여부 (크기, 수정일) */
  showMetadata?: boolean
  /** 수정일 표시 여부 */
  showModifiedDate?: boolean
  /** 폴더 기본 펼침 상태 */
  defaultExpanded?: boolean
  /** 빈 상태 렌더링 */
  emptyState?: ReactNode
}

// ============================================================================
// FileTreeNode Component (Internal)
// ============================================================================

interface FileTreeNodeComponentProps extends FileTreeManageCallbacks {
  node: FileTreeNode
  level: number
  onFileClick?: (node: FileTreeNode) => void
  onDownload?: (node: FileTreeNode) => void
  canDownload: boolean
  canManage: boolean
  showMetadata: boolean
  showModifiedDate: boolean
  defaultExpanded: boolean
}

function FileTreeNodeComponent({
  node,
  level,
  onFileClick,
  onDownload,
  onUpload,
  onDelete,
  onCreateDirectory,
  canDownload,
  canManage,
  showMetadata,
  showModifiedDate,
  defaultExpanded,
}: FileTreeNodeComponentProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  // ============================================================================
  // Directory Rendering
  // ============================================================================
  if (node.type === 'directory') {
    const children = node.children || []

    return (
      <div>
        <div
          className="group flex items-center justify-between gap-2 py-1.5 px-2 hover:bg-accent rounded"
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          <div
            className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-blue-500 flex-shrink-0" />
            ) : (
              <Folder className="h-4 w-4 text-blue-500 flex-shrink-0" />
            )}
            <span className="text-sm font-medium truncate">{node.name}</span>
          </div>

          {/* 디렉토리 관리 메뉴 */}
          {canManage && (onUpload || onDelete || onCreateDirectory) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onUpload && (
                  <DropdownMenuItem onClick={() => onUpload(node.filePath)}>
                    <File className="h-4 w-4 mr-2" />
                    파일 추가
                  </DropdownMenuItem>
                )}
                {onCreateDirectory && (
                  <DropdownMenuItem onClick={() => onCreateDirectory(node.filePath)}>
                    <FolderPlus className="h-4 w-4 mr-2" />
                    폴더 추가
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(node)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    삭제
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* 자식 노드 렌더링 */}
        {isExpanded && children.length > 0 && (
          <div>
            {children.map((child, index) => (
              <FileTreeNodeComponent
                key={`${child.path}-${index}`}
                node={child}
                level={level + 1}
                onFileClick={onFileClick}
                onDownload={onDownload}
                onUpload={onUpload}
                onDelete={onDelete}
                onCreateDirectory={onCreateDirectory}
                canDownload={canDownload}
                canManage={canManage}
                showMetadata={showMetadata}
                showModifiedDate={showModifiedDate}
                defaultExpanded={defaultExpanded}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // ============================================================================
  // File Rendering
  // ============================================================================
  const viewable = isViewableFile(node.name)
  const { icon: FileIcon, color: iconColor } = getFileIcon(node.name)

  return (
    <div
      className="group flex items-center justify-between gap-2 py-1.5 px-2 hover:bg-accent rounded"
      style={{ paddingLeft: `${level * 16 + 24}px` }}
    >
      {/* 파일 정보 */}
      <div
        className={`flex items-center gap-2 flex-1 min-w-0 ${viewable && onFileClick ? 'cursor-pointer' : ''}`}
        onClick={() => viewable && onFileClick?.(node)}
      >
        <FileIcon className={`h-4 w-4 flex-shrink-0 ${iconColor}`} />
        <span className="text-sm truncate">{node.name}</span>
      </div>

      {/* 메타데이터 및 액션 */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* 수정일 */}
        {showModifiedDate && node.modifiedAt && (
          <span className="text-xs text-muted-foreground">
            {formatDateTime(node.modifiedAt)}
          </span>
        )}

        {/* 파일 크기 */}
        {showMetadata && node.size != null && (
          <TypographyMuted className="text-xs w-16 text-right">
            {formatFileSize(node.size)}
          </TypographyMuted>
        )}

        {/* 파일 액션 메뉴 */}
        {(canDownload || canManage) && (onDownload || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canDownload && onDownload && (
                <DropdownMenuItem onClick={() => onDownload(node)}>
                  <Download className="h-4 w-4 mr-2" />
                  다운로드
                </DropdownMenuItem>
              )}
              {canManage && onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(node)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  삭제
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// FileTree Component
// ============================================================================

export function FileTree({
  data,
  onFileClick,
  onDownload,
  onUpload,
  onDelete,
  onCreateDirectory,
  canDownload = true,
  canManage = false,
  showMetadata = true,
  showModifiedDate = false,
  defaultExpanded = true,
  emptyState,
}: FileTreeProps) {
  // data가 FileTreeNode(루트 노드)인 경우와 FileTreeData인 경우 처리
  const children = 'children' in data ? data.children : undefined

  if (!children || children.length === 0) {
    return emptyState ? (
      <>{emptyState}</>
    ) : (
      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
        파일이 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {children.map((node, index) => (
        <FileTreeNodeComponent
          key={`${node.path}-${index}`}
          node={node}
          level={0}
          onFileClick={onFileClick}
          onDownload={onDownload}
          onUpload={onUpload}
          onDelete={onDelete}
          onCreateDirectory={onCreateDirectory}
          canDownload={canDownload}
          canManage={canManage}
          showMetadata={showMetadata}
          showModifiedDate={showModifiedDate}
          defaultExpanded={defaultExpanded}
        />
      ))}
    </div>
  )
}
