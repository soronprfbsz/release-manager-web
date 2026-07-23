/**
 * Custom Patch Generate Form Card Component
 * 커스텀 패치 생성 폼 카드 컴포넌트
 */

import { ArrowRight, GitBranch, Layers, Loader2 } from 'lucide-react'

import type { Account } from '@/entities/operations'
import type { CustomPatchSite, CustomPatchVersion } from '@/entities/patches/patch'

import { compareVersions } from '@/shared/lib/utils/version'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Combobox } from '@/shared/ui/combobox'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { TypographyMuted } from '@/shared/ui/typography'

import type { CustomPatchCreateFormData } from '../model/types'

interface CustomPatchGenerateFormCardProps {
  formData: CustomPatchCreateFormData
  sites: CustomPatchSite[]
  versions: CustomPatchVersion[]
  accounts: Account[]
  isSitesLoading: boolean
  isVersionsLoading: boolean
  isSubmitting: boolean
  onFormDataChange: (data: CustomPatchCreateFormData) => void
  onSubmit: () => void
}

export function CustomPatchGenerateFormCard({
  formData,
  sites,
  versions,
  accounts,
  isSitesLoading,
  isVersionsLoading,
  isSubmitting,
  onFormDataChange,
  onSubmit,
}: CustomPatchGenerateFormCardProps) {
  // 승인된 버전만 필터링
  const approvedVersions = versions.filter((v) => v.isApproved)

  // fromVersion: 승인된 모든 버전 (베이스 버전 포함)
  const fromVersionOptions = approvedVersions

  // toVersion: 베이스 버전이 아닌 것 + fromVersion보다 큰 것
  const filteredToVersions = approvedVersions.filter(
    (v) => !v.isBaseVersion && formData.fromVersion && compareVersions(v.version, formData.fromVersion) > 0
  )

  const handleFromVersionChange = (value: string) => {
    onFormDataChange({
      ...formData,
      fromVersion: value,
      toVersion: formData.toVersion && compareVersions(value, formData.toVersion) >= 0 ? '' : formData.toVersion,
    })
  }

  const selectedSite = sites.find((c) => c.siteId === formData.siteId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          커스텀 패치 생성
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Site Selection */}
        <div className="space-y-2">
          <Label required>사이트</Label>
          <Combobox
            options={sites.map((c) => ({
              value: String(c.siteId),
              label: `${c.siteName} (${c.siteCode})`,
            }))}
            value={formData.siteId ? String(formData.siteId) : ''}
            onValueChange={(value) => {
              onFormDataChange({
                ...formData,
                siteId: value ? Number(value) : null,
                fromVersion: '',
                toVersion: '',
              })
            }}
            placeholder="사이트를 선택하세요"
            searchPlaceholder="사이트 검색..."
            disabled={isSitesLoading}
          />
          {isSitesLoading && <TypographyMuted>사이트 목록을 불러오는 중...</TypographyMuted>}
          {!isSitesLoading && sites.length === 0 && (
            <TypographyMuted>커스텀 버전이 있는 사이트가 없습니다.</TypographyMuted>
          )}
        </div>

        {/* Version Selection */}
        <div className="space-y-2">
          <Label required>버전 범위</Label>
          <div className="flex items-center gap-3">
            <Combobox
              options={fromVersionOptions.map((v) => ({
                value: v.version,
                label: v.isBaseVersion ? `${v.version} (베이스)` : v.version,
              }))}
              value={formData.fromVersion}
              onValueChange={handleFromVersionChange}
              placeholder="시작 버전"
              searchPlaceholder="버전 검색..."
              disabled={isVersionsLoading || !formData.siteId || fromVersionOptions.length === 0}
              className="flex-1"
            />
            <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <Combobox
              options={filteredToVersions.map((v) => ({
                value: v.version,
                label: v.version,
              }))}
              value={formData.toVersion}
              onValueChange={(value) => onFormDataChange({ ...formData, toVersion: value })}
              placeholder="종료 버전"
              searchPlaceholder="버전 검색..."
              disabled={isVersionsLoading || !formData.siteId || !formData.fromVersion}
              className="flex-1"
            />
          </div>
          {formData.siteId && isVersionsLoading && (
            <TypographyMuted>버전 목록을 불러오는 중...</TypographyMuted>
          )}
          {formData.siteId && !isVersionsLoading && approvedVersions.length === 0 && (
            <TypographyMuted>승인된 버전이 없습니다.</TypographyMuted>
          )}
        </div>

        {/* 담당자 */}
        <div className="space-y-2">
          <Label>담당자</Label>
          <Combobox
            options={[
              { value: '__none__', label: '선택 안함' },
              ...accounts.map((a) => ({
                value: String(a.accountId),
                label: `${a.accountName} (${a.departmentName || '부서 없음'})`,
              })),
            ]}
            value={formData.assigneeId !== null ? String(formData.assigneeId) : '__none__'}
            onValueChange={(value) =>
              onFormDataChange({
                ...formData,
                assigneeId: value === '__none__' || !value ? null : Number(value),
              })
            }
            placeholder="선택 안함"
            searchPlaceholder="담당자 검색..."
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

        {/* Info Message */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <TypographyMuted>
            {selectedSite
              ? `${selectedSite.siteName}의 커스텀 버전 범위 내 모든 변경사항이 하나의 패치 파일로 생성됩니다.`
              : '사이트를 선택하면 해당 사이트의 커스텀 버전 목록이 표시됩니다.'}
          </TypographyMuted>
        </div>

        {/* Submit Button */}
        <Button
          onClick={onSubmit}
          disabled={!formData.siteId || !formData.fromVersion || !formData.toVersion || isSubmitting}
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
