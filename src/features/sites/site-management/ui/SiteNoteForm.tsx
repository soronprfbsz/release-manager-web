/**
 * Site Note Form Component
 * 사이트 특이사항 폼 컴포넌트 (Sheet)
 */

import { useState, useEffect } from 'react'

import { StickyNote, Save } from 'lucide-react'

import type { SiteNote } from '@/entities/sites/site-note'

import { FormSheet } from '@/shared/ui/form-sheet'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'

export type SiteNoteFormMode = 'create' | 'edit' | null

export interface SiteNoteFormData {
  title: string
  content: string
}

export const INITIAL_NOTE_FORM_DATA: SiteNoteFormData = {
  title: '',
  content: '',
}

interface SiteNoteFormProps {
  open: boolean
  mode: SiteNoteFormMode
  initialData?: SiteNote | null
  isSubmitting: boolean
  onSubmit: (data: SiteNoteFormData) => void
  onClose: () => void
}

export function SiteNoteForm({
  open,
  mode,
  initialData,
  isSubmitting,
  onSubmit,
  onClose,
}: SiteNoteFormProps) {
  const [formData, setFormData] = useState<SiteNoteFormData>(INITIAL_NOTE_FORM_DATA)

  // 초기 데이터 설정
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({ title: initialData.title, content: initialData.content })
    } else if (mode === 'create') {
      setFormData(INITIAL_NOTE_FORM_DATA)
    }
  }, [mode, initialData])

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      return
    }
    onSubmit(formData)
  }

  return (
    <FormSheet
      open={open}
      mode={mode || 'create'}
      icon={StickyNote}
      title={{
        create: '특이사항 등록',
        edit: '특이사항 수정',
      }}
      description={{
        create: '사이트의 특이사항을 등록합니다.',
        edit: '사이트의 특이사항을 수정합니다.',
      }}
      submitLabel={mode === 'edit' ? '수정' : '등록'}
      submitIcon={Save}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="note-title">
            제목 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="note-title"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="제목을 입력하세요"
            maxLength={200}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="note-content">
            내용 <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="note-content"
            value={formData.content}
            onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
            placeholder="특이사항 내용을 입력하세요..."
            className="min-h-[200px] resize-none"
            disabled={isSubmitting}
          />
        </div>
      </div>
    </FormSheet>
  )
}
