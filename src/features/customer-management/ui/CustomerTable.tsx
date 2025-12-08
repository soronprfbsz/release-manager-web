/**
 * Customer Table Component
 * 고객사 목록 테이블 컴포넌트
 */

import {
  Building2,
  Edit2,
  Trash2,
  Power,
  PowerOff,
} from 'lucide-react'

import type { Customer } from '@/entities/customer'

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

interface CustomerTableProps {
  customers: Customer[]
  sort: SortConfig | null
  onSort: (key: string) => void
  onEdit: (customer: Customer) => void
  onDelete: (customerId: number) => void
  onToggleStatus: (customer: Customer) => void
}

export function CustomerTable({
  customers,
  sort,
  onSort,
  onEdit,
  onDelete,
  onToggleStatus,
}: CustomerTableProps) {
  if (customers.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="등록된 고객사가 없습니다."
        description="고객사 생성 버튼을 눌러 새 고객사를 추가하세요."
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
            <TableHead className="w-20 text-center">상태</TableHead>
            <SortableTableHead
              id="customerCode"
              currentSort={sort}
              onSort={onSort}
              className="w-32"
            >
              고객사 코드
            </SortableTableHead>
            <SortableTableHead
              id="customerName"
              currentSort={sort}
              onSort={onSort}
            >
              고객사명
            </SortableTableHead>
            <TableHead>설명</TableHead>
            <TableHead className="w-40">프로젝트명</TableHead>
            <TableHead className="w-32">최종 패치 버전</TableHead>
            <TableHead className="w-28">최종 패치일</TableHead>
            <TableHead className="w-12 text-center"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.customerId}>
              <TableCell className="text-center text-muted-foreground">
                {customer.rowNumber}
              </TableCell>
              <TableCell className="text-center">
                <StatusBadge variant={customer.isActive ? 'active' : 'inactive'}>
                  {customer.isActive ? '활성' : '비활성'}
                </StatusBadge>
              </TableCell>
              <TableCell>
                <TypographyInlineCode className="bg-transparent">
                  {customer.customerCode}
                </TypographyInlineCode>
              </TableCell>
              <TableCell className="font-medium">{customer.customerName}</TableCell>
              <TableCell>
                <TypographyMuted className="max-w-xs truncate">
                  {customer.description || '-'}
                </TypographyMuted>
              </TableCell>
              <TableCell>
                {customer.project ? (
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-muted">
                    {customer.project.projectName}
                  </span>
                ) : (
                  <TypographyMuted>-</TypographyMuted>
                )}
              </TableCell>
              <TableCell>
                {customer.project?.lastPatchedVersion ? (
                  <span className="text-sm font-mono">{customer.project.lastPatchedVersion}</span>
                ) : (
                  <TypographyMuted>-</TypographyMuted>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {customer.project?.lastPatchedAt ? (
                  <TypographyMuted>{formatDateShort(customer.project.lastPatchedAt)}</TypographyMuted>
                ) : (
                  <TypographyMuted>-</TypographyMuted>
                )}
              </TableCell>
              <TableCell>
                <TableActionMenu>
                  <TableActionMenuItem onClick={() => onEdit(customer)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    수정
                  </TableActionMenuItem>
                  <TableActionMenuItem onClick={() => onToggleStatus(customer)}>
                    {customer.isActive ? (
                      <>
                        <PowerOff className="mr-2 h-4 w-4" />
                        비활성화
                      </>
                    ) : (
                      <>
                        <Power className="mr-2 h-4 w-4" />
                        활성화
                      </>
                    )}
                  </TableActionMenuItem>
                  <TableActionMenuSeparator />
                  <TableActionMenuItem
                    onClick={() => onDelete(customer.customerId)}
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
