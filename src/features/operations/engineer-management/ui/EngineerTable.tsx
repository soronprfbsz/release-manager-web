/**
 * Engineer Table Component
 * 엔지니어 목록 테이블 컴포넌트
 */

import {
  Users,
  Edit2,
  Trash2,
  Mail,
} from 'lucide-react'

import type { Engineer } from '@/entities/operations'

import { formatDateShort } from '@/shared/lib/utils/date'
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
import { TypographyMuted } from '@/shared/ui/typography'

interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

interface EngineerTableProps {
  engineers: Engineer[]
  sort: SortConfig | null
  onSort: (key: string) => void
  onEdit: (engineer: Engineer) => void
  onDelete: (engineerId: number) => void
}

export function EngineerTable({
  engineers,
  sort,
  onSort,
  onEdit,
  onDelete,
}: EngineerTableProps) {
  if (engineers.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="등록된 엔지니어가 없습니다."
        description="엔지니어 등록 버튼을 눌러 새 엔지니어를 추가하세요."
      />
    )
  }

  return (
    <DataTable>
      <Table>
        <TableHeader>
          <TableRow>
            <SortableTableHead
              id="rowNumber"
              currentSort={sort}
              onSort={onSort}
              className="w-16 text-center"
            >
              No
            </SortableTableHead>
            <SortableTableHead
              id="department"
              currentSort={sort}
              onSort={onSort}
              className="w-28"
            >
              소속팀
            </SortableTableHead>
            <SortableTableHead
              id="position"
              currentSort={sort}
              onSort={onSort}
              className="w-24"
            >
              직급
            </SortableTableHead>
            <SortableTableHead
              id="engineerName"
              currentSort={sort}
              onSort={onSort}
            >
              이름
            </SortableTableHead>
            <SortableTableHead
              id="engineerEmail"
              currentSort={sort}
              onSort={onSort}
            >
              이메일
            </SortableTableHead>
            <SortableTableHead
              id="createdAt"
              currentSort={sort}
              onSort={onSort}
              className="w-28"
            >
              등록일
            </SortableTableHead>
            <TableHead className="w-12 text-center"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {engineers.map((engineer) => (
            <TableRow key={engineer.engineerId}>
              <TableCell className="text-center text-muted-foreground">
                {engineer.rowNumber}
              </TableCell>
              <TableCell>
                {engineer.departmentName ? (
                  <span className="text-sm">{engineer.departmentName}</span>
                ) : (
                  <TypographyMuted>-</TypographyMuted>
                )}
              </TableCell>
              <TableCell>
                {engineer.position ? (
                  <span className="text-sm">{engineer.position}</span>
                ) : (
                  <TypographyMuted>-</TypographyMuted>
                )}
              </TableCell>
              <TableCell className="font-medium">{engineer.engineerName}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {engineer.engineerEmail}
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <TypographyMuted>{formatDateShort(engineer.createdAt)}</TypographyMuted>
              </TableCell>
              <TableCell>
                <TableActionMenu>
                  <TableActionMenuItem onClick={() => onEdit(engineer)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    수정
                  </TableActionMenuItem>
                  <TableActionMenuSeparator />
                  <TableActionMenuItem
                    onClick={() => onDelete(engineer.engineerId)}
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
