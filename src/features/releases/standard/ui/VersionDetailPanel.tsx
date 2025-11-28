import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Calendar, User, FileText, HardDrive, File, Download, Info, Trash2, Folder, ChevronRight, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { TypographyMuted, TypographySmall } from '@/shared/ui/typography'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { releaseApi, type VersionNode, type ReleaseFileNode } from '@/entities/release'
import { SqlViewerModal } from '@/widgets/sql-viewer-modal'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { ErrorDisplay } from '@/shared/ui/error-display'
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

interface VersionDetailPanelProps {
  version: VersionNode | null
  onDelete?: () => void
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}



function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface FileNodeProps {
  node: ReleaseFileNode
  level: number
  onFileClick: (node: ReleaseFileNode) => void
  onDownload: (node: ReleaseFileNode) => void
  downloadingFiles: Set<number>
}

function FileNode({ node, level, onFileClick, onDownload, downloadingFiles }: FileNodeProps) {
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
          <Folder className="h-4 w-4 text-blue-500" />
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
                downloadingFiles={downloadingFiles}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  const fileName = node.name.toLowerCase()
  const isViewableFile = fileName.endsWith('.sql') || fileName.endsWith('.sh') || fileName.endsWith('.md')

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
            disabled={downloadingFiles.has(node.releaseFileId!)}
          >
            {downloadingFiles.has(node.releaseFileId!) ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" />
            ) : (
              <Download className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

export function VersionDetailPanel({ version, onDelete }: VersionDetailPanelProps) {
  const [downloadingFiles, setDownloadingFiles] = useState<Set<number>>(new Set())
  const [downloadingAll, setDownloadingAll] = useState(false)
  const [sqlViewerOpen, setSqlViewerOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<{ id: number; name: string } | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { toast } = useToast()

  // 파일 트리 구조 조회
  const { data: fileStructure, isLoading, error } = useQuery({
    queryKey: ['release-file-structure', version?.versionId],
    queryFn: () => releaseApi.getVersionFileStructure(version!.versionId),
    enabled: !!version,
  })

  const deleteMutation = useMutation({
    mutationFn: () => releaseApi.deleteVersion(version!.versionId),
    onSuccess: () => {
      toast({
        title: '버전 삭제 완료',
        description: `버전 ${version?.version}이(가) 삭제되었습니다.`,
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

  const handleDownload = async (node: ReleaseFileNode) => {
    if (!node.releaseFileId) return

    setDownloadingFiles((prev) => new Set(prev).add(node.releaseFileId!))

    try {
      await releaseApi.downloadFile(node.releaseFileId, node.name)
      toast({
        title: '다운로드 완료',
        description: `${node.name} 파일이 다운로드되었습니다.`,
      })
    } catch (error) {
      toast({
        title: '다운로드 실패',
        description: '파일 다운로드 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setDownloadingFiles((prev) => {
        const next = new Set(prev)
        next.delete(node.releaseFileId!)
        return next
      })
    }
  }

  const handleViewFile = (node: ReleaseFileNode) => {
    if (!node.releaseFileId) return
    const fileName = node.name.toLowerCase()
    if (fileName.endsWith('.sql') || fileName.endsWith('.sh') || fileName.endsWith('.md')) {
      setSelectedFile({ id: node.releaseFileId, name: node.name })
      setSqlViewerOpen(true)
    }
  }

  const handleDownloadAll = async () => {
    if (!version) return

    setDownloadingAll(true)
    try {
      await releaseApi.downloadVersion(version.versionId, `release-${version.version}.zip`)
      toast({
        title: '다운로드 완료',
        description: `버전 ${version.version}의 모든 파일이 다운로드되었습니다.`,
      })
    } catch (error) {
      toast({
        title: '다운로드 실패',
        description: '버전 다운로드 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setDownloadingAll(false)
    }
  }

  if (!version) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <FileText className="h-12 w-12 mb-2 opacity-50" />
        <TypographyMuted>버전을 선택하면 상세 정보가 표시됩니다.</TypographyMuted>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
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
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4" />
                기본 정보
              </CardTitle>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <TypographyMuted className="text-sm">버전 ID:</TypographyMuted>
                <TypographySmall>{version.versionId}</TypographySmall>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <TypographyMuted className="text-sm">생성자:</TypographyMuted>
                <TypographySmall>{version.createdBy || '-'}</TypographySmall>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <TypographyMuted className="text-sm">생성일시:</TypographyMuted>
                <TypographySmall>{formatDateTime(version.createdAt)}</TypographySmall>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patch Notes / Comment */}
        {version.comment && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                패치 노트
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-md p-4 whitespace-pre-wrap text-sm">
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
                  릴리즈 파일
                </CardTitle>
                {hasFiles && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleDownloadAll}
                    disabled={downloadingAll}
                  >
                    {downloadingAll ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
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
                <ScrollArea className="h-[400px] w-full rounded-md border p-2">
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
                        downloadingFiles={downloadingFiles}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        )}

        {/* SQL Viewer Modal */}
        <SqlViewerModal
          open={sqlViewerOpen}
          onOpenChange={setSqlViewerOpen}
          fileId={selectedFile?.id || null}
          fileName={selectedFile?.name || ''}
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
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
