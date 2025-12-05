/**
 * MariaDB Job Page
 * MariaDB 백업/복원 작업 페이지 - Feature 컴포넌트를 조합하여 구성
 */

import { useState } from 'react'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Database, HardDrive, RefreshCw, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'

import { BackupDialog } from '@/widgets/job-backup-dialog'
import { RestoreDialog } from '@/widgets/job-restore-dialog'

import {
  BackupFileTable,
  BackupFileDeleteDialog,
  BackupLogsDialog,
  type SortConfig,
  type LogViewerState,
} from '@/features/backup-management'

import { jobApi, type BackupFile, type LogFile } from '@/entities/job'

import { useToast } from '@/shared/lib/hooks/use-toast'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { DataTablePagination } from '@/shared/ui/data-table-pagination'
import { ErrorDisplay } from '@/shared/ui/error-display'
import { FileContentViewerModal } from '@/shared/ui/file-content-viewer'
import { PageHeader } from '@/shared/ui/page-header'
import { TypographyMuted } from '@/shared/ui/typography'

export function MariaDBJobPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Dialog states
  const [backupDialogOpen, setBackupDialogOpen] = useState(false)
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<BackupFile | null>(null)

  // File content viewer state
  const [contentViewerOpen, setContentViewerOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<BackupFile | null>(null)

  // Logs dialog state
  const [logsDialogOpen, setLogsDialogOpen] = useState(false)
  const [logsFile, setLogsFile] = useState<BackupFile | null>(null)
  const [logViewerOpen, setLogViewerOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<LogViewerState | null>(null)

  // Pagination state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })

  // Sort state
  const [sort, setSort] = useState<SortConfig | null>({
    key: 'createdAt',
    direction: 'desc',
  })

  // Queries
  const {
    data: backupFilesResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['job-backup-files', 'MARIADB', pagination.pageIndex, pagination.pageSize],
    queryFn: () =>
      jobApi.getBackupFiles({
        fileCategory: 'MARIADB',
        page: pagination.pageIndex,
        size: pagination.pageSize,
      }),
  })

  const { data: fileContent, isLoading: isLoadingContent, error: contentError } = useQuery({
    queryKey: ['backup-file-content', selectedFile?.backupFileId],
    queryFn: () => jobApi.getBackupFileContent(selectedFile!.backupFileId),
    enabled: contentViewerOpen && selectedFile !== null,
  })

  const { data: logsData, isLoading: isLoadingLogs, error: logsError } = useQuery({
    queryKey: ['backup-file-logs', logsFile?.backupFileId],
    queryFn: () => jobApi.getBackupFileLogs(logsFile!.backupFileId),
    enabled: logsDialogOpen && logsFile !== null,
  })

  const { data: logContent, isLoading: isLoadingLogContent, error: logContentError } = useQuery({
    queryKey: ['log-file-content', selectedLog?.backupFileId, selectedLog?.logFileName],
    queryFn: () => jobApi.getLogFileContent(selectedLog!.backupFileId, selectedLog!.logFileName),
    enabled: logViewerOpen && selectedLog !== null,
  })

  const backupFiles = backupFilesResponse?.content || []
  const totalElements = backupFilesResponse?.totalElements || 0

  // Mutations
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

  // Handlers
  const handleSort = (key: string) => {
    setSort((current) => {
      if (current?.key === key) {
        return current.direction === 'asc' ? { key, direction: 'desc' } : null
      }
      return { key, direction: 'asc' }
    })
  }

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

  const handleLogsClick = (file: BackupFile) => {
    setLogsFile(file)
    setLogsDialogOpen(true)
  }

  const handleLogFileClick = (log: LogFile) => {
    if (!logsFile) return
    setSelectedLog({
      backupFileId: logsFile.backupFileId,
      logFileName: log.logFileName,
      fileSize: log.fileSize,
    })
    setLogViewerOpen(true)
  }

  const handleLogDownload = (log: LogFile) => {
    if (!logsFile) return
    jobApi.downloadLogFile(logsFile.backupFileId, log.logFileName)
  }

  // Client-side sorting
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

      {/* Backup File List Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              백업 파일 목록
            </div>
            {totalElements > 0 && <TypographyMuted>총 {totalElements}개</TypographyMuted>}
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
          ) : (
            <>
              <BackupFileTable
                files={sortedBackupList}
                sort={sort}
                isDeleting={deleteMutation.isPending}
                onSort={handleSort}
                onFileClick={handleFileClick}
                onLogsClick={handleLogsClick}
                onDownload={handleDownload}
                onDelete={handleDeleteClick}
              />
              {sortedBackupList.length > 0 && (
                <DataTablePagination
                  pageIndex={pagination.pageIndex}
                  pageSize={pagination.pageSize}
                  totalElements={totalElements}
                  onPaginationChange={setPagination}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Backup Dialog */}
      <BackupDialog
        open={backupDialogOpen}
        onOpenChange={setBackupDialogOpen}
        onSuccess={() => refetch()}
      />

      {/* Restore Dialog */}
      <RestoreDialog
        open={restoreDialogOpen}
        onOpenChange={setRestoreDialogOpen}
        backupFiles={backupFiles}
        onSuccess={() => refetch()}
      />

      {/* Delete Dialog */}
      <BackupFileDeleteDialog
        isOpen={deleteDialogOpen}
        isDeleting={deleteMutation.isPending}
        fileName={fileToDelete?.fileName || ''}
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          setDeleteDialogOpen(false)
          setFileToDelete(null)
        }}
      />

      {/* File Content Viewer */}
      <FileContentViewerModal
        open={contentViewerOpen}
        onOpenChange={setContentViewerOpen}
        fileName={selectedFile?.fileName || ''}
        content={fileContent?.content || null}
        isLoading={isLoadingContent}
        error={contentError as Error | null}
        description="SQL 백업 파일 내용"
        fileSize={selectedFile?.fileSize}
        onDownload={selectedFile ? () => handleDownload(selectedFile) : undefined}
      />

      {/* Logs Dialog */}
      <BackupLogsDialog
        isOpen={logsDialogOpen}
        fileName={logsFile?.fileName || ''}
        logFiles={logsData?.logFiles || []}
        isLoading={isLoadingLogs}
        error={logsError as Error | null}
        onLogClick={handleLogFileClick}
        onLogDownload={handleLogDownload}
        onClose={() => {
          setLogsDialogOpen(false)
          setLogsFile(null)
        }}
      />

      {/* Log Content Viewer */}
      <FileContentViewerModal
        open={logViewerOpen}
        onOpenChange={setLogViewerOpen}
        fileName={selectedLog?.logFileName || ''}
        content={logContent?.content || null}
        isLoading={isLoadingLogContent}
        error={logContentError as Error | null}
        description="로그 파일 내용"
        fileSize={selectedLog?.fileSize}
        onDownload={
          selectedLog
            ? () => jobApi.downloadLogFile(selectedLog.backupFileId, selectedLog.logFileName)
            : undefined
        }
      />
    </div>
  )
}
