import { useState, useRef, useMemo, useCallback, useEffect, createContext, useContext } from 'react'

import { useVirtualizer } from '@tanstack/react-virtual'
import { FileText, File, Download, Folder, FolderOpen, ChevronRight, ChevronDown, CheckCircle2, TableOfContents, Tag, Info, FolderTree, Pencil, Upload, X, Check, ChevronsDownUp, ChevronsUpDown } from 'lucide-react'


import {
  releaseApi,
  useVersionFileStructure,
  useReleaseFileContent,
  useDeleteVersion,
  useApproveVersion,
  useUpdateVersionComment,
  useReplaceBuildZip,
  type ReleaseFileNode,
} from '@/entities/releases/release'

import { fileDownloadApi } from '@/shared/api'
import { useFileContentViewer } from '@/shared/lib/hooks/use-file-content-viewer'
import { useFileTransferProgress } from '@/shared/lib/hooks/use-file-transfer-progress'
import { usePermission } from '@/shared/lib/hooks/use-permission'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { formatDateTime } from '@/shared/lib/utils/date'
import { getFileIcon, isViewableFile } from '@/shared/lib/utils/file-icon'
import { formatFileSize } from '@/shared/lib/utils/format'
import { useProjectStore } from '@/shared/store'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { CollapsibleSection } from '@/shared/ui/collapsible-section'
import { ErrorDisplay } from '@/shared/ui/error-display'
import { FileViewer } from '@/shared/ui/file-viewer'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Textarea } from '@/shared/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { TypographyMuted, TypographySmall } from '@/shared/ui/typography'
import { UserAvatar } from '@/shared/ui/user-avatar'

import { HotfixCreateForm } from './HotfixCreateForm'

/** 버전 정보 (트리에서 선택된 정보) */
export interface SelectedVersionData {
  versionId: number
  version: string
  createdAt: string
  createdByEmail: string
  createdByName?: string | null
  createdByAvatarStyle?: string | null
  createdByAvatarSeed?: string | null
  isDeletedCreator?: boolean
  comment: string
  fileCategories: string[]
  isApproved: boolean
  approvedBy: string | null
  approvedByName?: string | null
  approvedByAvatarStyle?: string | null
  approvedByAvatarSeed?: string | null
  isDeletedApprover?: boolean
  approvedAt: string | null
  /** 빌드 버전 번호 (1+이면 빌드, 예: 260427) */
  buildVersion?: number
  /** 빌드 base 버전 (예: 1.1.0) — `version` 은 fullVersion(1.1.0.260427) 일 때 채움 */
  buildBaseVersion?: string
}

interface VersionDetailPanelProps {
  version: SelectedVersionData | null
  /** 핫픽스 여부 */
  isHotfix?: boolean
  /** 빌드 여부 */
  isBuild?: boolean
  onDelete?: () => void
  /** 기준 표준본 버전 (커스텀 릴리즈의 경우) */
  baseVersion?: string | null
}

// Context for compound components
interface VersionDetailContextValue {
  version: SelectedVersionData
  isHotfix: boolean
  isBuild: boolean
  baseVersion?: string | null
  fileStructure: ReturnType<typeof useVersionFileStructure>['data']
  isLoading: boolean
  error: Error | null
  // File viewer
  fileViewerOpen: boolean
  setFileViewerOpen: (open: boolean) => void
  selectedFile: { id: number; filePath: string; name: string; size?: number } | null
  setSelectedFile: (file: { id: number; filePath: string; name: string; size?: number } | null) => void
  // Dialogs
  deleteDialogOpen: boolean
  setDeleteDialogOpen: (open: boolean) => void
  hotfixDialogOpen: boolean
  setHotfixDialogOpen: (open: boolean) => void
  // Comment editing
  isEditingComment: boolean
  setIsEditingComment: (editing: boolean) => void
  editedComment: string
  setEditedComment: (comment: string) => void
  handleSaveComment: () => void
  handleCancelEditComment: () => void
  commentMutation: ReturnType<typeof useUpdateVersionComment>
  // Mutations
  deleteMutation: ReturnType<typeof useDeleteVersion>
  approveMutation: ReturnType<typeof useApproveVersion>
  // Handlers
  handleApprove: () => void
  handleDeleteConfirm: () => void
  handleDownload: (node: ReleaseFileNode) => void
  handleViewFile: (node: ReleaseFileNode) => void
  handleDownloadAll: () => void
  handleDownloadSelectedFile: () => void
  // Permissions
  canDeleteVersion: boolean
  canApproveVersion: boolean
  canAddVersion: boolean
  canDownloadVersion: boolean
  // File content query (for VersionDetailDialogs)
  useFileContentQuery: (path: string, enabled: boolean) => {
    data: { content: string; mimeType?: string; isBinary?: boolean } | undefined
    isLoading: boolean
    error: Error | null
  }
  projectId: string
  onDelete?: () => void
}

