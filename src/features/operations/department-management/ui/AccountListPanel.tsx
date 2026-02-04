/**
 * Account List Panel Component
 * 부서별 계정 목록 패널 (드래그 앤 드롭 지원, 다중 선택 지원)
 * ContentSplit.Detail 내부에서 사용 (header와 ScrollArea는 ContentSplit.Detail이 제공)
 */

import { GripVertical, Mail, Phone, User } from 'lucide-react'

import type { Account } from '@/entities/operations/account'

import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { DiceBearAvatar, type AvatarStyleKey } from '@/shared/ui/dicebear-avatar'

interface AccountListPanelProps {
  accounts: Account[]
  isLoading: boolean
  /** 전체 계정 보기 모드 */
  showAllAccounts?: boolean
  /** 미배치 계정 보기 모드 */
  showUnassigned?: boolean
  /** 선택된 계정 ID 목록 */
  selectedAccountIds?: number[]
  /** 계정 선택 변경 핸들러 */
  onSelectionChange?: (accountIds: number[]) => void
  onDragStart?: (account: Account) => void
  onDragEnd?: () => void
}

export function AccountListPanel({
  accounts,
  isLoading,
  showAllAccounts = false,
  showUnassigned = false,
  selectedAccountIds = [],
  onSelectionChange,
  onDragStart,
  onDragEnd,
}: AccountListPanelProps) {
  const handleDragStart = (e: React.DragEvent, account: Account) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(account.accountId))
    onDragStart?.(account)
  }

  const handleDragEnd = () => {
    onDragEnd?.()
  }

  const handleCheckboxChange = (accountId: number, checked: boolean) => {
    if (!onSelectionChange) return

    if (checked) {
      onSelectionChange([...selectedAccountIds, accountId])
    } else {
      onSelectionChange(selectedAccountIds.filter(id => id !== accountId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return

    if (checked) {
      onSelectionChange(accounts.map(a => a.accountId))
    } else {
      onSelectionChange([])
    }
  }

  const isAllSelected = accounts.length > 0 && selectedAccountIds.length === accounts.length
  const isIndeterminate = selectedAccountIds.length > 0 && selectedAccountIds.length < accounts.length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <User className="h-10 w-10 mb-2 opacity-30" />
        <p className="text-sm">
          {showAllAccounts ? '등록된 계정이 없습니다.' : showUnassigned ? '미배치 계정이 없습니다.' : '소속 계정이 없습니다.'}
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y -mx-4">
      {/* 전체 선택 헤더 */}
      {onSelectionChange && accounts.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-muted/30">
          {onDragStart && <div className="w-4" />} {/* Spacer for drag handle alignment */}
          <Checkbox
            checked={isAllSelected}
            // @ts-expect-error - indeterminate prop is valid
            indeterminate={isIndeterminate}
            onCheckedChange={handleSelectAll}
            aria-label="전체 선택"
          />
          <span className="text-sm text-muted-foreground">
            {selectedAccountIds.length > 0
              ? `${selectedAccountIds.length}명 선택됨`
              : `전체 선택 (${accounts.length}명)`}
          </span>
        </div>
      )}

      {accounts.map((account) => (
        <div
          key={account.accountId}
          className={cn(
            'flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors',
            'select-none',
            selectedAccountIds.includes(account.accountId) && 'bg-primary/5'
          )}
        >
          {/* Drag handle */}
          {onDragStart && (
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, account)}
              onDragEnd={handleDragEnd}
              className="cursor-grab active:cursor-grabbing p-1 -m-1 rounded hover:bg-accent flex-shrink-0"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/50" />
            </div>
          )}

          {/* Checkbox */}
          {onSelectionChange && (
            <Checkbox
              checked={selectedAccountIds.includes(account.accountId)}
              onCheckedChange={(checked) => handleCheckboxChange(account.accountId, checked as boolean)}
              aria-label={`${account.accountName} 선택`}
            />
          )}

          <DiceBearAvatar
            style={(account.avatarStyle as AvatarStyleKey) || 'initials'}
            seed={account.avatarSeed || account.email}
            size={40}
            name={account.accountName}
            className="flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{account.accountName}</span>
              {(account.positionName || account.position) && (
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {account.positionName || account.position}
                </span>
              )}
              {account.departmentName && (
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  {account.departmentName}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1 truncate">
                <Mail className="h-3 w-3 flex-shrink-0" />
                {account.email}
              </span>
              {account.phone && (
                <span className="flex items-center gap-1 flex-shrink-0">
                  <Phone className="h-3 w-3" />
                  {account.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
