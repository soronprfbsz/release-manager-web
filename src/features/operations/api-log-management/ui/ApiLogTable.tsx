/**
 * API Log Table Component
 * API 로그 목록 테이블 컴포넌트
 */

import { FileText, Eye } from 'lucide-react'

import type { ApiLogListItem } from '@/entities/operations/api-log'

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
  SortableTableHead,
} from '@/shared/ui/table'
import {
  TableActionMenu,
  TableActionMenuItem,
} from '@/shared/ui/table-action-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { TypographyMuted } from '@/shared/ui/typography'
import { UserAvatar } from '@/shared/ui/user-avatar'

import type { SortConfig } from '../model/types'

interface ApiLogTableProps {
  logs: ApiLogListItem[]
  sort: SortConfig | null
  onSort: (key: string) => void
  onViewDetail: (log: ApiLogListItem) => void
}

function getStatusVariant(status: number): 'success' | 'error' | 'warning' | 'info' {
  if (status >= 200 && status < 300) return 'success'
  if (status >= 400 && status < 500) return 'warning'
  if (status >= 500) return 'error'
  return 'info'
}

function getMethodVariant(method: string): 'success' | 'error' | 'warning' | 'info' {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'info'
    case 'POST':
      return 'success'
    case 'PUT':
    case 'PATCH':
      return 'warning'
    case 'DELETE':
      return 'error'
    default:
      return 'info'
  }
}

export function ApiLogTable({
  logs,
  sort,
  onSort,
  onViewDetail,
}: ApiLogTableProps) {
  if (logs.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="API 로그가 없습니다."
        description="조건에 맞는 API 로그가 없습니다."
      />
    )
  }

  return (
    <DataTable autoHeight>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 text-right">No</TableHead>
            <SortableTableHead
              id="createdAt"
              currentSort={sort}
              onSort={onSort}
              className="w-44"
            >
              요청일시
            </SortableTableHead>
            <SortableTableHead
              id="httpMethod"
              currentSort={sort}
              onSort={onSort}
              className="w-24 text-center"
            >
              메서드
            </SortableTableHead>
            <SortableTableHead
              id="requestUri"
              currentSort={sort}
              onSort={onSort}
            >
              요청 URI
            </SortableTableHead>
            <SortableTableHead
              id="responseStatus"
              currentSort={sort}
              onSort={onSort}
              className="w-32 text-center"
            >
              상태코드
            </SortableTableHead>
            <SortableTableHead
              id="accountEmail"
              currentSort={sort}
              onSort={onSort}
              className="w-48"
            >
              사용자
            </SortableTableHead>
            <SortableTableHead
              id="clientIp"
              currentSort={sort}
              onSort={onSort}
              className="w-36"
            >
              클라이언트 IP
            </SortableTableHead>
            <SortableTableHead
              id="executionTimeMs"
              currentSort={sort}
              onSort={onSort}
              className="w-28 text-right"
            >
              실행시간
            </SortableTableHead>
            <TableHead className="w-12 text-center"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.logId}>
              <TableCell className="text-right text-muted-foreground">
                {log.rowNumber}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <TypographyMuted>{formatDateTime(log.createdAt)}</TypographyMuted>
              </TableCell>
              <TableCell className="text-center">
                <StatusBadge variant={getMethodVariant(log.httpMethod)}>
                  {log.httpMethod}
                </StatusBadge>
              </TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="truncate block cursor-default">
                      {log.requestUri}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-[400px] break-all">{log.requestUri}</p>
                  </TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell className="text-center">
                <StatusBadge variant={getStatusVariant(log.responseStatus)}>
                  {log.responseStatus}
                </StatusBadge>
              </TableCell>
              <TableCell>
                {log.accountEmail ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 cursor-default">
                        <UserAvatar
                          email={log.accountEmail}
                          accountName={log.accountName}
                          avatarStyle={log.avatarStyle}
                          avatarSeed={log.avatarSeed}
                          size={24}
                        />
                        <span className="text-sm truncate max-w-[120px]">
                          {log.accountName || log.accountEmail}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{log.accountEmail}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <TypographyMuted>-</TypographyMuted>
                )}
              </TableCell>
              <TableCell>
                {log.clientIp || <TypographyMuted>-</TypographyMuted>}
              </TableCell>
              <TableCell className="text-right">
                {log.executionTimeMs != null ? (
                  <TypographyMuted>{log.executionTimeMs.toLocaleString()}ms</TypographyMuted>
                ) : (
                  <TypographyMuted>-</TypographyMuted>
                )}
              </TableCell>
              <TableCell>
                <TableActionMenu>
                  <TableActionMenuItem onClick={() => onViewDetail(log)}>
                    <Eye className="mr-2 h-4 w-4" />
                    상세보기
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
