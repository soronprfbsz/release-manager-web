import { useState, useMemo, useCallback, useEffect, createContext, useContext } from 'react'

import { FileText, File, Download, Folder, FolderOpen, ChevronRight, ChevronDown, CheckCircle2, TableOfContents, Tag, FolderTree, Pencil, X, Check } from 'lucide-react'


import {
  releaseApi,
  useVersionFileStructure,
  useReleaseFileContent,
  useDeleteVersion,
  useApproveVersion,
  useUpdateVersionComment,
  type ReleaseFileNode,
} from '@/entities/releases/release'

import { fileDownloadApi } from '@/shared/api'
import { useFileContentViewer } from '@/shared/lib/hooks/use-file-content-viewer'
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
import { ErrorDisplay } from '@/shared/ui/error-display'
import { FileViewer } from '@/shared/ui/file-viewer'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Textarea } from '@/shared/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { TypographyMuted } from '@/shared/ui/typography'
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
  /** 패치 이력 없음을 확인했음 체크박스 상태 (체크되어야만 삭제 버튼 활성) */
  deleteAcknowledged: boolean
  setDeleteAcknowledged: (v: boolean) => void
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

interface VirtualReleaseFileTreeProps {
  rootChildren: ReleaseFileNode[]
  onFileClick: (node: ReleaseFileNode) => void
}

