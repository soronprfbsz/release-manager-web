/**
 * MariaDB Page
 * MariaDB 백업/복원 작업 페이지 - Feature 컴포넌트를 조합하여 구성
 */

import { useState } from 'react'

import { BsDatabaseDown, BsDatabaseUp } from 'react-icons/bs'

import { BackupForm, RestoreForm } from '@/widgets/remote-jobs'

import {
  BackupFileTable,
  BackupFileDeleteModal,
  BackupLogsForm,
  type SortConfig,
  type LogViewerState,
} from '@/features/remote-jobs/mariadb'

import {
  mariadbApi,
  useBackupFiles,
  useBackupFileLogs,
  useBackupFileContent,
  useLogFileContent,
  useDeleteBackupFile,
  type BackupFile,
  type LogFile,
} from '@/entities/remote-jobs/mariadb'

import { useToast } from '@/shared/lib/hooks/use-toast'
import { Button } from '@/shared/ui/button'
import { ContentCard } from '@/shared/ui/content-layout'
import { DataTablePagination } from '@/shared/ui/data-table-pagination'
import { ErrorDisplay } from '@/shared/ui/error-display'
import { FileContentViewerModal } from '@/shared/ui/file-content-viewer'
import { PageLayout } from '@/shared/ui/page-layout'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

export function MariaDBPage() {
  const { toast } = useToast()

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
  } = useBackupFiles({
    fileCategory: 'MARIADB',
    page: pagination.pageIndex,
    size: pagination.pageSize,
  })

  const { data: fileContent, isLoading: isLoadingContent, error: contentError } = useBackupFileContent(
    selectedFile?.backupFileId || 0,
    {
      enabled: contentViewerOpen && selectedFile !== null,
    }
  )

  const { data: logsData, isLoading: isLoadingLogs, error: logsError } = useBackupFileLogs(
    logsFile?.backupFileId || 0,
    {
      enabled: logsDialogOpen && logsFile !== null,
    }
  )

  const { data: logContent, isLoading: isLoadingLogContent, error: logContentError } = useLogFileContent(
    selectedLog?.backupFileId || 0,
    selectedLog?.logFileName || '',
    {
      enabled: logViewerOpen && selectedLog !== null,
    }
  )

  const backupFiles = backupFilesResponse?.content || []
  const totalElements = backupFilesResponse?.totalElements || 0

  // Mutations
  const deleteMutation = useDeleteBackupFile({
    onSuccess: () => {
      toast({
        title: '백업 파일 삭제 완료',
        description: `${fileToDelete?.fileName} 파일이 삭제되었습니다.`,
      })
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
    mariadbApi.downloadBackupFile(file.backupFileId)
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
    mariadbApi.downloadLogFile(logsFile.backupFileId, log.logFileName)
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
      comparison = a.createdByEmail.localeCompare(b.createdByEmail)
    }

    return direction === 'asc' ? comparison : -comparison
  })

  return (
    <PageLayout
      actions={
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => setBackupDialogOpen(true)} variant="outline" size="icon">
                <BsDatabaseDown className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>백업</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => setRestoreDialogOpen(true)} variant="outline" size="icon">
                <BsDatabaseUp className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>복원</p>
            </TooltipContent>
          </Tooltip>
        </>
      }
    >
      <ContentCard>
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
              <div className="pt-6">
                <DataTablePagination
                  pageIndex={pagination.pageIndex}
                  pageSize={pagination.pageSize}
                  totalElements={totalElements}
                  onPaginationChange={setPagination}
                />
              </div>
            )}
          </>
        )}
      </ContentCard>

      {/* Backup Form */}
      <BackupForm
        open={backupDialogOpen}
        onOpenChange={setBackupDialogOpen}
        onSuccess={() => refetch()}
      />

      {/* Restore Form */}
      <RestoreForm
        open={restoreDialogOpen}
        onOpenChange={setRestoreDialogOpen}
        backupFiles={backupFiles}
        onSuccess={() => refetch()}
      />

      {/* Delete Modal */}
      <BackupFileDeleteModal
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

      {/* Logs Form */}
      <BackupLogsForm
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
            ? () => mariadbApi.downloadLogFile(selectedLog.backupFileId, selectedLog.logFileName)
            : undefined
        }
      />
    </PageLayout>
  )
}
