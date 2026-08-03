/**
 * Account Assign Dialog Component
 * 계정 부서 배치 다이얼로그
 */

import { useState, useMemo, useEffect } from 'react'

import { Check, Search, UserPlus, Users } from 'lucide-react'

import type { Account } from '@/entities/operations/account'

import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { DiceBearAvatar, type AvatarStyleKey } from '@/shared/ui/dicebear-avatar'
import { Input } from '@/shared/ui/input'
import { ScrollArea } from '@/shared/ui/scroll-area'

interface AccountAssignDialogProps {
  open: boolean
  departmentName: string
  accounts: Account[]  // 전체 계정 목록
  isLoading: boolean
  isAssigning: boolean
  onConfirm: (accountIds: number[]) => void
  onCancel: () => void
}

export function AccountAssignDialog({
  open,
  departmentName,
  accounts,
  isLoading,
  isAssigning,
  onConfirm,
  onCancel,
}: AccountAssignDialogProps) {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>([])

  // 다이얼로그가 열릴 때 상태 초기화
  useEffect(() => {
    if (open) {
      setSearchKeyword('')
      setSelectedAccountIds([])
    }
  }, [open])

  // 검색 필터링
  const filteredAccounts = useMemo(() => {
    if (!searchKeyword.trim()) return accounts

    const keyword = searchKeyword.toLowerCase()
    return accounts.filter(
      (account) =>
        account.accountName.toLowerCase().includes(keyword) ||
        account.email.toLowerCase().includes(keyword)
    )
  }, [accounts, searchKeyword])

  // 다이얼로그 열릴 때 상태 초기화
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSearchKeyword('')
      setSelectedAccountIds([])
      onCancel()
    }
  }

  const handleToggleAccount = (accountId: number) => {
    setSelectedAccountIds((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId]
    )
  }

  const handleSelectAll = () => {
    if (selectedAccountIds.length === filteredAccounts.length) {
      setSelectedAccountIds([])
    } else {
      setSelectedAccountIds(filteredAccounts.map((a) => a.accountId))
    }
  }

  const handleConfirm = () => {
    if (selectedAccountIds.length > 0) {
      onConfirm(selectedAccountIds)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            계정 배치
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{departmentName}</span> 부서에 배치할 계정을 선택합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* 검색 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="이름 또는 이메일로 검색..."
              className="pl-9"
            />
          </div>

          {/* 선택 정보 & 전체 선택 */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {filteredAccounts.length}명 중{' '}
              <span className="text-foreground font-medium">{selectedAccountIds.length}명</span> 선택
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              disabled={filteredAccounts.length === 0}
            >
              {selectedAccountIds.length === filteredAccounts.length && filteredAccounts.length > 0
                ? '전체 해제'
                : '전체 선택'}
            </Button>
          </div>

          {/* 계정 목록 */}
          <ScrollArea className="h-[300px] border rounded-md">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Users className="h-10 w-10 mb-2 opacity-30" />
                <p className="text-sm">
                  {searchKeyword ? '검색 결과가 없습니다.' : '배치 가능한 계정이 없습니다.'}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredAccounts.map((account) => {
                  const isSelected = selectedAccountIds.includes(account.accountId)
                  return (
                    <div
                      key={account.accountId}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors',
                        isSelected ? 'bg-primary/20' : 'hover:bg-accent'
                      )}
                      onClick={() => handleToggleAccount(account.accountId)}
                    >
                      <Checkbox checked={isSelected} className="pointer-events-none" />
                      <DiceBearAvatar
                        style={(account.avatarStyle as AvatarStyleKey) || 'initials'}
                        seed={account.avatarSeed || account.email}
                        size={36}
                        name={account.accountName}
                        className="flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{account.accountName}</span>
                          {account.departmentName && (
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              {account.departmentName}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{account.email}</p>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isAssigning}>
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedAccountIds.length === 0 || isAssigning}
          >
            {isAssigning ? '배치 중...' : `${selectedAccountIds.length}명 배치`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
