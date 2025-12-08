import { useState } from 'react'

import { useMutation, useQuery } from '@tanstack/react-query'
import { Calendar, User, FileText, File, Download, Info, Trash2, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react'

import { releaseApi, type VersionNode, type ReleaseFileNode } from '@/entities/release'

import { useToast } from '@/shared/lib/hooks/use-toast'
import { formatDateTime } from '@/shared/lib/utils/date'
import { formatFileSize } from '@/shared/lib/utils/format'
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
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { ErrorDisplay } from '@/shared/ui/error-display'
import { FileContentViewerModal } from '@/shared/ui/file-content-viewer'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { TypographyMuted, TypographySmall } from '@/shared/ui/typography'

interface VersionDetailPanelProps {
  version: VersionNode | null
  onDelete?: () => void
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
    fileName.endsWith('.bat') || fileName.endsWith('.ps1') || fileName.endsWith('.env')

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

export function VersionDetailPanel({ version, onDelete }: VersionDetailPanelProps) {
  const [fileViewerOpen, setFileViewerOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<{ id: number; name: string; size?: number } | null>(null)
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

  const handleDownload = (node: ReleaseFileNode) => {
    if (!node.releaseFileId) return
    releaseApi.downloadFile(node.releaseFileId, node.name)
  }

  const handleViewFile = (node: ReleaseFileNode) => {
    if (!node.releaseFileId) return
    const fileName = node.name.toLowerCase()
    const viewableExtensions = ['.sql', '.sh', '.md', '.txt', '.log', '.json', '.xml',
      '.yml', '.yaml', '.ini', '.conf', '.properties', '.bat', '.ps1', '.env']

    if (viewableExtensions.some(ext => fileName.endsWith(ext))) {
      setSelectedFile({ id: node.releaseFileId, name: node.name, size: node.size ?? undefined })
      setFileViewerOpen(true)
    }
  }

  // 파일 내용 조회
  const { data: fileContent, isLoading: isLoadingContent, error: contentError } = useQuery({
    queryKey: ['release-file-content', selectedFile?.id],
    queryFn: () => releaseApi.getFileContent(selectedFile!.id),
    enabled: fileViewerOpen && selectedFile !== null,
  })

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
                  파일
                </CardTitle>
                {hasFiles && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleDownloadAll}
                  >
                    <Download className="h-4 w-4" />
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
                <div className="space-y-4">
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
                        />
                      ))}
                    </div>
                  </ScrollArea>
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
          content={fileContent || null}
          isLoading={isLoadingContent}
          error={contentError as Error | null}
          description="파일 내용"
          fileSize={selectedFile?.size}
          onDownload={handleDownloadSelectedFile}
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
