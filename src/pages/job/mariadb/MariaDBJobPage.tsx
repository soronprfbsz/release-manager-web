import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Database,
  Download,
  RefreshCw,
  Calendar,
  FileText,
  Trash2,
  RotateCcw,
  HardDrive,
  User,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, SortableTableHead } from '@/shared/ui/table'
import { DataTable } from '@/shared/ui/data-table'
import { DataTablePagination } from '@/shared/ui/data-table-pagination'
import { TruncatedCell } from '@/shared/ui/truncated-cell'
import { TypographyInlineCode, TypographyMuted } from '@/shared/ui/typography'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { jobApi, type BackupFile } from '@/entities/job'
import { ErrorDisplay } from '@/shared/ui/error-display'
import { BackupDialog } from '@/widgets/job-backup-dialog'
import { RestoreDialog } from '@/widgets/job-restore-dialog'
import { FileContentViewerModal } from '@/shared/ui/file-content-viewer'
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

export function MariaDBJobPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // 다이얼로그 상태
  const [backupDialogOpen, setBackupDialogOpen] = useState(false)
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<BackupFile | null>(null)

  // 파일 내용 조회 상태
  const [contentViewerOpen, setContentViewerOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<BackupFile | null>(null)

  // 페이징 상태
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })

  // 정렬 상태
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({
    key: 'createdAt',
    direction: 'desc',
  })

  // 백업 파일 목록 조회 (MariaDB 카테고리만)
  const { data: backupFilesResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['job-backup-files', 'MARIADB', pagination.pageIndex, pagination.pageSize],
    queryFn: () => jobApi.getBackupFiles({
      fileCategory: 'MARIADB',
      page: pagination.pageIndex,
      size: pagination.pageSize
    }),
  })

  const backupFiles = backupFilesResponse?.content || []
  const totalElements = backupFilesResponse?.totalElements || 0

  // 백업 파일 삭제 뮤테이션
  const deleteMutation = useMutation({
    mutationFn: (id: number) => jobApi.deleteBackupFile(id),
    onSuccess: () => {
      toast({
        title: '백업 파일 삭제 완료',
        description: `${fileToDelete?.fileName} 파일이 삭제되었습니다.`,
      })
      queryClient.invalidateQueries({ queryKey: ['job-backup-files'] })
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
    jobApi.downloadBackupFile(file.backupFileId, file.fileName)
  }

  const handleDeleteClick = (file: BackupFile) => {
    setFileToDelete(file)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (fileToDelete) {
      deleteMutation.mutate(fileToDelete.backupFileId)
    }
  }

  const handleFileClick = (file: BackupFile) => {
    setSelectedFile(file)
    setContentViewerOpen(true)
  }

  const handleSort = (key: string) => {
    setSort((current) => {
      if (current?.key === key) {
        return current.direction === 'asc'
          ? { key, direction: 'desc' }
          : null
      }
      return { key, direction: 'asc' }
    })
  }

  const handlePaginationChange = (newPagination: { pageIndex: number; pageSize: number }) => {
    setPagination(newPagination)
  }

  // 파일 내용 조회
  const { data: fileContent, isLoading: isLoadingContent, error: contentError } = useQuery({
    queryKey: ['backup-file-content', selectedFile?.backupFileId],
    queryFn: () => jobApi.getBackupFileContent(selectedFile!.backupFileId),
    enabled: contentViewerOpen && selectedFile !== null,
  })

  // 정렬된 백업 파일 목록 (클라이언트 사이드 정렬)
  const sortedBackupList = [...backupFiles].sort((a, b) => {
    if (!sort) return 0
    const { key, direction } = sort
    let comparison = 0

    if (key === 'rowNumber') {
      comparison = a.rowNumber - b.rowNumber
    } else if (key === 'fileName') {
      comparison = a.fileName.localeCompare(b.fileName)
    } else if (key === 'fileSize') {
      comparison = a.fileSize - b.fileSize
    } else if (key === 'createdAt') {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    } else if (key === 'createdBy') {
      comparison = a.createdBy.localeCompare(b.createdBy)
    }

    return direction === 'asc' ? comparison : -comparison
  })

  const backupList = sortedBackupList

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
            <BreadcrumbPage>작업 관리</BreadcrumbPage>
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
        title="MariaDB 작업"
        description="MariaDB 백업 및 복원 작업을 수행합니다."
        actions={
          <>
            <Button onClick={() => refetch()} variant="outline" size="icon" title="새로고침">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => setBackupDialogOpen(true)} variant="outline">
              <Database className="h-4 w-4" />
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
            {totalElements > 0 && (
              <TypographyMuted>
                총 {totalElements}개
              </TypographyMuted>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <>
              <DataTable>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableTableHead
                        id="rowNumber"
                        currentSort={sort}
                        onSort={handleSort}
                        className="w-16 text-center"
                      >
                        No
                      </SortableTableHead>
                      <SortableTableHead
                        id="fileName"
                        currentSort={sort}
                        onSort={handleSort}
                      >
                        파일명
                      </SortableTableHead>
                      <SortableTableHead
                        id="fileSize"
                        currentSort={sort}
                        onSort={handleSort}
                        className="w-28"
                      >
                        파일 크기
                      </SortableTableHead>
                      <SortableTableHead
                        id="createdBy"
                        currentSort={sort}
                        onSort={handleSort}
                        className="w-48"
                      >
                        생성자
                      </SortableTableHead>
                      <SortableTableHead
                        id="createdAt"
                        currentSort={sort}
                        onSort={handleSort}
                        className="w-44"
                      >
                        생성일시
                      </SortableTableHead>
                      <TableHead className="w-24 text-center">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backupList.map((file) => (
                      <TableRow key={file.backupFileId}>
                        <TableCell className="text-center">
                          <TypographyMuted>{file.rowNumber}</TypographyMuted>
                        </TableCell>
                        <TableCell>
                          <div
                            className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                            onClick={() => handleFileClick(file)}
                          >
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <TruncatedCell tooltipText={file.fileName}>
                              <TypographyInlineCode className="bg-transparent truncate">{file.fileName}</TypographyInlineCode>
                            </TruncatedCell>
                          </div>
                        </TableCell>
                        <TableCell>
                          <TypographyMuted>{file.fileSizeFormatted}</TypographyMuted>
                        </TableCell>
                        <TableCell>
                          <TruncatedCell
                            tooltipText={file.createdBy}
                            className="flex items-center gap-1 text-muted-foreground"
                          >
                            <User className="h-3 w-3 flex-shrink-0" />
                            <span className="text-sm truncate">{file.createdBy}</span>
                          </TruncatedCell>
                        </TableCell>
                        <TableCell>
                          <TruncatedCell
                            tooltipText={formatDateTime(file.createdAt)}
                            className="flex items-center gap-1 text-muted-foreground"
                          >
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="text-sm whitespace-nowrap">{formatDateTime(file.createdAt)}</span>
                          </TruncatedCell>
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

              {/* 페이징 */}
              <DataTablePagination
                pageIndex={pagination.pageIndex}
                pageSize={pagination.pageSize}
                totalElements={totalElements}
                onPaginationChange={handlePaginationChange}
              />
            </>
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
        backupFiles={backupFiles}
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

      {/* 파일 내용 조회 모달 */}
      <FileContentViewerModal
        open={contentViewerOpen}
        onOpenChange={setContentViewerOpen}
        fileName={selectedFile?.fileName || ''}
        content={fileContent?.content || null}
        isLoading={isLoadingContent}
        error={contentError as Error | null}
        description="SQL 백업 파일 내용"
      />
    </div>
  )
}
