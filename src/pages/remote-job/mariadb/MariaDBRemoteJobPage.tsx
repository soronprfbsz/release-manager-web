import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Database,
  Download,
  RefreshCw,
  Calendar,
  FileText,
  Trash2,
  Upload,
  RotateCcw,
  HardDrive,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { PageHeader } from '@/shared/ui/page-header'
import { Link } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { DataTable } from '@/shared/ui/data-table'
import { TypographyMuted } from '@/shared/ui/typography'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { remoteJobApi, type BackupFile } from '@/entities/remote-job'
import { ErrorDisplay } from '@/shared/ui/error-display'
import { BackupDialog } from '@/widgets/remote-job-backup-dialog'
import { RestoreDialog } from '@/widgets/remote-job-restore-dialog'
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

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export function MariaDBRemoteJobPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // 다이얼로그 상태
  const [backupDialogOpen, setBackupDialogOpen] = useState(false)
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<BackupFile | null>(null)

  // 백업 파일 목록 조회
  const { data: backupFiles, isLoading, error, refetch } = useQuery({
    queryKey: ['remote-job-backup-files'],
    queryFn: remoteJobApi.getBackupList,
  })

  // 백업 파일 삭제 뮤테이션
  const deleteMutation = useMutation({
    mutationFn: (fileName: string) => remoteJobApi.deleteBackup(fileName),
    onSuccess: () => {
      toast({
        title: '백업 파일 삭제 완료',
        description: `${fileToDelete?.fileName} 파일이 삭제되었습니다.`,
      })
      queryClient.invalidateQueries({ queryKey: ['remote-job-backup-files'] })
      setDeleteDialogOpen(false)
      setFileToDelete(null)
    },
    onError: (error: Error) => {
      toast({
        title: '백업 파일 삭제 실패',
        description: error.message || '파일 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    },
  })

  const handleDownload = (file: BackupFile) => {
    remoteJobApi.downloadBackup(file.fileName)
  }

  const handleDeleteClick = (file: BackupFile) => {
    setFileToDelete(file)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (fileToDelete) {
      deleteMutation.mutate(fileToDelete.fileName)
    }
  }

  const backupList = backupFiles || []

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>원격 작업 관리</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>MariaDB 백업 및 복원</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <PageHeader
        icon={<Database className="h-5 w-5 text-primary" />}
        title="MariaDB 원격 작업"
        description="원격 MariaDB 백업 및 복원 작업을 수행합니다."
        actions={
          <>
            <Button onClick={() => refetch()} variant="outline" size="icon" title="새로고침">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => setBackupDialogOpen(true)} variant="outline">
              <Upload className="h-4 w-4" />
              백업 실행
            </Button>
            <Button onClick={() => setRestoreDialogOpen(true)} variant="outline">
              <RotateCcw className="h-4 w-4" />
              복원 실행
            </Button>
          </>
        }
      />

      {/* 백업 파일 목록 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              백업 파일 목록
            </div>
            {backupList.length > 0 && (
              <TypographyMuted>
                총 {backupList.length}개
              </TypographyMuted>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : error ? (
            <ErrorDisplay
              title="백업 파일 목록을 불러오는 중 오류가 발생했습니다."
              error={error as Error}
              onRetry={refetch}
            />
          ) : backupList.length > 0 ? (
            <DataTable>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-64">파일명</TableHead>
                    <TableHead className="w-32">파일 크기</TableHead>
                    <TableHead className="w-56">생성일시</TableHead>
                    <TableHead className="w-24 text-center">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backupList.map((file) => (
                    <TableRow key={file.fileName}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-sm">{file.fileName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <TypographyMuted>{formatFileSize(file.fileSizeBytes)}</TypographyMuted>
                      </TableCell>
                      <TableCell>
                        <TypographyMuted className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateTime(file.createdAt)}
                        </TypographyMuted>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(file)}
                            title="다운로드"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(file)}
                            disabled={deleteMutation.isPending}
                            title="삭제"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DataTable>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <HardDrive className="h-12 w-12 mb-3 opacity-50" />
              <TypographyMuted>백업 파일이 없습니다.</TypographyMuted>
              <TypographyMuted>"백업 실행" 버튼을 눌러 새 백업을 생성해보세요.</TypographyMuted>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 백업 다이얼로그 */}
      <BackupDialog
        open={backupDialogOpen}
        onOpenChange={setBackupDialogOpen}
        onSuccess={() => refetch()}
      />

      {/* 복원 다이얼로그 */}
      <RestoreDialog
        open={restoreDialogOpen}
        onOpenChange={setRestoreDialogOpen}
        onSuccess={() => refetch()}
      />

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>백업 파일 삭제 확인</AlertDialogTitle>
            <AlertDialogDescription>
              백업 파일 <strong>{fileToDelete?.fileName}</strong>을(를) 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
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
    </div>
  )
}
