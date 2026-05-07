/**
 * OutdatedBuildsWarningDialog Component
 * 빌드 선택 위험(구버전/미선택) 경고 다이얼로그
 *
 * 패치 생성 시 다음 두 가지 위험 항목을 한 번에 경고합니다:
 *  - reason='outdated': 선택된 빌드가 범위 내 최신이 아님
 *  - reason='missing':  picker 후보가 있는데 운영자가 '포함 안 함' 으로 두어 누락
 *
 * 두 경우 모두 사이트가 to 버전인데 그 항목만 옛 상태가 되어 호환성 사고 위험.
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
              빌드 선택을 한번 더 확인해주세요
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-3 space-y-3">
            <p>
              아래 항목은 사이트에 <strong>옛 버전 그대로 남거나 아예 적용되지 않습니다</strong>.
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
                      적용되어야 할 최신
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
                        {item.selected ? (
                          <span className="rounded bg-destructive/10 px-1.5 py-0.5 font-mono text-xs text-destructive">
                            {item.selected.fullVersion} (구버전)
                          </span>
                        ) : (
                          <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-xs text-destructive">
                            포함 안 함
                          </span>
                        )}
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

            {/* 경고 메시지 — 비개발자도 이해 가능한 단순 표현 */}
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-2">
              <p className="text-sm text-destructive">
                사이트는 새 버전 (To 버전) 으로 패치되지만, 위 항목들만{' '}
                <strong>옛 버전 그대로 남습니다</strong>.
              </p>
              <p className="text-sm text-destructive">
                이렇게 사이트 안에 새 / 옛 버전이 섞이면{' '}
                <strong>이후 버전 관리가 꼬이거나, 일부 기능이 정상 동작하지 않을 수 있습니다</strong>.
                특별한 이유가 없다면 <strong>취소</strong> 후 모두 최신으로 맞춰주세요.
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
