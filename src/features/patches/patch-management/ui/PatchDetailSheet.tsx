/**
 * Patch Detail Sheet Component
 * 패치 상세 정보 시트 — 버전 / 포함된 빌드
 */

import { Tag } from 'lucide-react'

import { usePatch } from '@/entities/patches/patch'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { TypographyInlineCode, TypographyMuted } from '@/shared/ui/typography'

interface PatchDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patchId: number | null
}

export function PatchDetailSheet({ open, onOpenChange, patchId }: PatchDetailSheetProps) {
  const { data: patch, isLoading, error } = usePatch(patchId ?? 0, {
    enabled: open && patchId !== null,
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[480px] sm:max-w-[480px] flex flex-col gap-4 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            패치 상세 정보
          </SheetTitle>
          <SheetDescription>패치의 빌드 포함 정보를 확인합니다.</SheetDescription>
        </SheetHeader>

        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">로딩 중...</div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center p-8">
            <div className="text-destructive text-center text-sm">
              패치 정보를 불러오는데 실패했습니다.
              {error instanceof Error && (
                <div className="mt-1 text-xs">{error.message}</div>
              )}
            </div>
          </div>
        )}

        {patch && !isLoading && !error && (
          <div className="flex flex-col gap-5">
            {/* 버전 */}
            <section className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold">버전</h4>
              <div className="flex items-center gap-2 text-sm">
                <TypographyInlineCode className="bg-transparent text-xs">{patch.fromVersion}</TypographyInlineCode>
                <span className="text-muted-foreground">→</span>
                <TypographyInlineCode className="bg-transparent text-xs font-medium">{patch.toVersion}</TypographyInlineCode>
              </div>
            </section>

            {/* 포함된 빌드 섹션 */}
            {patch.isBuildIncluded && patch.includedBuilds && (
              <section className="flex flex-col gap-2">
                <h4 className="text-sm font-semibold">포함된 빌드</h4>
                <ul className="flex flex-col gap-1 text-sm">
                  {patch.includedBuilds.web && (
                    <li className="grid grid-cols-[80px_1fr] gap-2 items-center">
                      <span className="text-muted-foreground">WEB</span>
                      <span>
                        {patch.includedBuilds.web.fullVersion}
                        {patch.includedBuilds.web.buildVersionId == null && (
                          <span className="ml-2 text-xs text-muted-foreground">(삭제됨)</span>
                        )}
                      </span>
                    </li>
                  )}
                  {patch.includedBuilds.engines.map((e) => (
                    <li key={e.engineName} className="grid grid-cols-[80px_1fr] gap-2 items-center">
                      <span className="text-muted-foreground">{e.engineName}</span>
                      <span>
                        {e.fullVersion}
                        {e.buildVersionId == null && (
                          <span className="ml-2 text-xs text-muted-foreground">(삭제됨)</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* 빌드 미포함 안내 */}
            {!patch.isBuildIncluded && (
              <div className="flex items-center justify-center p-6">
                <TypographyMuted className="text-sm text-center">
                  빌드 포함 정보가 없습니다.
                </TypographyMuted>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
