/**
 * Form Sheet Component
 * 폼을 위한 공통 Sheet 래퍼 컴포넌트
 */

import { Loader2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from './button'
import { ScrollArea } from './scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './sheet'

type FormMode = 'create' | 'edit' | null

interface FormSheetProps {
  mode: FormMode
  icon: LucideIcon
  title: { create: string; edit: string }
  description: { create: string; edit: string }
  submitLabel?: { create: string; edit: string }
  isSubmitting: boolean
  onSubmit: () => void
  onClose: () => void
  children: ReactNode
  width?: string
}

export function FormSheet({
  mode,
  icon: Icon,
  title,
  description,
  submitLabel = { create: '등록', edit: '수정' },
  isSubmitting,
  onSubmit,
  onClose,
  children,
  width = 'w-[400px] sm:max-w-[400px]',
}: FormSheetProps) {
  return (
    <Sheet open={mode !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className={width}>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {mode === 'create' ? title.create : title.edit}
          </SheetTitle>
          <SheetDescription>
            {mode === 'create' ? description.create : description.edit}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] mt-6 pr-4">
          <div className="space-y-5">
            {children}

            {/* 버튼 */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                취소
              </Button>
              <Button
                onClick={onSubmit}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {mode === 'create' ? submitLabel.create : submitLabel.edit}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

export type { FormMode }
