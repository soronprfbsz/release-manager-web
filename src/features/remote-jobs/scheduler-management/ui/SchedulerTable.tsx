/**
 * Scheduler Table Component
 * 스케줄러 목록 테이블 컴포넌트
 */

import {
  Calendar,
  Edit2,
  History,
  Play,
  Power,
  Trash2,
} from 'lucide-react'

import type { ScheduleJob } from '@/entities/remote-jobs'

import { formatDateTime } from '@/shared/lib/utils/date'
import { DataTable } from '@/shared/ui/data-table'
import { EmptyState } from '@/shared/ui/empty-state'
import { StatusBadge } from '@/shared/ui/status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import {
  TableActionMenu,
  TableActionMenuItem,
  TableActionMenuSeparator,
} from '@/shared/ui/table-action-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { TypographyInlineCode, TypographyMuted } from '@/shared/ui/typography'

interface SchedulerTableProps {
  jobs: ScheduleJob[]
  isLoading?: boolean
  onEdit: (job: ScheduleJob) => void
  onDelete: (job: ScheduleJob) => void
  onToggle: (job: ScheduleJob) => void
  onExecute: (job: ScheduleJob) => void
  onViewHistory: (job: ScheduleJob) => void
}

export function SchedulerTable({
  jobs,
  isLoading,
  onEdit,
  onDelete,
  onToggle,
  onExecute,
  onViewHistory,
}: SchedulerTableProps) {
  if (!isLoading && jobs.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="등록된 스케줄이 없습니다."
        description="새 스케줄 추가 버튼을 눌러 스케줄을 등록하세요."
      />
    )
  }

  return (
    <DataTable autoHeight>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20 text-center">상태</TableHead>
            <TableHead className="w-48">Job 이름</TableHead>
            <TableHead className="w-28">그룹</TableHead>
            <TableHead className="w-40">Cron 표현식</TableHead>
            <TableHead className="w-24 text-center">HTTP</TableHead>
            <TableHead className="min-w-[200px]">API URL</TableHead>
            <TableHead className="w-44">마지막 실행</TableHead>
            <TableHead className="w-44">다음 실행</TableHead>
            <TableHead className="w-12 text-center"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.jobId}>
              <TableCell className="text-center">
                <StatusBadge variant={job.isEnabled ? 'active' : 'inactive'}>
                  {job.isEnabled ? '활성' : '비활성'}
                </StatusBadge>
              </TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="font-medium truncate block max-w-[180px] cursor-default">
                      {job.jobName}
                    </span>
                  </TooltipTrigger>
                  {job.description && (
                    <TooltipContent>
                      <p className="max-w-[300px]">{job.description}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TableCell>
              <TableCell>
                <TypographyInlineCode className="bg-muted/50 text-xs">
                  {job.jobGroup}
                </TypographyInlineCode>
              </TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded cursor-default">
                      {job.cronExpression}
                    </code>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Timezone: {job.timezone}</p>
                  </TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell className="text-center">
                <StatusBadge
                  variant={
                    job.httpMethod === 'GET'
                      ? 'info'
                      : job.httpMethod === 'POST'
                      ? 'success'
                      : job.httpMethod === 'DELETE'
                      ? 'error'
                      : 'warning'
                  }
                >
                  {job.httpMethod}
                </StatusBadge>
              </TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm truncate block cursor-default">
                      {job.apiUrl}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-[400px] break-all">{job.apiUrl}</p>
                  </TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {job.lastExecutedAt ? (
                  <TypographyMuted className="text-xs">
                    {formatDateTime(job.lastExecutedAt)}
                  </TypographyMuted>
                ) : (
                  <TypographyMuted>-</TypographyMuted>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {job.nextExecutionAt ? (
                  <TypographyMuted className="text-xs">
                    {formatDateTime(job.nextExecutionAt)}
                  </TypographyMuted>
                ) : (
                  <TypographyMuted>-</TypographyMuted>
                )}
              </TableCell>
              <TableCell>
                <TableActionMenu>
                  <TableActionMenuItem onClick={() => onEdit(job)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    수정
                  </TableActionMenuItem>
                  <TableActionMenuItem onClick={() => onToggle(job)}>
                    <Power className="mr-2 h-4 w-4" />
                    {job.isEnabled ? '비활성화' : '활성화'}
                  </TableActionMenuItem>
                  <TableActionMenuSeparator />
                  <TableActionMenuItem onClick={() => onExecute(job)}>
                    <Play className="mr-2 h-4 w-4" />
                    즉시 실행
                  </TableActionMenuItem>
                  <TableActionMenuItem onClick={() => onViewHistory(job)}>
                    <History className="mr-2 h-4 w-4" />
                    실행 이력
                  </TableActionMenuItem>
                  <TableActionMenuSeparator />
                  <TableActionMenuItem
                    onClick={() => onDelete(job)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    삭제
                  </TableActionMenuItem>
                </TableActionMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataTable>
  )
}
