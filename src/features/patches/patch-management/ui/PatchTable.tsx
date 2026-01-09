/**
 * Patch Table Component
 * 패치 목록 테이블 컴포넌트
 */

import {
  ArrowRight,
  Calendar,
  Download,
  Eye,
  FileText,
  Tag,
  Trash2,
  User,
  type LucideIcon,
} from 'lucide-react'

import type { CumulativePatch } from '@/entities/patches/patch'

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
import { TruncatedCell } from '@/shared/ui/truncated-cell'
import { TypographyInlineCode, TypographyMuted } from '@/shared/ui/typography'

import type { SortConfig } from '../model/types'

interface PatchTableProps {
  patches: CumulativePatch[]
  sort: SortConfig | null
  isDeleting?: boolean
  showDelete?: boolean
  onSort: (key: string) => void
  onViewFiles: (patch: CumulativePatch) => void
  onDownload: (patch: CumulativePatch) => void
  onDelete: (patch: CumulativePatch) => void
  /** 뷰포트 기반 동적 높이 (e.g. "calc(100vh - 27rem)") */
  viewportHeight?: string
  /** EmptyState에 사용할 아이콘 */
  emptyIcon?: LucideIcon
}

export function PatchTable({
  patches,
  sort,
  isDeleting,
  showDelete = true,
  onSort,
  onViewFiles,
  onDownload,
  onDelete,
  viewportHeight,
  emptyIcon: EmptyIcon = Tag,
}: PatchTableProps) {
  if (patches.length === 0) {
    return (
      <EmptyState
        icon={EmptyIcon}
        title="생성된 패치가 없습니다."
        description="패치 생성 버튼을 눌러 새 패치를 생성하세요."
      />
    )
  }

  return (
    <DataTable viewportHeight={viewportHeight}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">No</TableHead>
            <SortableTableHead
              className="w-48"
              id="patchName"
              currentSort={sort}
              onSort={onSort}
            >
              패치명
            </SortableTableHead>
            <TableHead className="w-28">버전 범위</TableHead>
            <SortableTableHead
              className="w-28"
              id="customerName"
              currentSort={sort}
              onSort={onSort}
            >
              고객사
            </SortableTableHead>
            <SortableTableHead
              className="w-40"
              id="engineerName"
              currentSort={sort}
              onSort={onSort}
            >
              담당 엔지니어
            </SortableTableHead>
            <SortableTableHead
              className="w-44"
              id="createdBy"
              currentSort={sort}
              onSort={onSort}
            >
              생성자
            </SortableTableHead>
            <TableHead className="w-40">설명</TableHead>
            <SortableTableHead
              className="w-40"
              id="createdAt"
              currentSort={sort}
              onSort={onSort}
            >
              생성일시
            </SortableTableHead>
            <TableHead className="w-12 text-center"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patches.map((patch) => (
            <TableRow key={patch.patchId}>
              <TableCell className="text-center text-muted-foreground">
                {patch.rowNumber}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <TypographyInlineCode className="bg-transparent font-normal">
                    {patch.patchName}
                  </TypographyInlineCode>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <TypographyInlineCode className="bg-transparent text-xs">
                    {patch.fromVersion}
                  </TypographyInlineCode>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <TypographyInlineCode className="bg-transparent text-xs font-medium">
                    {patch.toVersion}
                  </TypographyInlineCode>
                </div>
              </TableCell>
              <TableCell>
                {patch.customerName ? (
                  <div className="text-sm">
                    <div>{patch.customerName}</div>
                    <TypographyMuted className="text-xs">
                      ({patch.customerCode})
                    </TypographyMuted>
                  </div>
                ) : (
                  <TypographyMuted className="text-sm">-</TypographyMuted>
                )}
              </TableCell>
              <TableCell>
                {patch.engineerName ? (
                  <TruncatedCell
                    tooltipText={patch.engineerName}
                    className="flex items-center gap-1 text-sm"
                  >
                    <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span>{patch.engineerName}</span>
                  </TruncatedCell>
                ) : (
                  <TypographyMuted className="text-sm">-</TypographyMuted>
                )}
              </TableCell>
              <TableCell>
                <TruncatedCell
                  tooltipText={patch.createdByEmail}
                  className="flex items-center gap-1 text-sm"
                >
                  <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span>{patch.createdByEmail}</span>
                </TruncatedCell>
              </TableCell>
              <TableCell>
                {patch.description ? (
                  <TruncatedCell
                    tooltipText={patch.description}
                    maxLines={2}
                    className="text-sm text-muted-foreground"
                  >
                    {patch.description}
                  </TruncatedCell>
                ) : (
                  <TypographyMuted className="text-sm">-</TypographyMuted>
                )}
              </TableCell>
              <TableCell>
                <TruncatedCell
                  tooltipText={formatDateTime(patch.createdAt)}
                  className="flex items-center gap-1 text-muted-foreground"
                >
                  <Calendar className="h-3 w-3 flex-shrink-0" />
                  <span className="text-sm">{formatDateTime(patch.createdAt)}</span>
                </TruncatedCell>
              </TableCell>
              <TableCell>
                <TableActionMenu>
                  <TableActionMenuItem onClick={() => onViewFiles(patch)}>
                    <Eye className="mr-2 h-4 w-4" />
                    파일 보기
                  </TableActionMenuItem>
                  <TableActionMenuItem onClick={() => onDownload(patch)}>
                    <Download className="mr-2 h-4 w-4" />
                    다운로드
                  </TableActionMenuItem>
                  {showDelete && (
                    <>
                      <TableActionMenuSeparator />
                      <TableActionMenuItem
                        onClick={() => onDelete(patch)}
                        disabled={isDeleting}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        삭제
                      </TableActionMenuItem>
                    </>
                  )}
                </TableActionMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataTable>
  )
}