function VirtualReleaseFileTree({ rootChildren, onFileClick }: VirtualReleaseFileTreeProps) {
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

  const flatRows = useMemo(() => {
    const rows: ReleaseFlatRow[] = []
    buildReleaseFlatRows(rootChildren, expanded, 0, rows)
    return rows
  }, [rootChildren, expanded])

  return (
    <div className="flex flex-col">
      {flatRows.map((row) => {
        const { node, depth, key } = row

        if (node.type === 'directory') {
          const isNodeExpanded = expanded.has(key)
          return (
            <div
              key={key}
              className="flex items-center gap-2 py-1.5 px-2 hover:bg-accent rounded cursor-pointer"
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
          )
        }

        // 파일 노드
        const viewable = isViewableFile(node.name)
        const { icon: FileIcon, color: iconColor } = getFileIcon(node.name)

        return (
          <div
            key={key}
            className="flex items-center justify-between gap-2 py-1.5 px-2 hover:bg-accent rounded"
            style={{ paddingLeft: `${depth * 16 + 24}px` }}
          >
            <div
              className={`flex items-center gap-2 flex-1 min-w-0 ${viewable ? 'cursor-pointer' : ''}`}
              onClick={() => viewable && onFileClick(node)}
            >
              <FileIcon className={`h-4 w-4 flex-shrink-0 ${iconColor}`} />
              <span className="text-sm truncate font-mono">{node.name}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {node.size !== null && (
                <TypographyMuted className="text-xs">
                  {formatFileSize(node.size)}
                </TypographyMuted>
              )}
            </div>
          </div>
        )
      })}
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
  // 패치 진행 이력 없음 확인 체크박스 — 체크해야만 삭제 진행 가능
  const [deleteAcknowledged, setDeleteAcknowledged] = useState(false)
  const [hotfixDialogOpen, setHotfixDialogOpen] = useState(false)
  const { toast } = useToast()
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

  const handleDownloadAll = () => {
    if (!version) return
    releaseApi.downloadVersion(version.versionId)
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
    deleteAcknowledged,
    setDeleteAcknowledged,
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

// 버전 헤더 카드 — 큰 VERSION 좌측 · 메타 가운데 · 액션/상태/카테고리 우측 + 하단 코멘트 통합
function VersionHeaderCard() {
  const ctx = useVersionDetailContext()
  const {
    version,
    isHotfix,
    isBuild,
    baseVersion,
    isEditingComment,
    setIsEditingComment,
    editedComment,
    setEditedComment,
    handleSaveComment,
    handleCancelEditComment,
    commentMutation,
    handleApprove,
    approveMutation,
    canApproveVersion,
    canAddVersion,
  } = ctx

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

  const hasCommentArea = Boolean(version.comment) || isEditingComment

  return (
    <div>
      {/* Hero + Meta Rail — 좌측 VERSION 큰 모노 / 가운데 vertical-rail 메타 / 우측 status pill + tags */}
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-[18px] pb-7">
        {/* 좌측 VERSION 블록 */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              {isBuild ? 'Build Version' : 'Version'}
            </span>
            {isBuild && version.buildBaseVersion && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                <Tag className="h-3 w-3" />
                base {version.buildBaseVersion}
              </span>
            )}
          </div>
          <span className="font-mono text-[34px] font-semibold tracking-[-0.8px] leading-none text-foreground">
            {version.version}
          </span>
          {(isHotfix || baseVersion) && (
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {isHotfix && (
                <Badge variant="destructive" className="h-5 text-[10px]">HOTFIX</Badge>
              )}
              {baseVersion && (
                <span className="flex items-center gap-1 text-muted-foreground text-[11px]">
                  <Tag className="h-3 w-3" />
                  기준 {baseVersion}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 가운데 메타 — 좌측 vertical rail (좌측 VERSION 블록 높이만큼 확장) */}
        <div className="self-stretch min-w-0 pl-6 border-l border-border flex flex-col justify-center gap-2.5">
          <div className="flex items-center gap-2.5 text-xs min-w-0">
            <span className="text-muted-foreground w-[42px] flex-shrink-0">생성</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1.5 cursor-default min-w-0">
                  <UserAvatar
                    email={version.createdByEmail}
                    accountName={version.createdByName}
                    avatarStyle={version.createdByAvatarStyle}
                    avatarSeed={version.createdByAvatarSeed}
                    isDeleted={version.isDeletedCreator}
                    size={22}
                  />
                  <span className={`truncate ${version.isDeletedCreator ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {version.createdByName || version.createdByEmail || '-'}
                  </span>
                </span>
              </TooltipTrigger>
              <TooltipContent>{version.isDeletedCreator ? '삭제된 사용자' : version.createdByEmail}</TooltipContent>
            </Tooltip>
            <span className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">
              · {formatDateTime(version.createdAt)}
            </span>
          </div>
          {!isBuild && (
            version.isApproved && version.approvedBy ? (
              <div className="flex items-center gap-2.5 text-xs min-w-0">
                <span className="text-muted-foreground w-[42px] flex-shrink-0">승인</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1.5 cursor-default min-w-0">
                      <UserAvatar
                        email={version.approvedBy}
                        accountName={version.approvedByName}
                        avatarStyle={version.approvedByAvatarStyle}
                        avatarSeed={version.approvedByAvatarSeed}
                        isDeleted={version.isDeletedApprover}
                        size={22}
                      />
                      <span className={`truncate ${version.isDeletedApprover ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {version.approvedByName || version.approvedBy}
                      </span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{version.isDeletedApprover ? '삭제된 사용자' : version.approvedBy}</TooltipContent>
                </Tooltip>
                {version.approvedAt && (
                  <span className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                    · {formatDateTime(version.approvedAt)}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5 text-xs">
                <span className="text-muted-foreground w-[42px] flex-shrink-0">승인</span>
                <span className="text-muted-foreground/70">미승인</span>
              </div>
            )
          )}
        </div>

        {/* 우측 액션 + status pill + tags */}
        <div className="flex flex-col items-end gap-2.5">
          {canApproveVersion && !version.isApproved && (
            <div className="flex items-center gap-1">
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
            </div>
          )}
          {!isBuild && (
            version.isApproved ? (
              <Badge variant="success" size="pill" dot>승인됨</Badge>
            ) : (
              <Badge variant="warning" size="pill" dot>미승인</Badge>
            )
          )}
          {version.fileCategories && version.fileCategories.length > 0 && (
            <div className="flex items-center gap-1">
              {version.fileCategories.map((category) => (
                <Badge
                  key={category}
                  variant={category.toLowerCase() as 'database' | 'web' | 'engine' | 'etc'}
                  size="sm"
                >
                  {getCategoryShortName(category)}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 하단 코멘트 영역 — 마진만으로 영역 분리 */}
      {hasCommentArea && (
        <div className="pt-5 pb-5">
          {/* 라벨 + 편집 버튼 한 줄 — 박스는 그 아래 전체 폭 */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-sm text-foreground">
              <FileText className="h-4 w-4" />
              <span className="font-semibold">코멘트</span>
            </div>
            {!isEditingComment && canAddVersion && (
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
            )}
          </div>
          {isEditingComment ? (
            <div className="space-y-2">
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
            <div className="rounded-lg border border-border/40 bg-muted/40 px-4 py-3.5">
              <p className="whitespace-pre-wrap text-[13px] leading-[1.65] text-foreground">
                {version.comment}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Content component
function VersionDetailContent() {
  const ctx = useVersionDetailContext()
  const { isLoading, error, fileStructure, handleDownloadAll, handleViewFile, canDownloadVersion } = ctx

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
    <div className="pt-6">
      {/* 버전 헤더 카드 — 큰 VERSION 좌측, 메타 가운데, 상태/카테고리 우측 + 코멘트 통합 */}
      <VersionHeaderCard />

      {/* 파일 — 영역 구분은 마진(pt-8)으로만 */}
      {fileStructure && (
        <div className="pt-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-sm text-foreground">
              <FolderTree className="h-4 w-4" />
              <span className="font-semibold">파일</span>
            </div>
            {hasFiles && canDownloadVersion && (
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
            )}
          </div>
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
              />
            </div>
          )}
        </div>
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
    deleteDialogOpen, setDeleteDialogOpen,
    deleteAcknowledged, setDeleteAcknowledged,
    hotfixDialogOpen, setHotfixDialogOpen,
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
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) setDeleteAcknowledged(false)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>버전 삭제 확인</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  버전 <strong>{version.version}</strong>을(를) 삭제하시겠습니까?
                  이 작업은 되돌릴 수 없으며, 모든 관련 파일이 함께 삭제됩니다.
                </p>
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  <p className="font-semibold">⚠ 패치 이력 확인 필요</p>
                  <p className="mt-1 text-destructive/90 leading-relaxed">
                    이 버전 또는 그 빌드/핫픽스가 <strong>사이트에 이미 패치된 경우</strong> 삭제 시
                    사이트 버전 추적이 어긋나 운영 관리에 큰 혼선을 줄 수 있습니다.
                    <br />
                    <strong>패치가 진행된 적이 없는 버전</strong>일 때만 삭제하세요.
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={deleteAcknowledged}
                    onChange={(e) => setDeleteAcknowledged(e.target.checked)}
                    className="h-4 w-4 cursor-pointer"
                  />
                  <span>
                    이 버전이 어떤 사이트에도 <strong>패치된 적이 없음</strong>을 확인했습니다.
                  </span>
                </label>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending || !deleteAcknowledged}
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
        {/* Content — 별도 상단 헤더 없음. 컨텐츠 카드 안에서 VERSION 표제가 헤더 역할 */}
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
