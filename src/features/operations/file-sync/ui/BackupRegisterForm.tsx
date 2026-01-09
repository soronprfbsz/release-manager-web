/**
 * Backup Register Form
 * 백업 파일 등록 폼 (파일 동기화에서 사용)
 */

import { useState } from 'react'

import { Database, type LucideIcon } from 'lucide-react'

import { FormSheet } from '@/shared/ui/form-sheet'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'

import type { FileSyncResult, BackupRegisterItem } from '../api/types'

interface BackupRegisterFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: FileSyncResult | null
  isSubmitting: boolean
  onSubmit: (data: BackupRegisterItem) => void
  /** 페이지 헤더와 동일한 아이콘 */
  icon?: LucideIcon
}

export function BackupRegisterForm({
  open,
  onOpenChange,
  item,
  isSubmitting,
  onSubmit,
  icon: PageIcon = Database,
}: BackupRegisterFormProps) {
  const [fileCategory, setFileCategory] = useState('')
  const [description, setDescription] = useState('')

  const handleClose = () => {
    setFileCategory('')
    setDescription('')
    onOpenChange(false)
  }

  const handleSubmit = () => {
    if (!item) return

    const data: BackupRegisterItem = {
      id: item.id,
      ...(fileCategory.trim() && { fileCategory: fileCategory.trim() }),
      ...(description.trim() && { description: description.trim() }),
    }

    onSubmit(data)
  }

  return (
    <FormSheet
      open={open}
      icon={PageIcon}
      title="백업 파일 등록"
      description="파일을 백업으로 등록합니다. 추가 정보를 입력하세요."
      submitLabel="등록"
      submitIcon={PageIcon}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onClose={handleClose}
      width="w-[450px] sm:max-w-[450px]"
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

      {/* 카테고리 */}
      <div className="space-y-2">
        <Label>카테고리</Label>
        <Input
          value={fileCategory}
          onChange={(e) => setFileCategory(e.target.value)}
          placeholder="카테고리 (선택, e.g. MARIADB)"
        />
        <p className="text-xs text-muted-foreground">
          미입력 시 파일 경로에서 자동 추론됩니다.
        </p>
      </div>

      {/* 설명 */}
      <div className="space-y-2">
        <Label>설명</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="백업 파일에 대한 설명"
          rows={3}
        />
      </div>
    </FormSheet>
  )
}