const VersionDetailContext = createContext<VersionDetailContextValue | null>(null)

function useVersionDetailContext() {
  const context = useContext(VersionDetailContext)
  if (!context) {
    throw new Error('VersionDetail components must be used within VersionDetailProvider')
  }
  return context
}

// ============================================================================
// VirtualReleaseFileTree — flat list + @tanstack/react-virtual
// ============================================================================

interface ReleaseFlatRow {
  node: ReleaseFileNode
  depth: number
  key: string
}

function buildReleaseFlatRows(
  nodes: ReleaseFileNode[],
  expanded: Set<string>,
  depth: number,
  rows: ReleaseFlatRow[],
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
      buildReleaseFlatRows(node.children, expanded, depth + 1, rows)
    }
  }
}

function collectReleaseDirectoryPaths(nodes: ReleaseFileNode[], result: string[]) {
  for (const node of nodes) {
    if (node.type === 'directory') {
      result.push(node.path)
      if (node.children) {
        collectReleaseDirectoryPaths(node.children, result)
      }
    }
  }
}

interface VirtualReleaseFileTreeProps {
  rootChildren: ReleaseFileNode[]
  onFileClick: (node: ReleaseFileNode) => void
  onDownload: (node: ReleaseFileNode) => void
  canDownload: boolean
}

