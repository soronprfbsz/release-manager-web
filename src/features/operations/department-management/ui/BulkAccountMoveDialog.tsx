/**
 * Bulk Account Move Dialog Component
 * 계정 일괄 부서 이동 다이얼로그
 */

import { useState } from 'react'

import { Building2, Users } from 'lucide-react'

import type { Account } from '@/entities/operations/account'
import type { Department } from '@/entities/_shared/department'

import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { DiceBearAvatar, type AvatarStyleKey } from '@/shared/ui/dicebear-avatar'

interface BulkAccountMoveDialogProps {
  open: boolean
  /** 선택된 계정 목록 */
  accounts: Account[]
  /** 부서 목록 */
  departments: Department[]
  /** 이동 중 여부 */
  isMoving: boolean
  /** 이동 확인 핸들러 */
  onConfirm: (newDepartmentId: number | null) => void
  /** 취소 핸들러 */
  onCancel: () => void
}

export function BulkAccountMoveDialog({
  open,
  accounts,
  departments,
  isMoving,
  onConfirm,
  onCancel,
}: BulkAccountMoveDialogProps) {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('')

  // 다이얼로그 열릴 때 선택 초기화
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedDepartmentId('')
      onCancel()
    }
  }

  const handleConfirm = () => {
    if (selectedDepartmentId === '__none__') {
      onConfirm(null)
    } else if (selectedDepartmentId) {
      onConfirm(Number(selectedDepartmentId))
    }
  }

  if (accounts.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            일괄 부서 이동
          </DialogTitle>
          <DialogDescription>
            선택한 {accounts.length}명의 계정을 다른 부서로 이동합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 선택된 계정 목록 */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              선택된 계정 ({accounts.length}명)
            </Label>
            <ScrollArea className="h-[180px] rounded-lg border bg-muted/30 p-2">
              <div className="space-y-2">
                {accounts.map((account) => (
                  <div
                    key={account.accountId}
                    className="flex items-center gap-2 p-2 bg-background rounded-md"
                  >
                    <DiceBearAvatar
                      style={(account.avatarStyle as AvatarStyleKey) || 'initials'}
                      seed={account.avatarSeed || account.email}
                      size={32}
                      name={account.accountName}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{account.accountName}</p>
                        <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-muted rounded flex-shrink-0">
                          {account.departmentName || '미배치'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{account.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* 이동할 부서 선택 */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">이동할 부서</Label>
            <Select
              value={selectedDepartmentId}
              onValueChange={setSelectedDepartmentId}
            >
              <SelectTrigger>
                <SelectValue placeholder="부서 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">미배치 (부서 해제)</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.departmentId} value={String(dept.departmentId)}>
                    {dept.departmentName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isMoving}>
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedDepartmentId || isMoving}
          >
            {isMoving ? '이동 중...' : `${accounts.length}명 이동`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
