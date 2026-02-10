/**
 * File Browser Widget
 * 파일 트리 + 파일 뷰어가 통합된 완전한 파일 브라우저 위젯
 *
 * 사용 예시:
 * <FileBrowser
 *   fileTree={data}
 *   useFileContent={useMyFileContentQuery}
 *   onDownload={handleDownload}
 *   canManage={hasPermission}
 * />
 */

import { useState, type ReactNode } from 'react'


import { fileDownloadApi } from '@/shared/api'
import {
  useFileContentViewer,
  type FileContentQueryResult,
} from '@/shared/lib/hooks/use-file-content-viewer'
import {
  FileTree,
  type FileTreeNode,
  type FileTreeData,
  type FileTreeManageCallbacks,
} from '@/shared/ui/file-tree'
import { FileViewer } from '@/shared/ui/file-viewer'

import type { LucideIcon } from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

/** 선택된 파일 정보 */
interface SelectedFile {
  filePath: string
  name: string
  size?: number
}

/** FileBrowser Props */
export interface FileBrowserProps extends FileTreeManageCallbacks {
  /** 파일 트리 데이터 */
  fileTree: FileTreeData | FileTreeNode | undefined
  /** 파일 트리 로딩 상태 */
  isLoading?: boolean
  /** 파일 트리 에러 */
  error?: Error | null
  /** 파일 내용 조회 쿼리 함수 */
  useFileContent: (path: string, enabled: boolean) => FileContentQueryResult
  /** 파일 다운로드 함수 (기본: fileDownloadApi.download) */
  onDownloadFile?: (filePath: string, fileName: string) => void
  /** 다운로드 가능 여부 */
  canDownload?: boolean
  /** 관리 기능 활성화 여부 */
  canManage?: boolean
  /** 메타데이터 표시 여부 (크기) */
  showMetadata?: boolean
  /** 수정일 표시 여부 */
  showModifiedDate?: boolean
  /** 폴더 기본 펼침 상태 */
  defaultExpanded?: boolean
  /** 파일 뷰어 설명 텍스트 */
  viewerDescription?: string
  /** ZIP 파일용 아이콘 */
  zipIcon?: LucideIcon
  /** 로딩 상태 렌더링 */
  loadingState?: ReactNode
  /** 에러 상태 렌더링 */
  errorState?: ReactNode
  /** 빈 상태 렌더링 */
  emptyState?: ReactNode
}

// ============================================================================
// Component
// ============================================================================

export function FileBrowser({
  fileTree,
  isLoading = false,
  error = null,
  useFileContent,
  onDownloadFile,
  onUpload,
  onDelete,
  onCreateDirectory,
  canDownload = true,
  canManage = false,
  showMetadata = true,
  showModifiedDate = false,
  defaultExpanded = true,
  viewerDescription = '파일 내용',
  zipIcon,
  loadingState,
  errorState,
  emptyState,
}: FileBrowserProps) {
  // 파일 뷰어 상태
  const [viewerOpen, setViewerOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null)

  // 파일 내용 조회 훅
  const viewer = useFileContentViewer({
    filePath: selectedFile?.filePath,
    fileName: selectedFile?.name,
    fileSize: selectedFile?.size,
    enabled: viewerOpen && selectedFile !== null,
    useContentQuery: useFileContent,
  })

  // 파일 클릭 핸들러
  const handleFileClick = (node: FileTreeNode) => {
    setSelectedFile({
      filePath: node.filePath,
      name: node.name,
      size: node.size ?? undefined,
    })
    setViewerOpen(true)
  }

  // 파일 다운로드 핸들러
  const handleDownload = (node: FileTreeNode) => {
    if (onDownloadFile) {
      onDownloadFile(node.filePath, node.name)
    } else {
      fileDownloadApi.download(node.filePath, node.name)
    }
  }

  // 선택된 파일 다운로드 (뷰어에서)
  const handleDownloadSelected = () => {
    if (selectedFile) {
      if (onDownloadFile) {
        onDownloadFile(selectedFile.filePath, selectedFile.name)
      } else {
        fileDownloadApi.download(selectedFile.filePath, selectedFile.name)
      }
    }
  }

  // 로딩 상태
  if (isLoading) {
    return loadingState || (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground text-sm">로딩 중...</div>
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return errorState || (
      <div className="flex items-center justify-center py-8">
        <div className="text-destructive text-sm">
          파일 목록을 불러오는데 실패했습니다.
          {error.message && <div className="mt-1 text-xs">{error.message}</div>}
        </div>
      </div>
    )
  }

  // 데이터 없음
  if (!fileTree) {
    return emptyState || (
      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
        파일이 없습니다.
      </div>
    )
  }

  return (
    <>
      {/* 파일 트리 */}
      <FileTree
        data={fileTree}
        onFileClick={handleFileClick}
        onDownload={canDownload ? handleDownload : undefined}
        onUpload={onUpload}
        onDelete={onDelete}
        onCreateDirectory={onCreateDirectory}
        canDownload={canDownload}
        canManage={canManage}
        showMetadata={showMetadata}
        showModifiedDate={showModifiedDate}
        defaultExpanded={defaultExpanded}
        emptyState={emptyState}
      />

      {/* 파일 뷰어 */}
      <FileViewer
        {...viewer.viewerProps}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        onDownload={canDownload ? handleDownloadSelected : undefined}
        canDownload={canDownload}
        description={viewerDescription}
        zipIcon={zipIcon}
      />
    </>
  )
}
