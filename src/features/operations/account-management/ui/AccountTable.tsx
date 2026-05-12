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

import { usePermission } from '@/shared/lib/hooks/use-permission'
import { formatDateTime } from '@/shared/lib/utils/date'
import { Badge } from '@/shared/ui/badge'
import { DataTable } from '@/shared/ui/data-table'
import { DiceBearAvatar, type AvatarStyleKey } from '@/shared/ui/dicebear-avatar'
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
  /** 뷰포트 기반 동적 높이 (e.g. "calc(100vh - 28rem)") */
  viewportHeight?: string
}

export function AccountTable({
  accounts,
  sort,
  onSort,
  onEdit,
  onDelete,
  viewportHeight,
}: AccountTableProps) {
  const { canEditAccount, canDeleteAccount } = usePermission()
  const canManageAccount = canEditAccount || canDeleteAccount

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
    <DataTable viewportHeight={viewportHeight}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 text-right">No</TableHead>
            <SortableTableHead
              id="status"
              currentSort={sort}
              onSort={onSort}
              className="w-28 text-center"
            >
              상태
            </SortableTableHead>
            <SortableTableHead
              id="accountName"
              currentSort={sort}
              onSort={onSort}
              className="w-50"
            >
              이름
            </SortableTableHead>
            <SortableTableHead
              id="position"
              currentSort={sort}
              onSort={onSort}
              className="w-24"
            >
              직책
            </SortableTableHead>
            <SortableTableHead
              id="departmentName"
              currentSort={sort}
              onSort={onSort}
              className="w-40"
            >
              부서
            </SortableTableHead>
            <SortableTableHead
              id="email"
              currentSort={sort}
              onSort={onSort}
            >
              이메일
            </SortableTableHead>
            <SortableTableHead
              id="role"
              currentSort={sort}
              onSort={onSort}
              className="w-24 text-center"
            >
              권한
            </SortableTableHead>
            <SortableTableHead
              id="lastLoginAt"
              currentSort={sort}
              onSort={onSort}
              className="w-40"
            >
              마지막 로그인
            </SortableTableHead>
            <SortableTableHead
              id="createdAt"
              currentSort={sort}
              onSort={onSort}
              className="w-40"
            >
              생성일시
            </SortableTableHead>
            {canManageAccount && <TableHead className="w-12 text-center"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.accountId}>
              <TableCell className="text-right text-muted-foreground">
                {account.rowNumber}
              </TableCell>
              <TableCell className="text-center">
                <StatusBadge variant={account.status === 'ACTIVE' ? 'active' : 'inactive'}>
                  {account.status === 'ACTIVE' ? '활성' : '비활성'}
                </StatusBadge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <DiceBearAvatar
                    seed={account.avatarSeed || account.email}
                    style={(account.avatarStyle as AvatarStyleKey) || 'initials'}
                    name={account.accountName}
                    size={28}
                  />
                  <span className="font-medium">{account.accountName}</span>
                </div>
              </TableCell>
              <TableCell>
                <TypographyMuted>{account.positionName || account.position || '-'}</TypographyMuted>
              </TableCell>
              <TableCell>
                {account.departmentName || <TypographyMuted>-</TypographyMuted>}
              </TableCell>
              <TableCell>
                {account.email}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="success">{account.role}</Badge>
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
              {canManageAccount && (
                <TableCell>
                  <TableActionMenu>
                    {canEditAccount && (
                      <TableActionMenuItem onClick={() => onEdit(account)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        수정
                      </TableActionMenuItem>
                    )}
                    {canDeleteAccount && (
                      <TableActionMenuItem
                        onClick={() => onDelete(account.accountId)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        삭제
                      </TableActionMenuItem>
                    )}
                  </TableActionMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataTable>
  )
}
