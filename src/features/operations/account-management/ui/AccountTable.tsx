/**
 * Account Table Component
 * 계정 목록 테이블 컴포넌트
 */

import {
  User,
  Edit2,
  Trash2,
} from 'lucide-react'

import type { Account } from '@/entities/operations/account'

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
import { TypographyMuted } from '@/shared/ui/typography'


interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

interface AccountTableProps {
  accounts: Account[]
  sort: SortConfig | null
  onSort: (key: string) => void
  onEdit: (account: Account) => void
  onDelete: (accountId: number) => void
}

export function AccountTable({
  accounts,
  sort,
  onSort,
  onEdit,
  onDelete,
}: AccountTableProps) {
  if (accounts.length === 0) {
    return (
      <EmptyState
        icon={User}
        title="등록된 계정이 없습니다."
        description="계정을 조회하고 있습니다."
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
              id="accountName"
              currentSort={sort}
              onSort={onSort}
              className="w-40"
            >
              이름
            </SortableTableHead>
            <SortableTableHead
              id="email"
              currentSort={sort}
              onSort={onSort}
            >
              이메일
            </SortableTableHead>
            <TableHead className="w-28">권한</TableHead>
            <TableHead className="w-40">마지막 로그인</TableHead>
            <TableHead className="w-40">생성일시</TableHead>
            <TableHead className="w-12 text-center"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.accountId}>
              <TableCell className="text-center text-muted-foreground">
                {account.rowNumber}
              </TableCell>
              <TableCell className="text-center">
                <StatusBadge variant={account.status === 'ACTIVE' ? 'active' : 'inactive'}>
                  {account.status === 'ACTIVE' ? '활성' : '비활성'}
                </StatusBadge>
              </TableCell>
              <TableCell className="font-medium">{account.accountName}</TableCell>
              <TableCell>
                <TypographyMuted>{account.email}</TypographyMuted>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-primary/10 text-primary">
                  {account.role}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {account.lastLoginAt ? (
                  <TypographyMuted>{formatDateTime(account.lastLoginAt)}</TypographyMuted>
                ) : (
                  <TypographyMuted>-</TypographyMuted>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <TypographyMuted>{formatDateTime(account.createdAt)}</TypographyMuted>
              </TableCell>
              <TableCell>
                <TableActionMenu>
                  <TableActionMenuItem onClick={() => onEdit(account)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    수정
                  </TableActionMenuItem>
                  <TableActionMenuItem
                    onClick={() => onDelete(account.accountId)}
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
