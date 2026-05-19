/**
 * Customer Form Component
 * 고객사 생성/수정 폼 컴포넌트
 *
 * 수정 모드 + ADMIN 권한일 때 하단에 "위험 구역" 초기화 섹션을 표시한다.
 */

import { useState } from 'react'

import { Loader2, RotateCcw } from 'lucide-react'

import {
  useResetCustomerPatchState,
  type Customer,
} from '@/entities/operations/customer'

import { getFormIcon } from '@/shared/config/domain-icons'
import { GLYPH_COLORS, resolveGlyph, getGlyphFontSizeClass } from '@/shared/lib/glyph'
import { usePermission } from '@/shared/lib/hooks/use-permission'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { cn } from '@/shared/lib/utils'
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
import { Button } from '@/shared/ui/button'
import { FormSheet } from '@/shared/ui/form-sheet'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { Textarea } from '@/shared/ui/textarea'
import { TypographyMuted } from '@/shared/ui/typography'

import type { CustomerFormData, CustomerFormMode } from '../model/types'

interface CustomerFormProps {
  mode: CustomerFormMode
  formData: CustomerFormData
  isSubmitting: boolean
  /** 수정 모드일 때 초기화 기능에 사용. create 모드에서는 undefined. */
  editingCustomer?: Customer | null
  onFormDataChange: (data: CustomerFormData) => void
  onSubmit: () => void
  onClose: () => void
}

