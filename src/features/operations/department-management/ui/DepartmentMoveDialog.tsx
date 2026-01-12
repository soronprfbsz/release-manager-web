/**
 * Department Move Dialog Component
 * 부서 이동 다이얼로그
 */

import { useState, useEffect } from 'react'

import { Move, Building2 } from 'lucide-react'

import type { Department, DepartmentTree } from '@/entities/_shared/department'

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

interface DepartmentMoveDialogProps {
  open: boolean
  department: DepartmentTree | null
  departments: Department[]
  isMoving: boolean
  onConfirm: (newParentId: number | null) => void
  onCancel: () => void
}

export function DepartmentMoveDialog({
  open,
  department,
  departments,
  isMoving,
  onConfirm,
  onCancel,
}: DepartmentMoveDialogProps) {
  const [selectedParentId, setSelectedParentId] = useState<string>('none')

  // 다이얼로그 열릴 때 초기화
  useEffect(() => {
    if (open) {
      setSelectedParentId('none')
    }
  }, [open])

  if (!department) return null

  // 자기 자신과 자손 부서는 선택 불가
  const getDescendantIds = (dept: DepartmentTree): number[] => {
    const ids = [dept.departmentId]
    if (dept.children) {
      dept.children.forEach((child) => {
        ids.push(...getDescendantIds(child))
      })
    }
    return ids
  }

  const excludedIds = new Set(getDescendantIds(department))
  const selectableDepartments = departments.filter(
    (d) => !excludedIds.has(d.departmentId)
  )

  const handleConfirm = () => {
    const newParentId = selectedParentId === 'none' ? null : parseInt(selectedParentId)
    onConfirm(newParentId)
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Move className="h-5 w-5" />
            부서 이동
          </DialogTitle>
          <DialogDescription>
            <strong className="text-foreground">{department.departmentName}</strong> 부서를
            다른 부서 하위로 이동합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>새 상위 부서</Label>
            <Select value={selectedParentId} onValueChange={setSelectedParentId}>
              <SelectTrigger>
                <SelectValue placeholder="상위 부서를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    루트 부서 하위
                  </div>
                </SelectItem>
                {selectableDepartments.map((dept) => (
                  <SelectItem key={dept.departmentId} value={dept.departmentId.toString()}>
                    {dept.departmentName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              자기 자신이나 하위 부서로는 이동할 수 없습니다.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isMoving}>
            취소
          </Button>
          <Button onClick={handleConfirm} disabled={isMoving}>
            {isMoving ? '이동 중...' : '이동'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
