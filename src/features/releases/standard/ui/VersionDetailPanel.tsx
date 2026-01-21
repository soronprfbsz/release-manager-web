import { useState, useMemo, createContext, useContext } from 'react'

import { FileText, File, Download, Folder, FolderOpen, ChevronRight, ChevronDown, CheckCircle2, TableOfContents, Tag, Info, FolderTree, Pencil, X, Check } from 'lucide-react'

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

import { usePermission } from '@/shared/lib/hooks/use-permission'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { useFileTransferProgress } from '@/shared/lib/hooks/use-file-transfer-progress'
import { useProjectStore } from '@/shared/store'
import { formatDateTime } from '@/shared/lib/utils/date'
import { formatFileSize } from '@/shared/lib/utils/format'
import { UserAvatar } from '@/shared/ui/user-avatar'
import { base64ToBlob, base64ToText, isPdfFile as checkIsPdfFile, isImageFile as checkIsImageFile } from '@/shared/lib/utils/file-content'
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
import { FileContentViewerModal } from '@/shared/ui/file-content-viewer'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Textarea } from '@/shared/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { TypographyMuted, TypographySmall } from '@/shared/ui/typography'

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
}

interface VersionDetailPanelProps {
  version: SelectedVersionData | null
  /** 핫픽스 여부 */
  isHotfix?: boolean
  onDelete?: () => void
  /** 기준 표준본 버전 (커스텀 릴리즈의 경우) */
  baseVersion?: string | null
}

// Context for compound components
interface VersionDetailContextValue {
  version: SelectedVersionData
  isHotfix: boolean
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
  // File content
  textContent: string | null
  blobData: Blob | null
  isPdfFile: boolean
  isImageFile: boolean
  isLoadingContent: boolean
  contentError: Error | null
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

interface FileNodeProps {
  node: ReleaseFileNode
  level: number
  onFileClick: (node: ReleaseFileNode) => void
  onDownload: (node: ReleaseFileNode) => void
  canDownload: boolean
}

function FileNode({ node, level, onFileClick, onDownload, canDownload }: FileNodeProps) {
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
          className="flex items-center gap-2 py-1.5 px-2 hover:bg-accent rounded cursor-pointer"
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
            {sortedChildren.map((child: ReleaseFileNode, index: number) => (
              <FileNode
                key={`${child.path}-${index}`}
                node={child}
                level={level + 1}
                onFileClick={onFileClick}
                onDownload={onDownload}
                canDownload={canDownload}
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
    fileName.endsWith('.bat') || fileName.endsWith('.ps1') || fileName.endsWith('.env') ||
    fileName.endsWith('.pdf') ||
    fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') ||
    fileName.endsWith('.gif') || fileName.endsWith('.webp') || fileName.endsWith('.bmp') || fileName.endsWith('.ico')

  return (
    <div
      className="flex items-center justify-between gap-2 py-1.5 px-2 hover:bg-accent rounded"
      style={{ paddingLeft: `${level * 16 + 24}px` }}
    >
      <div
        className={`flex items-center gap-2 flex-1 min-w-0 ${isViewableFile ? 'cursor-pointer' : ''}`}
        onClick={() => isViewableFile && onFileClick(node)}
      >
        <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm truncate">
          {node.name}
        </span>
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
  )
}

// Provider component that manages all state
function VersionDetailProvider({
  version,
  isHotfix = false,
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
    const fileName = node.name.toLowerCase()
    const viewableExtensions = ['.sql', '.sh', '.md', '.txt', '.log', '.json', '.xml',
      '.yml', '.yaml', '.ini', '.conf', '.properties', '.bat', '.ps1', '.env', '.pdf',
      '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.ico']

    if (viewableExtensions.some(ext => fileName.endsWith(ext))) {
      setSelectedFile({ id: node.releaseFileId, filePath: node.filePath, name: node.name, size: node.size ?? undefined })
      setFileViewerOpen(true)
    }
  }

  // PDF/이미지 파일 여부 확인
  const isPdfFile = selectedFile ? checkIsPdfFile(selectedFile.name) : false
  const isImageFile = selectedFile ? checkIsImageFile(selectedFile.name) : false

  // 모든 파일 내용 조회 (통합 API 사용)
  const { data: fileContentData, isLoading: isLoadingContent, error: contentError } = useReleaseFileContent(
    selectedFile?.filePath ?? '',
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

  const blobData = binaryBlob

  const textContent = useMemo(() => {
    if (isPdfFile || isImageFile) return null
    if (fileContentData?.isBinary) return decodedTextContent
    return fileContentData?.content || null
  }, [fileContentData, isPdfFile, isImageFile, decodedTextContent])

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
    textContent,
    blobData,
    isPdfFile,
    isImageFile,
    isLoadingContent,
    contentError: contentError as Error | null,
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
  const { version, isHotfix, baseVersion } = ctx

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
          canApproveVersion && !version.isApproved && (
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
          )
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
            <div>
              {[...fileStructure.files.children!].sort((a, b) => {
                if (a.type === 'directory' && b.type === 'file') return -1
                if (a.type === 'file' && b.type === 'directory') return 1
                return a.name.localeCompare(b.name)
              }).map((node, index) => (
                <FileNode
                  key={`${node.path}-${index}`}
                  node={node}
                  level={0}
                  onFileClick={handleViewFile}
                  onDownload={handleDownload}
                  canDownload={canDownloadVersion}
                />
              ))}
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
    version, isHotfix, projectId, onDelete,
    fileViewerOpen, setFileViewerOpen, selectedFile,
    deleteDialogOpen, setDeleteDialogOpen, hotfixDialogOpen, setHotfixDialogOpen,
    deleteMutation, handleDeleteConfirm, handleDownloadSelectedFile, canDownloadVersion,
    textContent, blobData, isPdfFile, isImageFile, isLoadingContent, contentError,
  } = ctx

  return (
    <>
      {/* File Content Viewer Modal */}
      <FileContentViewerModal
        open={fileViewerOpen}
        onOpenChange={setFileViewerOpen}
        fileName={selectedFile?.name || ''}
        content={textContent}
        isLoading={isLoadingContent && !isPdfFile && !isImageFile}
        error={!isPdfFile && !isImageFile ? contentError : null}
        description="파일 내용"
        fileSize={selectedFile?.size}
        onDownload={handleDownloadSelectedFile}
        canDownload={canDownloadVersion}
        pdfBlob={isPdfFile ? blobData : null}
        isPdfLoading={isPdfFile && isLoadingContent}
        pdfError={isPdfFile ? contentError : null}
        imageBlob={isImageFile ? blobData : null}
        isImageLoading={isImageFile && isLoadingContent}
        imageError={isImageFile ? contentError : null}
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

      {/* Hotfix Create Form */}
      {!isHotfix && (
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
export function VersionDetailPanel({ version, isHotfix = false, onDelete, baseVersion }: VersionDetailPanelProps) {
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
    <VersionDetailProvider version={version} isHotfix={isHotfix} onDelete={onDelete} baseVersion={baseVersion}>
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
