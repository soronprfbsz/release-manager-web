/**
 * Resource File Tree Component
 * 리소스 파일 트리 컴포넌트 (온보딩/인스톨과 동일한 구조)
 */

import { useState } from 'react'

import {
  Folder,
  FolderOpen,
  File,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileArchive,
  FileCode,
  Database,
  Terminal,
  FileJson,
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

// 확장자별 파일 아이콘 및 색상 반환
function getFileIcon(fileName: string): { icon: typeof File; color: string } {
  const ext = fileName.toLowerCase().split('.').pop() || ''

  // 스프레드시트
  if (['xlsx', 'xls', 'csv'].includes(ext)) {
    return { icon: FileSpreadsheet, color: 'text-green-600' }
  }
  // 문서
  if (['doc', 'docx', 'rtf', 'odt'].includes(ext)) {
    return { icon: FileText, color: 'text-blue-600' }
  }
  // PDF
  if (ext === 'pdf') {
    return { icon: FileText, color: 'text-red-500' }
  }
  // 이미지
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'svg'].includes(ext)) {
    return { icon: FileImage, color: 'text-purple-500' }
  }
  // 압축 파일
  if (['zip', 'rar', '7z', 'tar', 'gz', 'jar', 'war', 'ear'].includes(ext)) {
    return { icon: FileArchive, color: 'text-yellow-600' }
  }
  // 코드 파일
  if (['js', 'ts', 'tsx', 'jsx', 'py', 'java', 'c', 'cpp', 'h', 'cs', 'go', 'rs', 'rb', 'php', 'html', 'css', 'scss'].includes(ext)) {
    return { icon: FileCode, color: 'text-orange-500' }
  }
  // SQL
  if (ext === 'sql') {
    return { icon: Database, color: 'text-cyan-600' }
  }
  // 쉘/스크립트
  if (['sh', 'bash', 'bat', 'ps1', 'cmd'].includes(ext)) {
    return { icon: Terminal, color: 'text-gray-600' }
  }
  // JSON/설정 파일
  if (['json', 'yml', 'yaml', 'xml', 'ini', 'conf', 'properties', 'env', 'toml'].includes(ext)) {
    return { icon: FileJson, color: 'text-amber-500' }
  }
  // 텍스트/마크다운
  if (['txt', 'md', 'log', 'readme'].includes(ext)) {
    return { icon: FileText, color: 'text-gray-500' }
  }
  // 기본
  return { icon: File, color: 'text-muted-foreground' }
}

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

  // 확장자별 아이콘
  const { icon: FileIcon, color: iconColor } = getFileIcon(node.name)

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
        <FileIcon className={`h-4 w-4 flex-shrink-0 ${iconColor}`} />
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
