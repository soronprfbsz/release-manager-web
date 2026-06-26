/**
 * Account Table Component
 * 계정 목록 테이블 컴포넌트
 */

import {
  User,
  Edit2,
  KeyRound,
  Trash2,
} from 'lucide-react'

import type { Account } from '@/entities/operations/account'

import { usePermission } from '@/shared/lib/hooks/use-permission'
import { formatDateTime } from '@/shared/lib/utils/date'
import { useAuthStore } from '@/shared/store'
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
  onResetPassword: (account: Account) => void
}

export function AccountTable({
  accounts,
  sort,
  onSort,
  onEdit,
  onDelete,
  onResetPassword,
}: AccountTableProps) {
  const { canEditAccount, canDeleteAccount, canResetAccountPassword, role } = usePermission()
  const currentAccountId = useAuthStore((state) => state.user?.accountId)

  // 대상 계정에 대해 비밀번호 초기화 버튼을 노출할지 판정
  // (권한 보유 && 본인 아님 && OPERATOR 가 ADMIN 을 대상으로 하지 않음)
  const canResetTarget = (account: Account): boolean =>
    canResetAccountPassword &&
    account.accountId !== currentAccountId &&
    !(role === 'OPERATOR' && account.role === 'ADMIN')

  const canManageAccount = canEditAccount || canDeleteAccount || canResetAccountPassword

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
    <DataTable autoHeight>
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
                    {canResetTarget(account) && (
                      <TableActionMenuItem onClick={() => onResetPassword(account)}>
                        <KeyRound className="mr-2 h-4 w-4" />
                        비밀번호 초기화
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
