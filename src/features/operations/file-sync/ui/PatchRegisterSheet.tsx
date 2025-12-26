/**
 * Patch Register Sheet
 * 패치 파일 등록 시트 (파일 동기화에서 사용)
 */

import { useState } from 'react'

import { Layers, Loader2 } from 'lucide-react'

import { useCustomers, useEngineers, type Customer, type Engineer } from '@/entities/operations'

import { Button } from '@/shared/ui/button'
import { Combobox } from '@/shared/ui/combobox'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { ScrollArea } from '@/shared/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'

import type { FileSyncResult, PatchRegisterItem } from '../api/types'

interface PatchRegisterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: FileSyncResult | null
  isSubmitting: boolean
  onSubmit: (data: PatchRegisterItem) => void
}

export function PatchRegisterSheet({
  open,
  onOpenChange,
  item,
  isSubmitting,
  onSubmit,
}: PatchRegisterSheetProps) {
  const [engineerId, setEngineerId] = useState<number | null>(null)
  const [customerCode, setCustomerCode] = useState('')
  const [description, setDescription] = useState('')

  // 고객사 및 엔지니어 목록 조회
  const { data: customersResponse } = useCustomers()
  const { data: engineersResponse } = useEngineers()

  const customers = customersResponse?.content ?? []
  const engineers = engineersResponse?.content ?? []

  const handleClose = () => {
    setEngineerId(null)
    setCustomerCode('')
    setDescription('')
    onOpenChange(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return

    const data: PatchRegisterItem = {
      id: item.id,
      ...(engineerId !== null && { engineerId }),
      ...(customerCode && { customerCode }),
      ...(description.trim() && { description: description.trim() }),
    }

    onSubmit(data)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            패치 파일 등록
          </SheetTitle>
          <SheetDescription>
            파일을 패치로 등록합니다. 추가 정보를 입력하세요.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] mt-6 pr-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 파일 정보 표시 */}
            {item && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">파일명: </span>
                  <span className="font-medium">{item.fileName}</span>
                </div>
                <div className="text-xs text-muted-foreground font-mono break-all">
                  {item.filePath}
                </div>
              </div>
            )}

            {/* 고객사 */}
            <div className="space-y-2">
              <Label>고객사</Label>
              <Combobox
                options={[
                  { value: '__none__', label: '선택 안함' },
                  ...customers.map((c: Customer) => ({
                    value: c.customerCode,
                    label: `${c.customerName} (${c.customerCode})`,
                  })),
                ]}
                value={customerCode || '__none__'}
                onValueChange={(value) =>
                  setCustomerCode(value === '__none__' ? '' : value)
                }
                placeholder="선택 안함"
                searchPlaceholder="고객사 검색..."
              />
              <p className="text-xs text-muted-foreground">
                고객사를 선택하면 커스텀 패치로 등록됩니다.
              </p>
            </div>

            {/* 담당 엔지니어 */}
            <div className="space-y-2">
              <Label>담당 엔지니어</Label>
              <Combobox
                options={[
                  { value: '__none__', label: '선택 안함' },
                  ...engineers.map((e: Engineer) => ({
                    value: String(e.engineerId),
                    label: `${e.engineerName} (${e.departmentName || '부서 없음'})`,
                  })),
                ]}
                value={engineerId !== null ? String(engineerId) : '__none__'}
                onValueChange={(value) =>
                  setEngineerId(value === '__none__' ? null : Number(value))
                }
                placeholder="선택 안함"
                searchPlaceholder="엔지니어 검색..."
              />
            </div>

            {/* 설명 */}
            <div className="space-y-2">
              <Label>설명</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="패치에 대한 설명 (선택)"
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    등록 중...
                  </>
                ) : (
                  <>
                    <Layers className="h-4 w-4 mr-2" />
                    등록
                  </>
                )}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
