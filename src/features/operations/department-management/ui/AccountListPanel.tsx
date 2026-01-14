/**
 * Account List Panel Component
 * 부서별 계정 목록 패널 (드래그 앤 드롭 지원)
 */

import { ArrowRightLeft, GripVertical, Mail, Phone, User, Users as UsersIcon, UserX } from 'lucide-react'

import type { Account } from '@/entities/operations/account'
import type { DepartmentDetail } from '@/entities/_shared/department'

import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { DiceBearAvatar, type AvatarStyleKey } from '@/shared/ui/dicebear-avatar'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { TypographyMuted } from '@/shared/ui/typography'

interface AccountListPanelProps {
  department: DepartmentDetail | null
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
  department,
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

  // 특수 모드가 아니고 부서도 선택 안된 경우
  if (!showAllAccounts && !showUnassigned && !department) {
    return (
      <Card className="h-full flex flex-col overflow-hidden">
        <CardContent className="flex items-center justify-center flex-1">
          <div className="text-center text-muted-foreground">
            <UsersIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>부서를 선택하면</p>
            <p>소속 계정이 표시됩니다.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-3 border-b flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {showAllAccounts ? (
              <>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UsersIcon className="h-5 w-5" />
                  전체 계정
                </CardTitle>
                <TypographyMuted className="text-sm mt-1">
                  등록된 모든 계정 목록입니다.
                </TypographyMuted>
              </>
            ) : showUnassigned ? (
              <>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserX className="h-5 w-5" />
                  미배치 계정
                </CardTitle>
                <TypographyMuted className="text-sm mt-1">
                  부서에 배치되지 않은 계정 목록입니다.
                </TypographyMuted>
              </>
            ) : department && (
              <>
                <CardTitle className="text-lg truncate">{department.departmentName}</CardTitle>
                {department.description && (
                  <TypographyMuted className="text-sm mt-1 truncate">
                    {department.description}
                  </TypographyMuted>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Account list */}
      <CardContent className="p-0 flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <User className="h-10 w-10 mb-2 opacity-30" />
            <p className="text-sm">
              {showAllAccounts ? '등록된 계정이 없습니다.' : showUnassigned ? '미배치 계정이 없습니다.' : '소속 계정이 없습니다.'}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="divide-y">
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
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
