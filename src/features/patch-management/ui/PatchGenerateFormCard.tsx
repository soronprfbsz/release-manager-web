/**
 * Patch Generate Form Card Component
 * 패치 생성 폼 카드 컴포넌트
 */

import { ArrowRight, GitBranch, Layers, Loader2, Package } from 'lucide-react'

import type { Customer } from '@/entities/customer'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'
import { TypographyMuted } from '@/shared/ui/typography'

import type { PatchCreateFormData } from '../model/types'

type ReleaseType = 'STANDARD' | 'CUSTOM'

interface PatchGenerateFormCardProps {
  releaseType: ReleaseType
  formData: PatchCreateFormData
  versions: string[]
  customers: Customer[]
  isVersionsLoading: boolean
  isSubmitting: boolean
  onReleaseTypeChange: (type: ReleaseType) => void
  onFormDataChange: (data: PatchCreateFormData) => void
  onSubmit: () => void
}

export function PatchGenerateFormCard({
  releaseType,
  formData,
  versions,
  customers,
  isVersionsLoading,
  isSubmitting,
  onReleaseTypeChange,
  onFormDataChange,
  onSubmit,
}: PatchGenerateFormCardProps) {
  const handleFromVersionChange = (value: string) => {
    onFormDataChange({
      ...formData,
      fromVersion: value,
      toVersion: formData.toVersion && value >= formData.toVersion ? '' : formData.toVersion,
    })
  }

  const filteredToVersions = versions.filter(
    (v) => formData.fromVersion && v > formData.fromVersion
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          패치 생성
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Release Type */}
        <div className="space-y-2">
          <Label>릴리즈 타입 *</Label>
          <div className="flex gap-2">
            <Button
              variant={releaseType === 'STANDARD' ? 'default' : 'outline'}
              onClick={() => {
                onReleaseTypeChange('STANDARD')
                onFormDataChange({ ...formData, fromVersion: '', toVersion: '' })
              }}
              className="flex-1"
            >
              <Package className="h-4 w-4 mr-2" />
              Standard
            </Button>
            <Button
              variant={releaseType === 'CUSTOM' ? 'default' : 'outline'}
              onClick={() => {
                onReleaseTypeChange('CUSTOM')
                onFormDataChange({ ...formData, fromVersion: '', toVersion: '' })
              }}
              className="flex-1"
              disabled
              title="추후 지원 예정"
            >
              <GitBranch className="h-4 w-4 mr-2" />
              Custom
            </Button>
          </div>
          <TypographyMuted className="text-xs">
            * 커스텀 릴리즈는 추후 지원 예정입니다.
          </TypographyMuted>
        </div>

        {/* Version Selection */}
        <div className="space-y-2">
          <Label>버전 범위 *</Label>
          <div className="flex items-center gap-3">
            <Select
              value={formData.fromVersion}
              onValueChange={handleFromVersionChange}
              disabled={isVersionsLoading || versions.length === 0}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="시작 버전 선택" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <Select
              value={formData.toVersion}
              onValueChange={(value) => onFormDataChange({ ...formData, toVersion: value })}
              disabled={isVersionsLoading || versions.length === 0 || !formData.fromVersion}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="종료 버전 선택" />
              </SelectTrigger>
              <SelectContent>
                {filteredToVersions.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isVersionsLoading && <TypographyMuted>버전 목록을 불러오는 중...</TypographyMuted>}
          {!isVersionsLoading && versions.length === 0 && (
            <TypographyMuted>등록된 버전이 없습니다.</TypographyMuted>
          )}
        </div>

        {/* Customer */}
        <div className="space-y-2">
          <Label>고객사</Label>
          <Select
            value={formData.customerCode || '__none__'}
            onValueChange={(value) =>
              onFormDataChange({
                ...formData,
                customerCode: value === '__none__' ? '' : value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="선택 안함" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">선택 안함</SelectItem>
              {customers.map((c) => (
                <SelectItem key={c.customerId} value={c.customerCode}>
                  {c.customerName} ({c.customerCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Assigned Engineer */}
        <div className="space-y-2">
          <Label>담당 엔지니어</Label>
          <Input
            value={formData.assignedEngineer}
            onChange={(e) =>
              onFormDataChange({ ...formData, assignedEngineer: e.target.value })
            }
            placeholder="패치 담당 엔지니어 이름을 입력하세요"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>설명</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
            placeholder="패치에 대한 설명을 입력하세요 (예: 특정 버그 수정, 기능 추가 등)"
            className="min-h-[80px]"
          />
        </div>

        {/* Info Message */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <TypographyMuted>
            선택한 버전 범위 내의 모든 변경사항(MariaDB, CrateDB)이 하나의 패치 파일로
            생성됩니다.
          </TypographyMuted>
        </div>

        {/* Submit Button */}
        <Button
          onClick={onSubmit}
          disabled={!formData.fromVersion || !formData.toVersion || isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              생성 중...
            </>
          ) : (
            <>
              <Layers className="h-4 w-4 mr-2" />
              패치 생성
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

export type { ReleaseType }
