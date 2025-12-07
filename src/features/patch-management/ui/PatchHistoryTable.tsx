/**
 * Patch History Table Component
 * 패치 이력 테이블 컴포넌트
 */

import { ArrowRight, Calendar, Download, FileText, Layers, User } from 'lucide-react'

import type { CumulativePatch } from '@/entities/patch'

import { formatDateTime } from '@/shared/lib/utils/date'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { DataTable } from '@/shared/ui/data-table'
import { DataTablePagination } from '@/shared/ui/data-table-pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { TypographyInlineCode, TypographyMuted } from '@/shared/ui/typography'

interface PaginationState {
  pageIndex: number
  pageSize: number
}

interface PatchHistoryTableProps {
  patches: CumulativePatch[]
  totalElements: number
  pagination: PaginationState
  isLoading: boolean
  onPaginationChange: (pagination: PaginationState) => void
  onDownload: (patch: CumulativePatch) => void
}

export function PatchHistoryTable({
  patches,
  totalElements,
  pagination,
  isLoading,
  onPaginationChange,
  onDownload,
}: PatchHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (patches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <Layers className="h-12 w-12 mb-3 opacity-50" />
        <TypographyMuted>생성된 패치가 없습니다.</TypographyMuted>
        <TypographyMuted>패치 생성 메뉴에서 패치를 생성해보세요.</TypographyMuted>
      </div>
    )
  }

  return (
    <>
      <DataTable>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">번호</TableHead>
              <TableHead className="w-48">패치명</TableHead>
              <TableHead className="w-48">버전 범위</TableHead>
              <TableHead className="w-24 text-center">릴리즈</TableHead>
              <TableHead className="w-32">생성자</TableHead>
              <TableHead className="w-32">담당 엔지니어</TableHead>
              <TableHead className="w-48">생성일시</TableHead>
              <TableHead className="w-20 text-center">다운로드</TableHead>
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
                    <TypographyInlineCode className="bg-transparent">
                      {patch.patchName}
                    </TypographyInlineCode>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <TypographyInlineCode className="bg-transparent">
                      {patch.fromVersion}
                    </TypographyInlineCode>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <TypographyInlineCode className="bg-transparent font-medium">
                      {patch.toVersion}
                    </TypographyInlineCode>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">
                    {patch.releaseType === 'STANDARD' ? '표준' : patch.customerCode || '커스텀'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <User className="h-3 w-3 text-muted-foreground" />
                    {patch.createdBy}
                  </div>
                </TableCell>
                <TableCell>
                  {patch.engineerName ? (
                    <div className="flex items-center gap-1 text-sm">
                      <User className="h-3 w-3 text-muted-foreground" />
                      {patch.engineerName}
                    </div>
                  ) : (
                    <TypographyMuted>-</TypographyMuted>
                  )}
                </TableCell>
                <TableCell>
                  <TypographyMuted className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDateTime(patch.createdAt)}
                  </TypographyMuted>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDownload(patch)}
                    title="다운로드"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>
      <div className="pt-4">
        <DataTablePagination
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          totalElements={totalElements}
          onPaginationChange={onPaginationChange}
        />
      </div>
    </>
  )
}
