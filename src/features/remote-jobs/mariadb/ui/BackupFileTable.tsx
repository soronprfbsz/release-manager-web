/**
 * Backup File Table Component
 * 백업 파일 목록 테이블 컴포넌트
 */

import {
  Calendar,
  Download,
  FileText,
  HardDrive,
  ScrollText,
  Trash2,
} from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { UserAvatar } from '@/shared/ui/user-avatar'

import type { BackupFile } from '@/entities/remote-jobs/mariadb'

import { formatDateTime } from '@/shared/lib/utils/date'
import { DataTable } from '@/shared/ui/data-table'
import { EmptyState } from '@/shared/ui/empty-state'
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
  TableActionMenuSeparator,
} from '@/shared/ui/table-action-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { TruncatedCell } from '@/shared/ui/truncated-cell'
import { TypographyInlineCode, TypographyMuted } from '@/shared/ui/typography'

import type { SortConfig } from '../model/types'

interface BackupFileTableProps {
  files: BackupFile[]
  sort: SortConfig | null
  isDeleting?: boolean
  onSort: (key: string) => void
  onFileClick: (file: BackupFile) => void
  onLogsClick: (file: BackupFile) => void
  onDownload: (file: BackupFile) => void
  onDelete: (file: BackupFile) => void
}

export function BackupFileTable({
  files,
  sort,
  isDeleting,
  onSort,
  onFileClick,
  onLogsClick,
  onDownload,
  onDelete,
}: BackupFileTableProps) {
  if (files.length === 0) {
    return (
      <EmptyState
        icon={HardDrive}
        title="백업 파일이 없습니다."
        description="백업 실행 버튼을 눌러 새 백업을 생성하세요."
      />
    )
  }

  return (
    <DataTable>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 text-right">No</TableHead>
            <SortableTableHead
              id="fileName"
              currentSort={sort}
              onSort={onSort}
              className="min-w-[22rem] w-40"
            >
              파일명
            </SortableTableHead>
            <SortableTableHead
              id="description"
              currentSort={sort}
              onSort={onSort}
            >
              설명
            </SortableTableHead>
            <SortableTableHead
              id="fileSize"
              currentSort={sort}
              onSort={onSort}
              className="w-32"
            >
              파일 크기
            </SortableTableHead>
            <SortableTableHead
              id="createdBy"
              currentSort={sort}
              onSort={onSort}
              className="w-56"
            >
              생성자
            </SortableTableHead>
            <SortableTableHead
              id="createdAt"
              currentSort={sort}
              onSort={onSort}
              className="w-44"
            >
              생성일시
            </SortableTableHead>
            <TableHead className="w-12 text-center"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.backupFileId}>
              <TableCell className="text-right">
                <TypographyMuted>{file.rowNumber}</TypographyMuted>
              </TableCell>
              <TableCell>
                <div
                  className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors max-w-[200px]"
                  onClick={() => onFileClick(file)}
                >
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <TruncatedCell tooltipText={file.fileName}>
                    <TypographyInlineCode className="bg-transparent truncate block w-full">
                      {file.fileName}
                    </TypographyInlineCode>
                  </TruncatedCell>
                </div>
              </TableCell>
              <TableCell>
                {file.description ? (
                  <TruncatedCell
                    tooltipText={file.description}
                    className="text-sm text-muted-foreground"
                  >
                    {file.description}
                  </TruncatedCell>
                ) : (
                  <TypographyMuted className="text-sm">-</TypographyMuted>
                )}
              </TableCell>
              <TableCell>
                <TypographyMuted>{file.fileSizeFormatted}</TypographyMuted>
              </TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 cursor-default">
                      <UserAvatar
                        email={file.createdByEmail}
                        avatarStyle={file.createdByAvatarStyle}
                        avatarSeed={file.createdByAvatarSeed}
                        isDeleted={file.isDeletedCreator}
                        size={28}
                      />
                      <span className={cn('text-sm', file.isDeletedCreator && 'text-muted-foreground')}>
                        {file.createdByName || file.createdByEmail}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {file.isDeletedCreator ? '삭제된 사용자' : file.createdByEmail}
                  </TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell>
                <TruncatedCell
                  tooltipText={formatDateTime(file.createdAt)}
                  className="flex items-center gap-1 text-muted-foreground"
                >
                  <Calendar className="h-3 w-3 flex-shrink-0" />
                  <span className="text-sm whitespace-nowrap">
                    {formatDateTime(file.createdAt)}
                  </span>
                </TruncatedCell>
              </TableCell>
              <TableCell>
                <TableActionMenu>
                  <TableActionMenuItem onClick={() => onLogsClick(file)}>
                    <ScrollText className="mr-2 h-4 w-4" />
                    로그 조회
                  </TableActionMenuItem>
                  <TableActionMenuItem onClick={() => onDownload(file)}>
                    <Download className="mr-2 h-4 w-4" />
                    다운로드
                  </TableActionMenuItem>
                  <TableActionMenuSeparator />
                  <TableActionMenuItem
                    onClick={() => onDelete(file)}
                    disabled={isDeleting}
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
