/**
 * Resource File Tree Component
 * 리소스 파일 트리 컴포넌트 (온보딩/인스톨과 동일한 구조)
 */

import { useState } from 'react'

import {
  Folder,
  FolderOpen,
  File,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Download,
  Trash2,
  FolderPlus,
} from 'lucide-react'

import type { ResourceFileNode } from '@/entities/infrastructure/file'

import { formatFileSize } from '@/shared/lib/utils/format'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

// 조회 가능한 파일 확장자 목록
const VIEWABLE_EXTENSIONS = [
  '.sql', '.sh', '.md', '.txt', '.log', '.json', '.xml',
  '.yml', '.yaml', '.ini', '.conf', '.properties', '.bat', '.ps1', '.env',
  '.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.ico',
  '.zip', '.jar', '.war', '.ear',
]

interface ResourceFileTreeProps {
  files: ResourceFileNode
  onFileClick: (node: ResourceFileNode) => void
  onDownload: (node: ResourceFileNode) => void
  onUpload: (targetPath: string) => void
  onDelete: (node: ResourceFileNode) => void
  onCreateDirectory: (parentPath: string) => void
  canManageFiles?: boolean
}

export function ResourceFileTree({
  files,
  onFileClick,
  onDownload,
  onUpload,
  onDelete,
  onCreateDirectory,
  canManageFiles = true,
}: ResourceFileTreeProps) {
  return (
    <div className="space-y-1">
      {files.children?.map((node) => (
        <ResourceFileTreeNode
          key={node.path}
          node={node}
          level={0}
          onFileClick={onFileClick}
          onDownload={onDownload}
          onUpload={onUpload}
          onDelete={onDelete}
          onCreateDirectory={onCreateDirectory}
          canManageFiles={canManageFiles}
        />
      ))}
    </div>
  )
}

interface ResourceFileTreeNodeProps {
  node: ResourceFileNode
  level: number
  onFileClick: (node: ResourceFileNode) => void
  onDownload: (node: ResourceFileNode) => void
  onUpload: (targetPath: string) => void
  onDelete: (node: ResourceFileNode) => void
  onCreateDirectory: (parentPath: string) => void
  canManageFiles?: boolean
}

function ResourceFileTreeNode({
  node,
  level,
  onFileClick,
  onDownload,
  onUpload,
  onDelete,
  onCreateDirectory,
  canManageFiles = true,
}: ResourceFileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // 디렉토리 렌더링
  if (node.type === 'directory') {
    const sortedChildren = node.children ? [...node.children].sort((a, b) => {
      if (a.type === 'directory' && b.type === 'file') return -1
      if (a.type === 'file' && b.type === 'directory') return 1
      return a.name.localeCompare(b.name)
    }) : []

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
          {canManageFiles && (
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
                <DropdownMenuItem onClick={() => onUpload(node.filePath)}>
                  <File className="h-4 w-4 mr-2" />
                  파일 추가
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCreateDirectory(node.filePath)}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  폴더 추가
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(node)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {isExpanded && sortedChildren.length > 0 && (
          <div>
            {sortedChildren.map((child, index) => (
              <ResourceFileTreeNode
                key={`${child.path}-${index}`}
                node={child}
                level={level + 1}
                onFileClick={onFileClick}
                onDownload={onDownload}
                onUpload={onUpload}
                onDelete={onDelete}
                onCreateDirectory={onCreateDirectory}
                canManageFiles={canManageFiles}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // 파일 클릭 가능 여부 확인
  const fileName = node.name.toLowerCase()
  const isViewable = VIEWABLE_EXTENSIONS.some(ext => fileName.endsWith(ext))

  // 파일 렌더링
  return (
    <div
      className="group flex items-center justify-between gap-2 py-1.5 px-2 hover:bg-accent rounded"
      style={{ paddingLeft: `${level * 16 + 24}px` }}
    >
      <div
        className={`flex items-center gap-2 flex-1 min-w-0 ${isViewable ? 'cursor-pointer' : ''}`}
        onClick={() => isViewable && onFileClick(node)}
      >
        <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm truncate">{node.name}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {node.size !== undefined && (
          <span className="text-xs text-muted-foreground">
            {formatFileSize(node.size)}
          </span>
        )}
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
            <DropdownMenuItem onClick={() => onDownload(node)}>
              <Download className="h-4 w-4 mr-2" />
              다운로드
            </DropdownMenuItem>
            {canManageFiles && (
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
      </div>
    </div>
  )
}