function VirtualReleaseFileTree({ rootChildren, onFileClick, onDownload, canDownload }: VirtualReleaseFileTreeProps) {
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

  // rootChildren 변경 시 default expanded 재초기화
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

  const handleExpandAll = useCallback(() => {
    const all: string[] = []
    collectReleaseDirectoryPaths(rootChildren, all)
    setExpanded(new Set(all))
  }, [rootChildren])

  const handleCollapseAll = useCallback(() => {
    setExpanded(new Set())
  }, [])

  const flatRows = useMemo(() => {
    const rows: ReleaseFlatRow[] = []
    buildReleaseFlatRows(rootChildren, expanded, 0, rows)
    return rows
  }, [rootChildren, expanded])

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
    <div className="flex flex-col" style={{ height: '100%' }}>
      {/* 헤더: 모두 펼치기 / 모두 접기 */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={handleExpandAll}
        >
          <ChevronsUpDown className="h-3.5 w-3.5 mr-1" />
          모두 펼치기
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={handleCollapseAll}
        >
          <ChevronsDownUp className="h-3.5 w-3.5 mr-1" />
          모두 접기
        </Button>
      </div>

      {/* 가상 스크롤 컨테이너 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto"
      >
        <div style={{ height: `${totalSize}px`, width: '100%', position: 'relative' }}>
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
            const viewable = isViewableFile(node.name)
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
                  className="flex items-center justify-between gap-2 py-1.5 px-2 hover:bg-accent rounded h-full"
                  style={{ paddingLeft: `${depth * 16 + 24}px` }}
                >
                  <div
                    className={`flex items-center gap-2 flex-1 min-w-0 ${viewable ? 'cursor-pointer' : ''}`}
                    onClick={() => viewable && onFileClick(node)}
                  >
                    <FileIcon className={`h-4 w-4 flex-shrink-0 ${iconColor}`} />
                    <span className="text-sm truncate">{node.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {node.size !== null && (
                      <TypographyMuted className="text-xs">
                        {formatFileSize(node.size)}
                      </TypographyMuted>
                    )}
                    {node.releaseFileId && canDownload && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onDownload(node)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Provider component that manages all state
function VersionDetailProvider({
  version,
  isHotfix = false,
  isBuild = false,
  onDelete,
  baseVersion,
  children,
}: VersionDetailPanelProps & { children: React.ReactNode }) {
  const [fileViewerOpen, setFileViewerOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<{ id: number; filePath: string; name: string; size?: number } | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [hotfixDialogOpen, setHotfixDialogOpen] = useState(false)
  const { toast } = useToast()
  const { startTransfer, handleProgress, completeTransfer, resetTransfer, transferState } = useFileTransferProgress()
  const { canDeleteVersion, canApproveVersion, canAddVersion, canDownloadVersion } = usePermission()
  const projectId = useProjectStore((state) => state.projectId)

  // 파일 트리 구조 조회
  const { data: fileStructure, isLoading, error } = useVersionFileStructure(version?.versionId ?? 0)

  const deleteMutation = useDeleteVersion()
  const approveMutation = useApproveVersion()
  const commentMutation = useUpdateVersionComment()

  // 코멘트 수정 상태
  const [isEditingComment, setIsEditingComment] = useState(false)
  const [editedComment, setEditedComment] = useState(version?.comment ?? '')

  const handleSaveComment = () => {
    if (!version) return

    commentMutation.mutate(
      { versionId: version.versionId, comment: editedComment },
      {
        onSuccess: () => {
          toast({
            title: '코멘트 수정 완료',
            description: '코멘트가 수정되었습니다.',
          })
          setIsEditingComment(false)
        },
        onError: (err) => {
          toast({
            title: '코멘트 수정 실패',
            description: err instanceof Error ? err.message : '코멘트 수정 중 오류가 발생했습니다.',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const handleCancelEditComment = () => {
    setEditedComment(version?.comment ?? '')
    setIsEditingComment(false)
  }

  const handleApprove = () => {
    if (!version) return

    approveMutation.mutate(version.versionId, {
      onSuccess: () => {
        toast({
          title: '버전 승인 완료',
          description: `버전 ${version.version}이(가) 승인되었습니다.`,
        })
      },
      onError: (err: Error) => {
        toast({
          title: '버전 승인 실패',
          description: err instanceof Error ? err.message : '버전 승인 중 오류가 발생했습니다.',
          variant: 'destructive',
        })
      },
    })
  }

  const handleDeleteConfirm = () => {
    if (!version) return

    deleteMutation.mutate(version.versionId, {
      onSuccess: () => {
        toast({
          title: '버전 삭제 완료',
          description: `버전 ${version.version}이(가) 삭제되었습니다.`,
        })
        setDeleteDialogOpen(false)
        onDelete?.()
      },
      onError: (err) => {
        toast({
          title: '버전 삭제 실패',
          description: err instanceof Error ? err.message : '버전 삭제 중 오류가 발생했습니다.',
          variant: 'destructive',
        })
      },
    })
  }

  const handleDownload = (node: ReleaseFileNode) => {
    if (!node.filePath) return
    fileDownloadApi.download(node.filePath, node.name)
  }

  const handleViewFile = (node: ReleaseFileNode) => {
    if (!node.releaseFileId || !node.filePath) return
    if (isViewableFile(node.name)) {
      setSelectedFile({ id: node.releaseFileId, filePath: node.filePath, name: node.name, size: node.size ?? undefined })
      setFileViewerOpen(true)
    }
  }

  // 파일 내용 조회 쿼리 함수 (VersionDetailDialogs에서 useFileContentViewer와 함께 사용)
  const useFileContentQuery = (path: string, enabled: boolean) => {
     
    const result = useReleaseFileContent(path, enabled)
    return {
      data: result.data,
      isLoading: result.isLoading,
      error: result.error as Error | null,
    }
  }

  const handleDownloadSelectedFile = () => {
    if (selectedFile?.filePath) {
      fileDownloadApi.download(selectedFile.filePath, selectedFile.name)
    }
  }

  const handleDownloadAll = async () => {
    if (!version || transferState.isTransferring) return
    const fileName = `release-${version.version}.zip`

    const controller = startTransfer(fileName, 'download')
    try {
      await releaseApi.downloadVersion(version.versionId, fileName, handleProgress, controller.signal)
      completeTransfer()
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      resetTransfer()
      toast({
        title: '다운로드 실패',
        description: error instanceof Error ? error.message : '파일 다운로드 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  if (!version) {
    return <>{children}</>
  }

  const contextValue: VersionDetailContextValue = {
    version,
    isHotfix,
    isBuild,
    baseVersion,
    fileStructure,
    isLoading,
    error: error as Error | null,
    fileViewerOpen,
    setFileViewerOpen,
    selectedFile,
    setSelectedFile,
    deleteDialogOpen,
    setDeleteDialogOpen,
    hotfixDialogOpen,
    setHotfixDialogOpen,
    isEditingComment,
    setIsEditingComment,
    editedComment,
    setEditedComment,
    handleSaveComment,
    handleCancelEditComment,
    commentMutation,
    deleteMutation,
    approveMutation,
    handleApprove,
    handleDeleteConfirm,
    handleDownload,
    handleViewFile,
    handleDownloadAll,
    handleDownloadSelectedFile,
    canDeleteVersion,
    canApproveVersion,
    canAddVersion,
    canDownloadVersion,
    useFileContentQuery,
    projectId,
    onDelete,
  }

  return (
    <VersionDetailContext.Provider value={contextValue}>
      {children}
    </VersionDetailContext.Provider>
  )
}

// Header component
function VersionDetailHeader() {
  const ctx = useVersionDetailContext()
  const { version, isHotfix, isBuild, baseVersion } = ctx

  const getCategoryShortName = (category: string) => {
    switch (category) {
      case 'DATABASE':
        return 'DB'
      case 'ENGINE':
        return 'ENGINE'
      case 'WEB':
        return 'WEB'
      default:
        return category
    }
  }

  return (
    <div className="flex items-center gap-2 min-w-0 w-full">
      <TableOfContents className="h-4 w-4 flex-shrink-0" />
      <h2 className="text-base font-semibold truncate">
        {version.version}
      </h2>
      {isHotfix && (
        <Badge variant="destructive" className="h-5 text-xs">HOTFIX</Badge>
      )}
      {isBuild && (
        <Badge className="h-5 text-xs bg-blue-500 hover:bg-blue-500/90 text-white">BUILD</Badge>
      )}
      {isBuild && version.buildBaseVersion && (
        <span className="flex items-center gap-1 text-muted-foreground text-xs">
          <Tag className="h-3 w-3" />
          base {version.buildBaseVersion}
        </span>
      )}
      {version.fileCategories && version.fileCategories.length > 0 && (
        <div className="flex items-center gap-1">
          {version.fileCategories.map((category) => (
            <Badge
              key={category}
              variant={category.toLowerCase() as "database" | "web" | "engine" | "etc"}
              className="h-5 text-xs"
            >
              {getCategoryShortName(category)}
            </Badge>
          ))}
        </div>
      )}
      {baseVersion && (
        <span className="flex items-center gap-1 text-muted-foreground text-xs">
          <Tag className="h-3 w-3" />
          기준 {baseVersion}
        </span>
      )}
    </div>
  )
}

// Comment Section with inline editing
function CommentSection() {
  const ctx = useVersionDetailContext()
  const {
    version,
    isEditingComment,
    setIsEditingComment,
    editedComment,
    setEditedComment,
    handleSaveComment,
    handleCancelEditComment,
    commentMutation,
    canAddVersion,
  } = ctx

  // 코멘트가 없고 편집 모드도 아니면 섹션을 표시하지 않음
  if (!version.comment && !isEditingComment) {
    return null
  }

  return (
    <CollapsibleSection
      icon={FileText}
      title="코멘트"
      actions={
        !isEditingComment && canAddVersion && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => {
                  setEditedComment(version.comment || '')
                  setIsEditingComment(true)
                }}
              >
                <Pencil />
              </Button>
            </TooltipTrigger>
            <TooltipContent>코멘트 수정</TooltipContent>
          </Tooltip>
        )
      }
    >
      {isEditingComment ? (
        <div className="space-y-3">
          <Textarea
            value={editedComment}
            onChange={(e) => setEditedComment(e.target.value)}
            placeholder="코멘트를 입력하세요..."
            className="min-h-[120px] resize-none"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelEditComment}
              disabled={commentMutation.isPending}
            >
              <X className="h-4 w-4 mr-1" />
              취소
            </Button>
            <Button
              size="sm"
              onClick={handleSaveComment}
              disabled={commentMutation.isPending}
            >
              {commentMutation.isPending ? (
                <>
                  <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  저장 중...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  저장
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-accent/40">
          <p className="whitespace-pre-wrap text-sm">
            {version.comment}
          </p>
        </div>
      )}
    </CollapsibleSection>
  )
}

// 빌드 ZIP 재업로드 액션 (빌드 노드에서만 표시)
function BuildZipReplaceAction() {
  const ctx = useVersionDetailContext()
  const { version, isBuild, canAddVersion } = ctx
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const replaceMutation = useReplaceBuildZip()
  const { toast } = useToast()

  if (!isBuild || !canAddVersion) return null

  const handleSelectFile = () => fileInputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPendingFile(file)
    e.target.value = ''
  }

  const handleConfirm = () => {
    if (!pendingFile) return
    replaceMutation.mutate(
      { buildVersionId: version.versionId, file: pendingFile },
      {
        onSuccess: (data) => {
          toast({
            title: 'ZIP 재업로드 완료',
            description: `${data.uploadedFileCount}개 파일이 교체되었습니다.`,
          })
          setPendingFile(null)
        },
        onError: (err) => {
          toast({
            title: 'ZIP 재업로드 실패',
            description: err instanceof Error ? err.message : '업로드 중 오류가 발생했습니다.',
            variant: 'destructive',
          })
        },
      }
    )
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        hidden
        onChange={handleFileChange}
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon-xs"
            onClick={handleSelectFile}
            disabled={replaceMutation.isPending}
          >
            <Upload />
          </Button>
        </TooltipTrigger>
        <TooltipContent>ZIP 재업로드</TooltipContent>
      </Tooltip>
      <AlertDialog
        open={pendingFile !== null}
        onOpenChange={(open) => {
          if (!open) setPendingFile(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>빌드 ZIP 교체</AlertDialogTitle>
            <AlertDialogDescription>
              빌드 <strong>{version.version}</strong> 의 기존 파일이 모두 삭제되고 새 ZIP 으로 교체됩니다.
              <br />
              파일: <code>{pendingFile?.name}</code>
              {pendingFile ? ` (${Math.round(pendingFile.size / 1024)} KB)` : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={replaceMutation.isPending}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={replaceMutation.isPending}
            >
              {replaceMutation.isPending ? '업로드 중...' : '교체'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// Content component
function VersionDetailContent() {
  const ctx = useVersionDetailContext()
  const { version, isLoading, error, fileStructure, handleApprove, handleDownloadAll, handleViewFile, handleDownload, canApproveVersion, canDownloadVersion, approveMutation } = ctx

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <ErrorDisplay
          title="버전 정보를 불러오는 중 오류가 발생했습니다."
          error={error}
        />
      </div>
    )
  }

  const hasFiles = fileStructure?.files?.children && fileStructure.files.children.length > 0

  return (
    <div className="space-y-16 pt-2">
      {/* 기본 정보 */}
      <CollapsibleSection
        icon={Info}
        title="기본 정보"
        subtitle={
          version.isApproved ? (
            <Badge variant="default" className="h-5 text-xs">승인됨</Badge>
          ) : (
            <Badge variant="outline" className="h-5 text-xs border-yellow-500 text-yellow-600">미승인</Badge>
          )
        }
        actions={
          <div className="flex items-center gap-1">
            <BuildZipReplaceAction />
            {canApproveVersion && !version.isApproved && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon-xs"
                    onClick={handleApprove}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle2 />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>승인하기</TooltipContent>
              </Tooltip>
            )}
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <TypographyMuted className="text-sm">생성자</TypographyMuted>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-default">
                  <UserAvatar
                    email={version.createdByEmail}
                    avatarStyle={version.createdByAvatarStyle}
                    avatarSeed={version.createdByAvatarSeed}
                    isDeleted={version.isDeletedCreator}
                    size={20}
                  />
                  <TypographySmall className={version.isDeletedCreator ? 'text-muted-foreground' : ''}>
                    {version.createdByName || version.createdByEmail || '-'}
                  </TypographySmall>
                </div>
              </TooltipTrigger>
              <TooltipContent>{version.isDeletedCreator ? '삭제된 사용자' : version.createdByEmail}</TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            <TypographyMuted className="text-sm">생성일시</TypographyMuted>
            <TypographySmall>{formatDateTime(version.createdAt)}</TypographySmall>
          </div>
          {version.isApproved && version.approvedBy && (
            <>
              <div className="flex items-center gap-2">
                <TypographyMuted className="text-sm">승인자</TypographyMuted>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 cursor-default">
                      <UserAvatar
                        email={version.approvedBy}
                        avatarStyle={version.approvedByAvatarStyle}
                        avatarSeed={version.approvedByAvatarSeed}
                        isDeleted={version.isDeletedApprover}
                        size={20}
                      />
                      <TypographySmall className={version.isDeletedApprover ? 'text-muted-foreground' : ''}>
                        {version.approvedByName || version.approvedBy}
                      </TypographySmall>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{version.isDeletedApprover ? '삭제된 사용자' : version.approvedBy}</TooltipContent>
                </Tooltip>
              </div>
              {version.approvedAt && (
                <div className="flex items-center gap-2">
                  <TypographyMuted className="text-sm">승인일시</TypographyMuted>
                  <TypographySmall>{formatDateTime(version.approvedAt)}</TypographySmall>
                </div>
              )}
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* 코멘트 */}
      <CommentSection />

      {/* 파일 */}
      {fileStructure && (
        <CollapsibleSection
          icon={FolderTree}
          title="파일"
          actions={
            hasFiles && canDownloadVersion && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon-xs"
                    onClick={handleDownloadAll}
                  >
                    <Download />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>전체 다운로드</TooltipContent>
              </Tooltip>
            )
          }
        >
          {!hasFiles ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <File className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">등록된 릴리즈 파일이 없습니다.</p>
            </div>
          ) : (
            <div style={{ height: '400px' }}>
              <VirtualReleaseFileTree
                rootChildren={fileStructure.files.children!}
                onFileClick={handleViewFile}
                onDownload={handleDownload}
                canDownload={canDownloadVersion}
              />
            </div>
          )}
        </CollapsibleSection>
      )}
    </div>
  )
}

