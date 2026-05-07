/**
 * OutdatedBuildsWarningDialog Component
 * 구버전 빌드 선택 시 경고 다이얼로그
 *
 * 패치 생성 시 선택된 빌드가 범위 내 최신이 아닐 때 표시합니다.
 * 운영자가 "이대로 진행" 또는 "취소"를 명시적으로 선택해야 합니다.
 */

import { AlertTriangle } from 'lucide-react'

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

import type { OutdatedSelection } from '../lib/helpers'

interface OutdatedBuildsWarningDialogProps {
  open: boolean
  outdatedSelections: OutdatedSelection[]
  onConfirm: () => void
  onCancel: () => void
}

export function OutdatedBuildsWarningDialog({
  open,
  outdatedSelections,
  onConfirm,
  onCancel,
}: OutdatedBuildsWarningDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-destructive">
              구버전 빌드가 선택되어 있습니다
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-3 space-y-3">
            <p>
              아래 항목에서 범위 내 최신 빌드가 아닌 구버전 빌드가 선택되어 있습니다.
            </p>

            {/* 비교 표 */}
            <div className="overflow-x-auto rounded-md border border-destructive/30">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-destructive/20 bg-destructive/5">
                    <th className="px-3 py-2 text-left font-semibold text-foreground">
                      종류
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-foreground">
                      엔진명
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-foreground">
                      현재 선택
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-foreground">
                      범위 내 최신
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {outdatedSelections.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-destructive/10 last:border-0"
                    >
                      <td className="px-3 py-2 font-mono text-xs font-medium text-foreground">
                        {item.kind}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                        {item.engineName ?? '-'}
                      </td>
                      <td className="px-3 py-2">
                        <span className="rounded bg-destructive/10 px-1.5 py-0.5 font-mono text-xs text-destructive">
                          {item.selected.fullVersion}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary">
                          {item.latest.fullVersion}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 경고 메시지 */}
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-sm text-destructive">
                이대로 패치를 만들면 사이트의 엔진 바이너리는 구버전이지만 누적 config
                자산은 최신 상태로 들어가 <strong>호환성 사고</strong>가 발생할 수
                있습니다. 의도된 선택이 아니라면 취소 후 최신 빌드로 변경하세요.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            무시하고 진행
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
