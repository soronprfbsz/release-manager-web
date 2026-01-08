/**
 * Patch Generate Form Card Component
 * 패치 생성 폼 카드 컴포넌트
 */

import { ArrowRight, GitBranch, Layers, Loader2, Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import type { Customer } from '@/entities/operations'
import type { Engineer } from '@/entities/operations'

import { ROUTES } from '@/shared/config/constants'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Checkbox } from '@/shared/ui/checkbox'
import { Combobox } from '@/shared/ui/combobox'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { TypographyMuted } from '@/shared/ui/typography'

import type { PatchCreateFormData } from '../model/types'

type ReleaseType = 'STANDARD' | 'CUSTOM'

interface PatchGenerateFormCardProps {
  releaseType: ReleaseType
  formData: PatchCreateFormData
  versions: string[]
  customers: Customer[]
  engineers: Engineer[]
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
  engineers,
  isVersionsLoading,
  isSubmitting,
  onReleaseTypeChange,
  onFormDataChange,
  onSubmit,
}: PatchGenerateFormCardProps) {
  const navigate = useNavigate()

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

  const handleCustomClick = () => {
    navigate(ROUTES.PATCHES.CUSTOM)
  }

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
              onClick={handleCustomClick}
              className="flex-1"
            >
              <GitBranch className="h-4 w-4 mr-2" />
              Custom
            </Button>
          </div>
        </div>

        {/* Version Selection */}
        <div className="space-y-2">
          <Label required>버전 범위</Label>
          <div className="flex items-center gap-3">
            <Combobox
              options={versions.map((v) => ({ value: v, label: v }))}
              value={formData.fromVersion}
              onValueChange={handleFromVersionChange}
              placeholder="시작 버전"
              searchPlaceholder="버전 검색..."
              disabled={isVersionsLoading || versions.length === 0}
              className="flex-1"
            />
            <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <Combobox
              options={filteredToVersions.map((v) => ({ value: v, label: v }))}
              value={formData.toVersion}
              onValueChange={(value) => onFormDataChange({ ...formData, toVersion: value })}
              placeholder="종료 버전"
              searchPlaceholder="버전 검색..."
              disabled={isVersionsLoading || versions.length === 0 || !formData.fromVersion}
              className="flex-1"
            />
          </div>
          {isVersionsLoading && <TypographyMuted>버전 목록을 불러오는 중...</TypographyMuted>}
          {!isVersionsLoading && versions.length === 0 && (
            <TypographyMuted>등록된 버전이 없습니다.</TypographyMuted>
          )}
        </div>

        {/* Customer */}
        <div className="space-y-2">
          <Label>고객사</Label>
          <Combobox
            options={[
              { value: '__none__', label: '선택 안함' },
              ...customers.map((c) => ({
                value: c.customerCode,
                label: `${c.customerName} (${c.customerCode})`,
              })),
            ]}
            value={formData.customerCode || '__none__'}
            onValueChange={(value) =>
              onFormDataChange({
                ...formData,
                customerCode: value === '__none__' || !value ? '' : value,
              })
            }
            placeholder="선택 안함"
            searchPlaceholder="고객사 검색..."
          />
        </div>

        {/* Assigned Engineer */}
        <div className="space-y-2">
          <Label>담당 엔지니어</Label>
          <Combobox
            options={[
              { value: '__none__', label: '선택 안함' },
              ...engineers.map((e) => ({
                value: String(e.engineerId),
                label: `${e.engineerName} (${e.departmentName || '부서 없음'})`,
              })),
            ]}
            value={formData.engineerId !== null ? String(formData.engineerId) : '__none__'}
            onValueChange={(value) =>
              onFormDataChange({
                ...formData,
                engineerId: value === '__none__' || !value ? null : Number(value),
              })
            }
            placeholder="선택 안함"
            searchPlaceholder="엔지니어 검색..."
          />
        </div>

        {/* Patch Name */}
        <div className="space-y-2">
          <Label>패치명</Label>
          <Input
            value={formData.patchName}
            onChange={(e) => onFormDataChange({ ...formData, patchName: e.target.value })}
            placeholder="미입력 시 자동 생성 (e.g. 20260102_1.0.0_1.1.0)"
            maxLength={100}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>설명</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
            placeholder="패치에 대한 설명을 입력하세요 (e.g. 특정 버그 수정, 기능 추가 등)"
            className="min-h-[80px]"
          />
        </div>

        {/* Include All Build Versions */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="includeAllBuildVersions"
            checked={formData.includeAllBuildVersions}
            onCheckedChange={(checked) =>
              onFormDataChange({ ...formData, includeAllBuildVersions: checked === true })
            }
          />
          <div className="space-y-1">
            <Label htmlFor="includeAllBuildVersions" className="cursor-pointer">
              모든 빌드 버전 포함
            </Label>
            <TypographyMuted className="text-xs">
              WEB/ENGINE 카테고리의 모든 빌드 버전을 포함합니다. 체크 해제 시 마지막 버전만 포함됩니다.
            </TypographyMuted>
          </div>
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