// Dialogs component
function VersionDetailDialogs() {
  const ctx = useVersionDetailContext()
  const {
    version, isHotfix, isBuild, projectId, onDelete,
    fileViewerOpen, setFileViewerOpen, selectedFile,
    deleteDialogOpen, setDeleteDialogOpen, hotfixDialogOpen, setHotfixDialogOpen,
    deleteMutation, handleDeleteConfirm, handleDownloadSelectedFile, canDownloadVersion,
    useFileContentQuery,
  } = ctx

  // 파일 내용 조회 훅 사용
  const viewer = useFileContentViewer({
    filePath: selectedFile?.filePath,
    fileName: selectedFile?.name,
    fileSize: selectedFile?.size,
    enabled: fileViewerOpen && selectedFile !== null,
    useContentQuery: useFileContentQuery,
  })

  return (
    <>
      {/* File Content Viewer */}
      <FileViewer
        {...viewer.viewerProps}
        open={fileViewerOpen}
        onOpenChange={setFileViewerOpen}
        onDownload={handleDownloadSelectedFile}
        canDownload={canDownloadVersion}
        description="파일 내용"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>버전 삭제 확인</AlertDialogTitle>
            <AlertDialogDescription>
              버전 <strong>{version.version}</strong>을(를) 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없으며, 모든 관련 파일이 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hotfix Create Form (빌드 위에서는 핫픽스 생성 불가) */}
      {!isHotfix && !isBuild && (
        <HotfixCreateForm
          open={hotfixDialogOpen}
          onOpenChange={setHotfixDialogOpen}
          projectId={projectId}
          hotfixBaseVersionId={version.versionId}
          hotfixBaseVersion={version.version}
          onSuccess={onDelete}
        />
      )}
    </>
  )
}

// Legacy component for backward compatibility
export function VersionDetailPanel({ version, isHotfix = false, isBuild = false, onDelete, baseVersion }: VersionDetailPanelProps) {
  if (!version) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">버전을 선택하면 상세 정보가 표시됩니다.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <VersionDetailProvider version={version} isHotfix={isHotfix} isBuild={isBuild} onDelete={onDelete} baseVersion={baseVersion}>
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 flex-shrink-0">
          <VersionDetailHeader />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <div className="px-8 pb-8 pt-6">
              <VersionDetailContent />
            </div>
          </ScrollArea>
        </div>
      </div>
      <VersionDetailDialogs />
    </VersionDetailProvider>
  )
}

// Export compound components for new usage pattern
export const VersionDetail = {
  Provider: VersionDetailProvider,
  Header: VersionDetailHeader,
  Content: VersionDetailContent,
  Dialogs: VersionDetailDialogs,
}
