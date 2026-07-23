/**
 * Site Table Component
 * 사이트 목록 테이블 컴포넌트
 */

import {
  Building2,
  Edit2,
  Trash2,
  Check,
} from 'lucide-react'

import type { Site } from '@/entities/sites'

import { formatDateShort } from '@/shared/lib/utils/date'
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
  TableActionMenuSeparator,
} from '@/shared/ui/table-action-menu'
import { TypographyInlineCode, TypographyMuted } from '@/shared/ui/typography'


interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

interface SiteTableProps {
  sites: Site[]
  sort: SortConfig | null
  onSort: (key: string) => void
  onEdit: (site: Site) => void
  onDelete: (siteId: number) => void
}

export function SiteTable({
  sites,
  sort,
  onSort,
  onEdit,
  onDelete,
}: SiteTableProps) {
  if (sites.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="등록된 사이트가 없습니다."
        description="사이트 생성 버튼을 눌러 새 사이트를 추가하세요."
      />
    )
  }

  return (
    <DataTable autoHeight>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 text-right">No</TableHead>
            <TableHead className="w-20 text-center">상태</TableHead>
            <SortableTableHead
              id="siteCode"
              currentSort={sort}
              onSort={onSort}
              className="w-36"
            >
              사이트 코드
            </SortableTableHead>
            <SortableTableHead
              id="siteName"
              currentSort={sort}
              onSort={onSort}
              className="w-64"
            >
              사이트명
            </SortableTableHead>
            <TableHead>설명</TableHead>
            <SortableTableHead
              id="projectName"
              currentSort={sort}
              onSort={onSort}
              className="w-36"
            >
              프로젝트명
            </SortableTableHead>
            <SortableTableHead
              id="hasCustomVersion"
              currentSort={sort}
              onSort={onSort}
              className="w-28 text-center"
            >
              커스텀 여부
            </SortableTableHead>
            <SortableTableHead
              id="lastPatchedVersion"
              currentSort={sort}
              onSort={onSort}
              className="w-48"
            >
              최종 패치 버전
            </SortableTableHead>
            <SortableTableHead
              id="lastPatchedAt"
              currentSort={sort}
              onSort={onSort}
              className="w-40"
            >
              최종 패치일
            </SortableTableHead>
            <TableHead className="w-12 text-center"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sites.map((site) => (
            <TableRow key={site.siteId}>
              <TableCell className="text-right text-muted-foreground">
                {site.rowNumber}
              </TableCell>
              <TableCell className="text-center">
                <StatusBadge variant={site.isActive ? 'active' : 'inactive'}>
                  {site.isActive ? '활성' : '비활성'}
                </StatusBadge>
              </TableCell>
              <TableCell>
                <TypographyInlineCode className="bg-transparent font-normal">
                  {site.siteCode}
                </TypographyInlineCode>
              </TableCell>
              <TableCell className="font-medium">{site.siteName}</TableCell>
              <TableCell>
                <TypographyMuted className="truncate">
                  {site.description || '-'}
                </TypographyMuted>
              </TableCell>
              <TableCell>
                {site.project ? (
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-muted">
                    {site.project.projectName}
                  </span>
                ) : (
                  <TypographyMuted>-</TypographyMuted>
                )}
              </TableCell>
              <TableCell className="text-center">
                {site.hasCustomVersion && (
                  <Check className="h-4 w-4 mx-auto text-green-600" />
                )}
              </TableCell>
              <TableCell>
                {site.project?.lastPatchedVersion ? (
                  <span className="text-sm font-mono">{site.project.lastPatchedVersion}</span>
                ) : (
                  <TypographyMuted>-</TypographyMuted>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {site.project?.lastPatchedAt ? (
                  <TypographyMuted>{formatDateShort(site.project.lastPatchedAt)}</TypographyMuted>
                ) : (
                  <TypographyMuted>-</TypographyMuted>
                )}
              </TableCell>
              <TableCell>
                <TableActionMenu>
                  <TableActionMenuItem onClick={() => onEdit(site)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    수정
                  </TableActionMenuItem>
                  <TableActionMenuSeparator />
                  <TableActionMenuItem
                    onClick={() => onDelete(site.siteId)}
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
