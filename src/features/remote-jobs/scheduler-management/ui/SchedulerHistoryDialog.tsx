/**
 * Scheduler History Dialog Component
 * 스케줄러 실행 이력 조회 다이얼로그
 */

import { useState } from 'react'

import { AlertCircle, CheckCircle2, ChevronDown, ChevronRight, Clock, Loader2, XCircle } from 'lucide-react'

import type { ScheduleJob, ScheduleJobHistory, JobExecutionStatus } from '@/entities/remote-jobs'
import { useScheduleJobHistories } from '@/entities/remote-jobs'

import { formatDateTime } from '@/shared/lib/utils/date'
import { Button } from '@/shared/ui/button'
import { DataTablePagination } from '@/shared/ui/data-table-pagination'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { StatusBadge } from '@/shared/ui/status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { TypographyMuted } from '@/shared/ui/typography'

interface SchedulerHistoryDialogProps {
  job: ScheduleJob | null
  onClose: () => void
}

function getStatusVariant(status: JobExecutionStatus): 'success' | 'error' | 'warning' | 'info' {
  switch (status) {
    case 'SUCCESS':
      return 'success'
    case 'FAILED':
      return 'error'
    case 'TIMEOUT':
      return 'warning'
    case 'RUNNING':
      return 'info'
    default:
      return 'info'
  }
}

function getStatusIcon(status: JobExecutionStatus) {
  switch (status) {
    case 'SUCCESS':
      return <CheckCircle2 className="h-3 w-3" />
    case 'FAILED':
      return <XCircle className="h-3 w-3" />
    case 'TIMEOUT':
      return <AlertCircle className="h-3 w-3" />
    case 'RUNNING':
      return <Loader2 className="h-3 w-3 animate-spin" />
    default:
      return <Clock className="h-3 w-3" />
  }
}

function HistoryDetailRow({ history }: { history: ScheduleJobHistory }) {
  const [isOpen, setIsOpen] = useState(false)
  const hasDetails = history.responseBody || history.errorMessage

  return (
    <>
      <TableRow className={hasDetails ? 'cursor-pointer hover:bg-muted/50' : ''}>
        <TableCell className="whitespace-nowrap">
          <TypographyMuted className="text-xs">
            {history.startedAt ? formatDateTime(history.startedAt) : '-'}
          </TypographyMuted>
        </TableCell>
        <TableCell>
          <StatusBadge variant={getStatusVariant(history.status)} className="gap-1">
            {getStatusIcon(history.status)}
            {history.status}
          </StatusBadge>
        </TableCell>
        <TableCell className="text-center">
          {history.responseCode ? (
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
              {history.responseCode}
            </code>
          ) : (
            <TypographyMuted>-</TypographyMuted>
          )}
        </TableCell>
        <TableCell className="text-right">
          <TypographyMuted className="text-xs">
            {history.executionTimeMs != null ? `${history.executionTimeMs.toLocaleString()}ms` : '-'}
          </TypographyMuted>
        </TableCell>
        <TableCell className="text-center">
          <TypographyMuted className="text-xs">
            {history.attemptNumber != null ? `#${history.attemptNumber}` : '-'}
          </TypographyMuted>
        </TableCell>
        <TableCell className="text-center">
          {hasDetails && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <ChevronDown className="h-3 w-3 mr-1" />
              ) : (
                <ChevronRight className="h-3 w-3 mr-1" />
              )}
              {isOpen ? '접기' : '상세'}
            </Button>
          )}
        </TableCell>
      </TableRow>
      {hasDetails && isOpen && (
        <TableRow className="bg-muted/30">
          <TableCell colSpan={6} className="py-3">
            <div className="space-y-2 text-sm">
              {history.errorMessage && (
                <div>
                  <span className="font-medium text-red-600">Error:</span>
                  <pre className="mt-1 p-2 bg-red-50 dark:bg-red-950/30 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                    {history.errorMessage}
                  </pre>
                </div>
              )}
              {history.responseBody && (
                <div>
                  <span className="font-medium">Response:</span>
                  <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto whitespace-pre-wrap max-h-[200px]">
                    {history.responseBody}
                  </pre>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

export function SchedulerHistoryDialog({
  job,
  onClose,
}: SchedulerHistoryDialogProps) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const { data, isLoading } = useScheduleJobHistories(
    job?.jobId ?? 0,
    { page: pagination.pageIndex, size: pagination.pageSize },
    job !== null
  )

  const histories = data?.content ?? []
  const totalElements = data?.totalElements ?? 0

  return (
    <Dialog open={job !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>실행 이력</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{job?.jobName}</span>{' '}
            스케줄의 실행 이력을 조회합니다.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : histories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
              <Clock className="h-8 w-8 mb-2" />
              <p>실행 이력이 없습니다.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-44">실행 시간</TableHead>
                  <TableHead className="w-28">상태</TableHead>
                  <TableHead className="w-20 text-center">응답 코드</TableHead>
                  <TableHead className="w-28 text-right">실행 시간</TableHead>
                  <TableHead className="w-20 text-center">시도</TableHead>
                  <TableHead className="w-16 text-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {histories.map((history) => (
                  <HistoryDetailRow key={history.historyId} history={history} />
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>

        {totalElements > 0 && (
          <div className="border-t pt-4">
            <DataTablePagination
              pageIndex={pagination.pageIndex}
              pageSize={pagination.pageSize}
              totalElements={totalElements}
              onPaginationChange={setPagination}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
