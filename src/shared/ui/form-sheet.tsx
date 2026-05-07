/**
 * Form Sheet Component
 * 폼을 위한 공통 Sheet 래퍼 컴포넌트
 */

import type { ComponentType, ReactNode } from 'react'

import { Loader2 } from 'lucide-react'


import { Button } from './button'
import { ScrollArea } from './scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './sheet'

import type { LucideIcon } from 'lucide-react'

type FormMode = 'create' | 'edit' | null

// 기존 방식: { create: string; edit: string } 또는 단일 string/ReactNode
type TitleDescriptionValue = { create: ReactNode; edit: ReactNode } | ReactNode

// LucideIcon 또는 react-icons 등 다른 아이콘 라이브러리 지원
type IconComponent = LucideIcon | ComponentType<{ className?: string }>

interface FormSheetProps {
  /** 폼 모드. null이면 시트가 닫힘. open prop 사용 시 무시됨 */
  mode?: FormMode
  /** 시트 열림 상태 (mode 대신 사용 가능) */
  open?: boolean
  /** 헤더 아이콘 (Lucide 또는 react-icons 등) */
  icon: IconComponent
  /** 아이콘 색상 클래스 (e.g. 'text-orange-500') */
  iconClassName?: string
  /** 시트 제목 */
  title: TitleDescriptionValue
  /** 시트 설명 */
  description: TitleDescriptionValue
  /** 제출 버튼 라벨 */
  submitLabel?: TitleDescriptionValue
  /** 제출 버튼 아이콘 (Lucide 또는 react-icons 등) */
  submitIcon?: IconComponent
  /** 제출 중 상태 */
  isSubmitting: boolean
  /** 제출 버튼 비활성화 여부 */
  submitDisabled?: boolean
  /** 제출 핸들러 */
  onSubmit: () => void
  /** 닫기 핸들러 */
  onClose: () => void
  /** 폼 필드들 */
  children: ReactNode
  /** 폼 필드 앞에 렌더링할 컨텐츠 (안내 배너 등) */
  headerContent?: ReactNode
  /** 시트 너비 */
  width?: string
  /** 취소 버튼 숨김 여부 */
  hideCancel?: boolean
  /** 스크롤 영역 높이 */
  scrollHeight?: string
}

function getValue(value: TitleDescriptionValue, mode: FormMode): ReactNode {
  if (typeof value === 'object' && value !== null && 'create' in value && 'edit' in value) {
    return mode === 'create' ? value.create : value.edit
  }
  return value
}

export function FormSheet({
  mode,
  open,
  icon: Icon,
  iconClassName,
  title,
  description,
  submitLabel = { create: '등록', edit: '수정' },
  submitIcon: SubmitIcon,
  isSubmitting,
  submitDisabled = false,
  onSubmit,
  onClose,
  children,
  headerContent,
  width = 'w-[400px] sm:max-w-[400px]',
  hideCancel = false,
  scrollHeight = 'h-[calc(100vh-180px)]',
}: FormSheetProps) {
  // open prop 우선, 없으면 mode로 판단
  const isOpen = open !== undefined ? open : mode !== null
  const currentMode = mode ?? 'create'

  // Enter 키 처리를 위한 form submit 핸들러
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  // isSubmitting 중에는 외부 클릭 / ESC / X 버튼으로 인한 close 를 차단.
  // (제출 진행 중 폼이 갑자기 닫히면 사용자 데이터/진행 상태 손실 위험)
  const handleOpenChange = (openState: boolean) => {
    if (!openState) {
      if (isSubmitting) return
      onClose()
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        className={width}
        // isSubmitting 중 외부 클릭 / ESC 차단을 Radix 차원에서도 보강
        onPointerDownOutside={(e) => {
          if (isSubmitting) e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          if (isSubmitting) e.preventDefault()
        }}
        onInteractOutside={(e) => {
          if (isSubmitting) e.preventDefault()
        }}
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${iconClassName ?? ''}`} />
            {getValue(title, currentMode)}
          </SheetTitle>
          <SheetDescription>
            {getValue(description, currentMode)}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className={`${scrollHeight} mt-6 pr-4`}>
          {headerContent}
          <form onSubmit={handleFormSubmit}>
            <div className="space-y-5">
              {children}

              {/* 버튼 */}
              <div className={hideCancel ? 'pt-4' : 'flex gap-2 pt-4'}>
                {!hideCancel && (
                  <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="flex-1">
                    취소
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting || submitDisabled}
                  className={hideCancel ? 'w-full' : 'flex-1'}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {getValue(submitLabel, currentMode)} 중...
                    </>
                  ) : (
                    <>
                      {SubmitIcon && <SubmitIcon className="h-4 w-4 mr-2" />}
                      {getValue(submitLabel, currentMode)}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

export type { FormMode }
