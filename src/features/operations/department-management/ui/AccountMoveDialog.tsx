/**
 * Account Move Dialog Component
 * 계정 부서 이동 다이얼로그
 */

import { useState, useMemo } from 'react'

import { ArrowRight, Building2 } from 'lucide-react'

import type { Department } from '@/entities/_shared/department'
import type { Account } from '@/entities/operations/account'

import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { DiceBearAvatar, type AvatarStyleKey } from '@/shared/ui/dicebear-avatar'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

interface AccountMoveDialogProps {
  open: boolean
  account: Account | null
  departments: Department[]
  isMoving: boolean
  onConfirm: (newDepartmentId: number | null) => void
  onCancel: () => void
}

export function AccountMoveDialog({
  open,
  account,
  departments,
  isMoving,
  onConfirm,
  onCancel,
}: AccountMoveDialogProps) {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('')

  // 현재 부서를 제외한 부서 목록
  const availableDepartments = useMemo(() => {
    return departments.filter(d => d.departmentId !== account?.departmentId)
  }, [departments, account?.departmentId])

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

  if (!account) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            부서 이동
          </DialogTitle>
          <DialogDescription>
            계정을 다른 부서로 이동합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 계정 정보 */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <DiceBearAvatar
              style={(account.avatarStyle as AvatarStyleKey) || 'initials'}
              seed={account.avatarSeed || account.email}
              size={48}
              name={account.accountName}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{account.accountName}</p>
              <p className="text-sm text-muted-foreground truncate">{account.email}</p>
            </div>
          </div>

          {/* 현재 부서 -> 새 부서 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">현재 부서</Label>
                <p className="mt-1 font-medium">
                  {account.departmentName || '미배치'}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">이동할 부서</Label>
                <Select
                  value={selectedDepartmentId}
                  onValueChange={setSelectedDepartmentId}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="부서 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">미배치 (부서 해제)</SelectItem>
                    {availableDepartments.map((dept) => (
                      <SelectItem key={dept.departmentId} value={String(dept.departmentId)}>
                        {dept.departmentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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
            {isMoving ? '이동 중...' : '이동'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
