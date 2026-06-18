/**
 * Patch Delete Modal Component
 * 패치 삭제 확인 다이얼로그 — 패치 완료 다이얼로그와 동일한 레이아웃/톤
 */

import { Loader2 } from 'lucide-react'

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

interface PatchDeleteModalProps {
  isOpen: boolean
  isDeleting: boolean
  patchName: string
  onConfirm: () => void
  onClose: () => void
}

export function PatchDeleteModal({
  isOpen,
  isDeleting,
  patchName,
  onConfirm,
  onClose,
}: PatchDeleteModalProps) {
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isDeleting) onClose()
      }}
    >
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>패치 삭제</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                패치 <span className="text-foreground font-medium">{patchName}</span> 을 삭제하시겠습니까?
              </p>
              <div className="rounded-md border bg-muted/50 px-4 py-3 space-y-1.5">
                <p className="text-foreground font-medium">삭제 후 다음이 진행됩니다:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>패치 파일이 디스크에서 영구 삭제</li>
                  <li>패치 관리 / 다운로드 목록에서 즉시 사라짐</li>
                  <li>고객사의 버전 이력에는 영향 없음 (적용 전 폐기)</li>
                </ul>
              </div>
              <p className="text-destructive font-medium">되돌릴 수 없습니다.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              // Radix 기본 동작(클릭 즉시 모달 닫힘)을 막아 삭제 완료까지 모달을 유지한다.
              e.preventDefault()
              onConfirm()
            }}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                삭제 중...
              </>
            ) : (
              '삭제'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
