/**
 * Patch Register Form
 * 패치 파일 등록 폼 (파일 동기화에서 사용)
 */

import { useState } from 'react'

import { Layers, type LucideIcon } from 'lucide-react'

import { useAccounts, type Account } from '@/entities/operations'
import { useSites, type Site } from '@/entities/sites'

import { Combobox } from '@/shared/ui/combobox'
import { FormSheet } from '@/shared/ui/form-sheet'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'

import type { FileSyncResult, PatchRegisterItem } from '../api/types'

interface PatchRegisterFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: FileSyncResult | null
  isSubmitting: boolean
  onSubmit: (data: PatchRegisterItem) => void
  /** 페이지 헤더와 동일한 아이콘 */
  icon?: LucideIcon
}

export function PatchRegisterForm({
  open,
  onOpenChange,
  item,
  isSubmitting,
  onSubmit,
  icon: PageIcon = Layers,
}: PatchRegisterFormProps) {
  const [assigneeId, setAssigneeId] = useState<number | null>(null)
  const [siteCode, setSiteCode] = useState('')
  const [description, setDescription] = useState('')

  // 사이트 및 계정 목록 조회 (담당자는 엔지니어만)
  const { data: sitesResponse } = useSites()
  const { data: accountsResponse } = useAccounts({ departmentType: 'ENGINEER', size: 10000 })

  const sites = sitesResponse?.content ?? []
  const accounts = accountsResponse?.content ?? []

  const handleClose = () => {
    setAssigneeId(null)
    setSiteCode('')
    setDescription('')
    onOpenChange(false)
  }

  const handleSubmit = () => {
    if (!item) return

    const data: PatchRegisterItem = {
      id: item.id,
      ...(assigneeId !== null && { assigneeId }),
      ...(siteCode && { siteCode }),
      ...(description.trim() && { description: description.trim() }),
    }

    onSubmit(data)
  }

  return (
    <FormSheet
      open={open}
      icon={PageIcon}
      title="패치 파일 등록"
      description="파일을 패치로 등록합니다. 추가 정보를 입력하세요."
      submitLabel="등록"
      submitIcon={PageIcon}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onClose={handleClose}
      width="w-[500px] sm:max-w-[500px]"
    >
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

      {/* 사이트 */}
      <div className="space-y-2">
        <Label>사이트</Label>
        <Combobox
          options={[
            { value: '__none__', label: '선택 안함' },
            ...sites.map((c: Site) => ({
              value: c.siteCode,
              label: `${c.siteName} (${c.siteCode})`,
            })),
          ]}
          value={siteCode || '__none__'}
          onValueChange={(value) =>
            setSiteCode(value === '__none__' ? '' : value)
          }
          placeholder="선택 안함"
          searchPlaceholder="사이트 검색..."
        />
        <p className="text-xs text-muted-foreground">
          사이트를 선택하면 커스텀 패치로 등록됩니다.
        </p>
      </div>

      {/* 담당자 */}
      <div className="space-y-2">
        <Label>담당자</Label>
        <Combobox
          options={[
            { value: '__none__', label: '선택 안함' },
            ...accounts.map((a: Account) => ({
              value: String(a.accountId),
              label: `${a.accountName} (${a.departmentName || '부서 없음'})`,
            })),
          ]}
          value={assigneeId !== null ? String(assigneeId) : '__none__'}
          onValueChange={(value) =>
            setAssigneeId(value === '__none__' ? null : Number(value))
          }
          placeholder="선택 안함"
          searchPlaceholder="담당자 검색..."
        />
      </div>

      {/* 설명 */}
      <div className="space-y-2">
        <Label>설명</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="패치에 대한 설명"
          rows={3}
        />
      </div>
    </FormSheet>
  )
}
