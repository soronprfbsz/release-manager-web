/**
 * Patch Preview Card Component
 * 패치 생성 정보 미리보기 카드 컴포넌트
 */

import { Layers } from 'lucide-react'

import type { Customer } from '@/entities/customer'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { TypographyInlineCode, TypographyMuted, TypographySmall } from '@/shared/ui/typography'

import type { PatchCreateFormData } from '../model/types'

type ReleaseType = 'STANDARD' | 'CUSTOM'

interface PatchPreviewCardProps {
  releaseType: ReleaseType
  formData: PatchCreateFormData
  customers: Customer[]
  userEmail?: string
}

export function PatchPreviewCard({
  releaseType,
  formData,
  customers,
  userEmail,
}: PatchPreviewCardProps) {
  const selectedCustomer = customers.find((c) => c.customerCode === formData.customerCode)

  if (!formData.fromVersion || !formData.toVersion) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">생성 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Layers className="h-12 w-12 mb-3 opacity-50" />
            <TypographyMuted>시작 버전과 종료 버전을 선택하면</TypographyMuted>
            <TypographyMuted>생성 정보가 표시됩니다.</TypographyMuted>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">생성 정보</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <div className="flex justify-between">
              <TypographyMuted>릴리즈 타입</TypographyMuted>
              <TypographySmall>{releaseType === 'STANDARD' ? '표준' : '커스텀'}</TypographySmall>
            </div>
            {formData.customerCode && selectedCustomer && (
              <div className="flex justify-between">
                <TypographyMuted>고객사</TypographyMuted>
                <TypographySmall>{selectedCustomer.customerName}</TypographySmall>
              </div>
            )}
            <div className="flex justify-between">
              <TypographyMuted>시작 버전</TypographyMuted>
              <TypographyInlineCode>{formData.fromVersion}</TypographyInlineCode>
            </div>
            <div className="flex justify-between">
              <TypographyMuted>종료 버전</TypographyMuted>
              <TypographyInlineCode>{formData.toVersion}</TypographyInlineCode>
            </div>
            <div className="flex justify-between">
              <TypographyMuted>생성자</TypographyMuted>
              <TypographySmall>{userEmail}</TypographySmall>
            </div>
            {formData.assignedEngineer && (
              <div className="flex justify-between">
                <TypographyMuted>담당 엔지니어</TypographyMuted>
                <TypographySmall>{formData.assignedEngineer}</TypographySmall>
              </div>
            )}
            {formData.description && (
              <div className="pt-2 border-t">
                <TypographyMuted className="block mb-1">설명</TypographyMuted>
                <TypographySmall>{formData.description}</TypographySmall>
              </div>
            )}
          </div>
          <div className="p-4 bg-blue-500/10 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              <strong>{formData.fromVersion}</strong> 초과 ~ <strong>{formData.toVersion}</strong>{' '}
              이하 버전의 모든 DB 변경사항이 포함된 패치가 생성됩니다.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
