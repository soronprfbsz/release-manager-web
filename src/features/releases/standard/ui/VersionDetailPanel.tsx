import { useState, useMemo } from 'react'

import { Calendar, User, FileText, File, Download, Info, Trash2, Folder, FolderOpen, ChevronRight, ChevronDown, CheckCircle2, GitBranch, Flame } from 'lucide-react'

import {
  releaseApi,
  useVersionFileStructure,
  useReleaseFileContent,
  useDeleteVersion,
  useApproveVersion,
  type ReleaseFileNode,
} from '@/entities/releases/release'

import { usePermission } from '@/shared/lib/hooks/use-permission'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { useProjectStore } from '@/shared/store'
import { formatDateTime } from '@/shared/lib/utils/date'
import { formatFileSize } from '@/shared/lib/utils/format'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { ErrorDisplay } from '@/shared/ui/error-display'
import { FileContentViewerModal } from '@/shared/ui/file-content-viewer'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { TypographyMuted, TypographySmall } from '@/shared/ui/typography'

import { HotfixCreateForm } from './HotfixCreateForm'

/** 버전 정보 (트리에서 선택된 정보) */
export interface SelectedVersionData {
  versionId: number
  version: string
  createdAt: string
  createdBy: string
  comment: string
  releaseCategory?: 'INSTALL' | 'PATCH'
  fileCategories: string[]
  isApproved: boolean
  approvedBy: string | null
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

interface FileNodeProps {
  node: ReleaseFileNode
  level: number
  onFileClick: (node: ReleaseFileNode) => void
  onDownload: (node: ReleaseFileNode) => void
}

function FileNode({ node, level, onFileClick, onDownload }: FileNodeProps) {
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
            {sortedChildren.map((child: ReleaseFileNode, index: number) => (
              <FileNode
                key={`${child.path}-${index}`}
                node={child}
                level={level + 1}
                onFileClick={onFileClick}
                onDownload={onDownload}
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
      className="flex items-center justify-between gap-2 py-1.5 px-2 hover:bg-muted/50 rounded"
      style={{ paddingLeft: `${level * 16 + 24}px` }}
    >
      <div
        className={`flex items-center gap-2 flex-1 min-w-0 ${isViewableFile ? 'cursor-pointer' : ''}`}
        onClick={() => isViewableFile && onFileClick(node)}
      >
        <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className={`text-sm truncate ${isViewableFile ? 'hover:text-primary transition-colors' : ''}`}>
          {node.name}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {node.size !== null && (
          <TypographyMuted className="text-xs">
            {formatFileSize(node.size)}
          </TypographyMuted>
        )}
        {node.releaseFileId && (
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

export function VersionDetailPanel({ version, isHotfix = false, onDelete, baseVersion }: VersionDetailPanelProps) {
  const [fileViewerOpen, setFileViewerOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<{ id: number; name: string; size?: number } | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [hotfixDialogOpen, setHotfixDialogOpen] = useState(false)
  const { toast } = useToast()
  const { canDeleteVersion, canApproveVersion, canAddVersion } = usePermission()
  const projectId = useProjectStore((state) => state.projectId)

  // 파일 트리 구조 조회
  const { data: fileStructure, isLoading, error } = useVersionFileStructure(version?.versionId ?? 0)

  const deleteMutation = useDeleteVersion()
  const approveMutation = useApproveVersion()

  const handleApprove = () => {
    if (!version) return

    approveMutation.mutate(version.versionId, {
      onSuccess: () => {
        toast({
          title: '버전 승인 완료',
          description: `버전 ${version.version}이(가) 승인되었습니다.`,
        })
      },
      onError: (error: Error) => {
        toast({
          title: '버전 승인 실패',
          description: error instanceof Error ? error.message : '버전 승인 중 오류가 발생했습니다.',
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
      onError: (error) => {
        toast({
          title: '버전 삭제 실패',
          description: error instanceof Error ? error.message : '버전 삭제 중 오류가 발생했습니다.',
          variant: 'destructive',
        })
      },
    })
  }

  const handleDownload = (node: ReleaseFileNode) => {
    if (!node.releaseFileId) return
    releaseApi.downloadFile(node.releaseFileId, node.name)
  }

  const handleViewFile = (node: ReleaseFileNode) => {
    if (!node.releaseFileId) return
    const fileName = node.name.toLowerCase()
    const viewableExtensions = ['.sql', '.sh', '.md', '.txt', '.log', '.json', '.xml',
      '.yml', '.yaml', '.ini', '.conf', '.properties', '.bat', '.ps1', '.env', '.pdf']

    if (viewableExtensions.some(ext => fileName.endsWith(ext))) {
      setSelectedFile({ id: node.releaseFileId, name: node.name, size: node.size ?? undefined })
      setFileViewerOpen(true)
    }
  }

  // PDF/이미지 파일 여부 확인
  const isPdfFile = selectedFile ? checkIsPdfFile(selectedFile.name) : false
  const isImageFile = selectedFile ? checkIsImageFile(selectedFile.name) : false

  // 모든 파일 내용 조회 (통합 API 사용)
  const { data: fileContentData, isLoading: isLoadingContent, error: contentError } = useReleaseFileContent(
    selectedFile?.id ?? 0,
    fileViewerOpen && selectedFile !== null
  )

  // isBinary가 true이면서 PDF/이미지인 경우 Blob으로 변환
  const binaryBlob = useMemo(() => {
    if (!fileContentData?.isBinary || !fileContentData?.content) return null
    if (!isPdfFile && !isImageFile) return null // PDF/이미지만 Blob 변환
    return base64ToBlob(fileContentData.content, fileContentData.mimeType)
  }, [fileContentData, isPdfFile, isImageFile])

  // isBinary가 true이면서 텍스트 파일인 경우 텍스트로 디코딩
  const decodedTextContent = useMemo(() => {
    if (!fileContentData?.isBinary || !fileContentData?.content) return null
    if (isPdfFile || isImageFile) return null // PDF/이미지가 아닌 경우만 텍스트 변환
    return base64ToText(fileContentData.content)
  }, [fileContentData, isPdfFile, isImageFile])

  // 바이너리 파일용 데이터 (PDF/이미지)
  const blobData = binaryBlob

  // 텍스트 콘텐츠 결정: isBinary가 true이면 디코딩된 텍스트, 아니면 원본 content
  const textContent = useMemo(() => {
    if (isPdfFile || isImageFile) return null
    if (fileContentData?.isBinary) return decodedTextContent
    return fileContentData?.content || null
  }, [fileContentData, isPdfFile, isImageFile, decodedTextContent])

  const handleDownloadSelectedFile = () => {
    if (selectedFile) {
      releaseApi.downloadFile(selectedFile.id, selectedFile.name)
    }
  }

  const handleDownloadAll = () => {
    if (!version) return
    const fileName = `release-${version.version}.zip`
    releaseApi.downloadVersion(version.versionId, fileName)
  }

  if (!version) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-26rem)] text-muted-foreground">
        <FileText className="h-12 w-12 mb-2 opacity-50" />
        <TypographyMuted>버전을 선택하면 상세 정보가 표시됩니다.</TypographyMuted>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-26rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorDisplay
        title="버전 정보를 불러오는 중 오류가 발생했습니다."
        error={error}
        className="h-full"
      />
    )
  }

  const hasFiles = fileStructure?.files?.children && fileStructure.files.children.length > 0

  return (
    <>
      <div className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  기본 정보
                </CardTitle>
                {isHotfix && (
                  <Badge variant="destructive" className="h-5 text-xs">HOTFIX</Badge>
                )}
                {version.isApproved ? (
                  <Badge variant="default" className="h-5 text-xs">승인됨</Badge>
                ) : (
                  <Badge variant="outline" className="h-5 text-xs border-yellow-500 text-yellow-600 dark:text-yellow-500">미승인</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* 핫픽스 생성 버튼 - 핫픽스가 아닌 일반 버전에서만 표시 */}
                {canAddVersion && !isHotfix && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setHotfixDialogOpen(true)}
                      >
                        <Flame className="h-4 w-4 text-orange-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>핫픽스 생성</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {canApproveVersion && !version.isApproved && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleApprove}
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>승인하기</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {canDeleteVersion && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDeleteDialogOpen(true)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>삭제</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <TypographyMuted className="text-sm">생성자:</TypographyMuted>
                <TypographySmall>{version.createdBy || '-'}</TypographySmall>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <TypographyMuted className="text-sm">생성일시:</TypographyMuted>
                <TypographySmall>{formatDateTime(version.createdAt)}</TypographySmall>
              </div>
              {version.isApproved && version.approvedBy && (
                <>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <TypographyMuted className="text-sm">승인자:</TypographyMuted>
                    <TypographySmall>{version.approvedBy}</TypographySmall>
                  </div>
                  {version.approvedAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <TypographyMuted className="text-sm">승인일시:</TypographyMuted>
                      <TypographySmall>{formatDateTime(version.approvedAt)}</TypographySmall>
                    </div>
                  )}
                </>
              )}
              {baseVersion && (
                <div className="flex items-center gap-2 col-span-2">
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                  <TypographyMuted className="text-sm">기준 표준본:</TypographyMuted>
                  <TypographySmall>{baseVersion}</TypographySmall>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Patch Notes / Comment */}
        {version.comment && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                코멘트
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm">
                {version.comment}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Release Files - Tree Structure */}
        {fileStructure && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <File className="h-4 w-4" />
                  파일
                </CardTitle>
                {hasFiles && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleDownloadAll}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>전체 다운로드</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!hasFiles ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <File className="h-8 w-8 mb-2 opacity-50" />
                  <TypographyMuted>등록된 릴리즈 파일이 없습니다.</TypographyMuted>
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
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* File Content Viewer Modal */}
        <FileContentViewerModal
          open={fileViewerOpen}
          onOpenChange={setFileViewerOpen}
          fileName={selectedFile?.name || ''}
          content={textContent}
          isLoading={isLoadingContent && !isPdfFile && !isImageFile}
          error={!isPdfFile && !isImageFile ? (contentError as Error | null) : null}
          description="파일 내용"
          fileSize={selectedFile?.size}
          onDownload={handleDownloadSelectedFile}
          pdfBlob={isPdfFile ? blobData : null}
          isPdfLoading={isPdfFile && isLoadingContent}
          pdfError={isPdfFile ? (contentError as Error | null) : null}
          imageBlob={isImageFile ? blobData : null}
          isImageLoading={isImageFile && isLoadingContent}
          imageError={isImageFile ? (contentError as Error | null) : null}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>버전 삭제 확인</AlertDialogTitle>
            <AlertDialogDescription>
              버전 <strong>{version?.version}</strong>을(를) 삭제하시겠습니까?
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
      {version && !isHotfix && (
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
