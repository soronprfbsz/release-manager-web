import { useState } from 'react'
import { Calendar, User, FileText, Database, HardDrive, CheckCircle, Clock, File, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { releaseApi } from '@/shared/api/releaseApi'
import type { VersionNode, ReleaseVersionDetail, ReleaseFileSimple } from '@/shared/api/types'

interface VersionDetailPanelProps {
  version: VersionNode | null
  detail: ReleaseVersionDetail | null
  isLoading: boolean
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
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

function groupFilesByDatabase(files: ReleaseFileSimple[]): Record<string, ReleaseFileSimple[]> {
  return files.reduce((acc, file) => {
    const dbType = file.databaseTypeName || 'UNKNOWN'
    if (!acc[dbType]) {
      acc[dbType] = []
    }
    acc[dbType].push(file)
    return acc
  }, {} as Record<string, ReleaseFileSimple[]>)
}

export function VersionDetailPanel({ version, detail, isLoading }: VersionDetailPanelProps) {
  const [downloadingFiles, setDownloadingFiles] = useState<Set<number>>(new Set())
  const { toast } = useToast()

  const handleDownload = async (file: ReleaseFileSimple) => {
    setDownloadingFiles((prev) => new Set(prev).add(file.releaseFileId))

    try {
      await releaseApi.downloadFile(file.releaseFileId, file.fileName)
      toast({
        title: '다운로드 완료',
        description: `${file.fileName} 파일이 다운로드되었습니다.`,
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
        next.delete(file.releaseFileId)
        return next
      })
    }
  }

  if (!version) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <FileText className="h-12 w-12 mb-2 opacity-50" />
        <p className="text-sm">버전을 선택하면 상세 정보가 표시됩니다.</p>
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

  const groupedFiles = detail ? groupFilesByDatabase(detail.releaseFiles) : {}

  return (
    <div className="space-y-6">
        {/* Version Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{version.version}</h2>
          {version.isInstall && (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              설치본
            </Badge>
          )}
        </div>

        <Separator />

        {/* Basic Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">생성자:</span>
                <span className="text-sm font-medium">{version.createdBy || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">생성일:</span>
                <span className="text-sm font-medium">{formatDate(version.createdAt)}</span>
              </div>
            </div>
            {detail && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">버전 ID:</span>
                  <span className="text-sm font-medium">{detail.releaseVersionId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">수정일:</span>
                  <span className="text-sm font-medium">{formatDateTime(detail.updatedAt)}</span>
                </div>
              </div>
            )}
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

        {/* Database Files */}
        {detail && detail.releaseFiles.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-4 w-4" />
                릴리즈 파일 ({detail.releaseFiles.length}개)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(groupedFiles).map(([dbType, files]) => (
                <div key={dbType}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={`font-mono ${
                        dbType === 'MARIADB'
                          ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400'
                          : dbType === 'CRATEDB'
                          ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400'
                          : ''
                      }`}
                    >
                      {dbType}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{files.length}개 파일</span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16 text-center">순서</TableHead>
                        <TableHead>파일명</TableHead>
                        <TableHead className="w-24 text-right">크기</TableHead>
                        <TableHead className="w-24 text-center">다운로드</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {files
                        .sort((a, b) => a.executionOrder - b.executionOrder)
                        .map((file) => (
                        <TableRow key={file.releaseFileId}>
                          <TableCell className="text-center text-sm text-muted-foreground">
                            {file.executionOrder}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <File className="h-4 w-4 text-muted-foreground" />
                              <span className="font-mono text-sm">{file.fileName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {formatFileSize(file.fileSize)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(file)}
                              disabled={downloadingFiles.has(file.releaseFileId)}
                            >
                              {downloadingFiles.has(file.releaseFileId) ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Quick File Overview (from tree data) */}
        {version.databases.length > 0 && !detail && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-4 w-4" />
                파일 목록
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {version.databases.map((db) => (
                <div key={db.databaseType}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="font-mono">
                      {db.databaseType}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{db.files.length}개 파일</span>
                  </div>
                  <div className="bg-muted/50 rounded-md p-3 space-y-1">
                    {db.files.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <File className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* No files message */}
        {detail && detail.releaseFiles.length === 0 && version.databases.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <File className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">등록된 릴리즈 파일이 없습니다.</p>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  )
}
