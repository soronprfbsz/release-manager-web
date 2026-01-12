/**
 * Department Delete Dialog Component
 * 부서 삭제 확인 다이얼로그
 */

import { Trash2 } from 'lucide-react'

import type { DepartmentTree } from '@/entities/_shared/department'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { buttonVariants } from '@/shared/ui/button'

interface DepartmentDeleteDialogProps {
  open: boolean
  department: DepartmentTree | null
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DepartmentDeleteDialog({
  open,
  department,
  isDeleting,
  onConfirm,
  onCancel,
}: DepartmentDeleteDialogProps) {
  if (!department) return null

  const hasChildren = department.children && department.children.length > 0
  const hasAccounts = department.accountCount > 0
  const canDelete = !hasChildren && !hasAccounts

  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            부서 삭제
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            {canDelete ? (
              <>
                <p>
                  <strong className="text-foreground">{department.departmentName}</strong> 부서를
                  삭제하시겠습니까?
                </p>
                <p className="text-muted-foreground text-sm">
                  이 작업은 되돌릴 수 없습니다.
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong className="text-foreground">{department.departmentName}</strong> 부서를
                  삭제할 수 없습니다.
                </p>
                {hasChildren && (
                  <p className="text-destructive">
                    ⚠️ 하위 부서 {department.children.length}개가 존재합니다. 하위 부서를 먼저 삭제해주세요.
                  </p>
                )}
                {hasAccounts && (
                  <p className="text-destructive">
                    ⚠️ 이 부서에 소속된 계정이 {department.accountCount}명 있습니다. 계정을 다른 부서로 이동해주세요.
                  </p>
                )}
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {canDelete ? '취소' : '닫기'}
          </AlertDialogCancel>
          {canDelete && (
            <AlertDialogAction
              onClick={onConfirm}
              disabled={isDeleting}
              className={buttonVariants({ variant: 'destructive' })}
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
