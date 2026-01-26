/**
 * Post Form Component
 * 게시글 작성/수정 폼 컴포넌트
 */

import { useState, useCallback, useRef, useEffect } from 'react'

import { FileText } from 'lucide-react'

import type { Post, IssueStatus, IssuePriority } from '@/entities/board'
import { useUploadPostImage } from '@/entities/board'

import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Switch } from '@/shared/ui/switch'
import { FormSheet } from '@/shared/ui/form-sheet'
import { RichTextEditor, type RichTextEditorRef } from '@/shared/ui/rich-text-editor'
import { cn } from '@/shared/lib/utils'

import type { PostFormData, PostFormMode } from '../model/types'
import { INITIAL_POST_FORM_DATA } from '../model/types'
import { validatePostForm, type ValidationResult } from '../model/validation'

interface PostFormProps {
  mode: PostFormMode
  post?: Post | null
  topicId: string
  showIssueTracking?: boolean // 자유게시판용 이슈 트래킹 필드 표시
  isSubmitting: boolean
  onSubmit: (data: PostFormData) => void
  onClose: () => void
}

const STATUS_OPTIONS: { value: IssueStatus; label: string }[] = [
  { value: 'OPEN', label: '미해결' },
  { value: 'IN_PROGRESS', label: '진행중' },
  { value: 'RESOLVED', label: '해결됨' },
  { value: 'CLOSED', label: '종료' },
]

const PRIORITY_OPTIONS: { value: IssuePriority; label: string }[] = [
  { value: 'LOW', label: '낮음' },
  { value: 'MEDIUM', label: '중간' },
  { value: 'HIGH', label: '높음' },
  { value: 'URGENT', label: '긴급' },
]

export function PostForm({
  mode,
  post,
  showIssueTracking = false,
  isSubmitting,
  onSubmit,
  onClose,
}: PostFormProps) {
  const editorRef = useRef<RichTextEditorRef>(null)
  const uploadImage = useUploadPostImage()

  const [formData, setFormData] = useState<PostFormData>(INITIAL_POST_FORM_DATA)
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    errors: {},
  })

  // 편집 모드일 때 기존 데이터로 초기화
  useEffect(() => {
    if (mode === 'edit' && post) {
      setFormData({
        title: post.title,
        content: post.content,
        isPinned: post.isPinned,
        status: post.issue?.status ?? null,
        priority: post.issue?.priority ?? null,
        assigneeId: post.issue?.assigneeId ?? null,
      })
    } else if (mode === 'create') {
      setFormData(INITIAL_POST_FORM_DATA)
    }
  }, [mode, post, showIssueTracking])

  const handleImageUpload = useCallback(
    async (file: File): Promise<string> => {
      console.log('[PostForm] Uploading image:', file.name)
      const result = await uploadImage.mutateAsync({ file })
      console.log('[PostForm] Upload result:', result)
      return result
    },
    [uploadImage]
  )

  const handleSubmit = () => {
    const result = validatePostForm(formData)
    setValidation(result)

    if (!result.isValid) return

    onSubmit(formData)
  }

  const handleClose = () => {
    setFormData(INITIAL_POST_FORM_DATA)
    setValidation({ isValid: true, errors: {} })
    onClose()
  }

  return (
    <FormSheet
      mode={mode}
      open={mode !== null}
      onClose={handleClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      icon={FileText}
      title={{ create: '게시글 작성', edit: '게시글 수정' }}
      description={{
        create: '새로운 게시글을 작성합니다',
        edit: '게시글 내용을 수정합니다',
      }}
      submitLabel={{ create: '작성', edit: '수정' }}
      width="w-full sm:max-w-2xl"
    >
      {/* 제목 */}
      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="제목을 입력하세요"
          className={cn(validation.errors.title && 'border-destructive')}
        />
        {validation.errors.title && (
          <p className="text-xs text-destructive">{validation.errors.title}</p>
        )}
      </div>

      {/* 내용 */}
      <div className="space-y-2">
        <Label>내용</Label>
        <RichTextEditor
          ref={editorRef}
          value={formData.content}
          onChange={(html) =>
            setFormData((prev) => ({ ...prev, content: html }))
          }
          placeholder="내용을 입력하세요"
          onImageUpload={handleImageUpload}
          minHeight="250px"
          error={!!validation.errors.content}
        />
        {validation.errors.content && (
          <p className="text-xs text-destructive">
            {validation.errors.content}
          </p>
        )}
      </div>

      {/* 고정 게시글 */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="isPinned">고정 게시글</Label>
          <p className="text-xs text-muted-foreground">
            게시글 상단에 고정됩니다
          </p>
        </div>
        <Switch
          id="isPinned"
          checked={formData.isPinned}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({ ...prev, isPinned: checked }))
          }
        />
      </div>

      {/* 자유게시판 이슈 트래킹 필드 */}
      {showIssueTracking && (
        <>
          <div className="h-px bg-border" />

          <div className="grid grid-cols-2 gap-4">
            {/* 상태 */}
            <div className="space-y-2">
              <Label>상태</Label>
              <Select
                value={formData.status || '_none'}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: value === '_none' ? null : (value as IssueStatus),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">선택 안함</SelectItem>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 우선순위 */}
            <div className="space-y-2">
              <Label>우선순위</Label>
              <Select
                value={formData.priority || '_none'}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: value === '_none' ? null : (value as IssuePriority),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="우선순위 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">선택 안함</SelectItem>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* TODO: 담당자 선택 (사용자 목록 API 연동 필요) */}
        </>
      )}
    </FormSheet>
  )
}