export function CustomerForm({
  mode,
  formData,
  isSubmitting,
  editingCustomer,
  onFormDataChange,
  onSubmit,
  onClose,
}: CustomerFormProps) {
  const { toast } = useToast()
  const { canResetCustomerPatchState } = usePermission()

  // 초기화 확인 다이얼로그 표시 여부
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  const resetMutation = useResetCustomerPatchState()

  /** 초기화 실행 핸들러 */
  const handleResetConfirm = () => {
    if (!editingCustomer) return

    resetMutation.mutate(editingCustomer.customerId, {
      onSuccess: (data) => {
        toast({
          title: '고객사 초기화 완료',
          description:
            `사이트 버전 ${data.deletedSiteVersionCount}건, ` +
            `프로젝트 ${data.resetCustomerProjectCount}건, ` +
            `패치 이력 ${data.deletedPatchHistoryCount}건 정리됨`,
        })
        setResetDialogOpen(false)
      },
      onError: () => {
        toast({
          title: '초기화 실패',
          description: '고객사 초기화 중 오류가 발생했습니다.',
          variant: 'destructive',
        })
        setResetDialogOpen(false)
      },
    })
  }

  // 수정 모드이고 ADMIN 권한일 때만 초기화 섹션 표시
  const showResetSection =
    mode === 'edit' && canResetCustomerPatchState && !!editingCustomer

  // 글리프 배지 라이브 프리뷰
  const { text: previewText, glyphClass: previewGlyphClass } = resolveGlyph({
    name: formData.customerName || '?',
    glyphText: formData.glyphText || null,
    glyphBackgroundColor: formData.glyphBackgroundColor || null,
  })
  const previewFontSize = getGlyphFontSizeClass(previewText)

  return (
    <>
      <FormSheet
        mode={mode}
        icon={getFormIcon(mode, 'customer')}
        title={{ create: '고객사 생성', edit: '고객사 수정' }}
        description={{
          create: '새 고객사 정보를 입력하세요.',
          edit: '고객사 정보를 수정하세요.',
        }}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onClose={onClose}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label required>고객사 코드</Label>
            <Input
              value={formData.customerCode}
              onChange={(e) =>
                onFormDataChange({ ...formData, customerCode: e.target.value })
              }
              placeholder="e.g. customerA"
              disabled={mode === 'edit'}
            />
          </div>

          <div className="space-y-2">
            <Label required>고객사명</Label>
            <Input
              value={formData.customerName}
              onChange={(e) =>
                onFormDataChange({ ...formData, customerName: e.target.value })
              }
              placeholder="e.g. A회사"
            />
          </div>
        </div>
        {mode === 'edit' && (
          <TypographyMuted className="text-xs -mt-2">
            고객사 코드는 수정할 수 없습니다.
          </TypographyMuted>
        )}
        <div className="space-y-2">
          <Label>설명</Label>
          <Textarea
            value={formData.description}
            onChange={(e) =>
              onFormDataChange({ ...formData, description: e.target.value })
            }
            placeholder="고객사에 대한 설명을 입력하세요"
            className="min-h-[80px]"
          />
        </div>

        {/* 글리프 배지 설정 */}
        <div className="space-y-3 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">글리프 배지</Label>
            {/* 라이브 프리뷰 */}
            <div
              className={cn(
                'h-10 w-10 rounded-md flex items-center justify-center',
                'font-mono font-semibold select-none',
                previewFontSize,
                previewGlyphClass
              )}
            >
              {previewText}
            </div>
          </div>

          {/* 글리프 텍스트 입력 */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              표시 텍스트 (최대 3자, 비워두면 고객사명 첫 글자 사용)
            </Label>
            <Input
              value={formData.glyphText}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  glyphText: e.target.value.slice(0, 3),
                })
              }
              placeholder="예: A"
              maxLength={3}
              className="font-mono"
            />
          </div>

          {/* 색상 swatch 그리드 */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              배경 색상 (비워두면 고객사명 기반 자동 선택)
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {GLYPH_COLORS.map((color) => {
                const isSelected = formData.glyphBackgroundColor === color.key
                return (
                  <button
                    key={color.key}
                    type="button"
                    title={color.label}
                    onClick={() =>
                      onFormDataChange({
                        ...formData,
                        glyphBackgroundColor: isSelected ? '' : color.key,
                      })
                    }
                    className={cn(
                      'h-7 w-full rounded-md transition-all',
                      color.swatchClass,
                      isSelected
                        ? 'ring-2 ring-offset-1 ring-foreground/60 scale-105'
                        : 'hover:scale-105 hover:ring-1 hover:ring-offset-1 hover:ring-foreground/30'
                    )}
                  />
                )
              })}
            </div>
            {/* 선택된 색상 표시 / 초기화 */}
            {formData.glyphBackgroundColor && (
              <p className="text-xs text-muted-foreground flex items-center justify-between">
                <span>
                  {GLYPH_COLORS.find((c) => c.key === formData.glyphBackgroundColor)?.label ??
                    formData.glyphBackgroundColor}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onFormDataChange({ ...formData, glyphBackgroundColor: '' })
                  }
                  className="text-xs underline underline-offset-2 hover:text-foreground"
                >
                  초기화
                </button>
              </p>
            )}
          </div>
        </div>

        {/* 활성 상태 토글 */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-1">
            <Label className="font-medium">활성화</Label>
            <TypographyMuted className="text-xs">
              비활성화 시 관리 대상에서 제외됩니다.
            </TypographyMuted>
          </div>
          <Switch
            checked={formData.isActive}
            onCheckedChange={(checked) =>
              onFormDataChange({ ...formData, isActive: checked })
            }
          />
        </div>

        {/* 위험 구역 — 수정 모드 + ADMIN 전용 */}
        {showResetSection && (
          <div className="space-y-3 pt-1">
            {/* 구분선 + 위험 구역 레이블 */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-destructive/30" />
              <span className="text-xs font-medium text-destructive/70 uppercase tracking-wide">
                위험 구역
              </span>
              <div className="h-px flex-1 bg-destructive/30" />
            </div>

            {/* 초기화 카드 */}
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">고객사 초기화</p>
                <TypographyMuted className="text-xs">
                  패치 적용 이력, 사이트 버전 정보, 프로젝트 적용 기록을 모두 삭제합니다.
                  미완료 패치는 영향 없습니다.
                </TypographyMuted>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setResetDialogOpen(true)}
              >
                <RotateCcw className="mr-2 h-3.5 w-3.5" />
                고객사 초기화
              </Button>
            </div>
          </div>
        )}
      </FormSheet>

      {/* 초기화 확인 AlertDialog */}
      {editingCustomer && (
        <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>고객사 초기화</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">
                      {editingCustomer.customerName} ({editingCustomer.customerCode})
                    </span>
                    의 패치 적용 이력을 완전히 초기화하시겠습니까?
                  </p>

                  {/* 초기화 항목 메타박스 */}
                  <div className="rounded-md bg-muted/50 px-4 py-3 space-y-1.5">
                    <p className="text-xs font-medium text-foreground">초기화 후 다음이 진행됩니다:</p>
                    <ul className="text-xs space-y-1 list-none">
                      <li>• 사이트 컴포넌트별 현재 버전 (BASE / WEB / ENGINE) 정보 삭제</li>
                      <li>• 고객사 프로젝트의 마지막 적용 버전 / 일시 NULL 처리</li>
                      <li>• 패치 이력 (적용 완료된 패치) 전체 삭제</li>
                      <li className="text-muted-foreground/70">• 패치 관리의 미완료 패치는 영향 없음</li>
                    </ul>
                  </div>

                  <p className="text-destructive font-medium">되돌릴 수 없습니다.</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={resetMutation.isPending}>
                취소
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetConfirm}
                disabled={resetMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {resetMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    초기화 중...
                  </>
                ) : (
                  '초기화'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
