/**
 * Account List Panel Component
 * 부서별 계정 목록 패널 (드래그 앤 드롭 지원)
 * ContentSplit.Detail 내부에서 사용 (header와 ScrollArea는 ContentSplit.Detail이 제공)
 */

import { ArrowRightLeft, GripVertical, Mail, Phone, User } from 'lucide-react'

import type { Account } from '@/entities/operations/account'

import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { DiceBearAvatar, type AvatarStyleKey } from '@/shared/ui/dicebear-avatar'
import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

interface AccountListPanelProps {
  accounts: Account[]
  isLoading: boolean
  /** 전체 계정 보기 모드 */
  showAllAccounts?: boolean
  /** 미배치 계정 보기 모드 */
  showUnassigned?: boolean
  onMoveAccount: (account: Account) => void
  onDragStart?: (account: Account) => void
  onDragEnd?: () => void
}

export function AccountListPanel({
  accounts,
  isLoading,
  showAllAccounts = false,
  showUnassigned = false,
  onMoveAccount,
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
      {accounts.map((account) => (
        <div
          key={account.accountId}
          className={cn(
            'flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors',
            'select-none'
          )}
        >
          {/* Drag handle */}
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, account)}
            onDragEnd={handleDragEnd}
            className="cursor-grab active:cursor-grabbing p-1 -m-1 rounded hover:bg-accent flex-shrink-0"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground/50" />
          </div>

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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 h-8 w-8"
                onClick={() => onMoveAccount(account)}
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>다른 부서로 이동</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ))}
    </div>
  )
}
