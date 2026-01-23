/**
 * Comment Form Component
 * 댓글 입력 폼 컴포넌트
 */

import { useState, useEffect, useRef } from 'react'

import { Loader2, X, CornerDownRight } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/textarea'
import { cn } from '@/shared/lib/utils'

import type { CommentFormData, CommentFormMode } from '../model/types'
import { validateCommentForm } from '../model/validation'

interface CommentFormProps {
  mode: CommentFormMode
  initialContent?: string
  replyToName?: string | null // 대댓글 대상 이름
  isSubmitting: boolean
  onSubmit: (data: CommentFormData) => void
  onCancel?: () => void
  parentCommentId?: number | null
  placeholder?: string
}

export function CommentForm({
  mode,
  initialContent = '',
  replyToName,
  isSubmitting,
  onSubmit,
  onCancel,
  parentCommentId = null,
  placeholder = '댓글을 입력하세요...',
}: CommentFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [content, setContent] = useState(initialContent)
  const [error, setError] = useState<string | null>(null)

  // 모드 변경 시 초기화
  useEffect(() => {
    setContent(initialContent)
    setError(null)
    if (mode === 'reply' || mode === 'edit') {
      textareaRef.current?.focus()
    }
  }, [mode, initialContent])

  const handleSubmit = () => {
    const formData: CommentFormData = {
      content: content.trim(),
      parentCommentId,
    }

    const result = validateCommentForm(formData)
    if (!result.isValid) {
      setError(result.errors.content || null)
      return
    }

    setError(null)
    onSubmit(formData)
  }

  const handleCancel = () => {
    setContent('')
    setError(null)
    onCancel?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter로 제출
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
    // Escape로 취소 (대댓글/수정 모드)
    if (e.key === 'Escape' && (mode === 'reply' || mode === 'edit')) {
      handleCancel()
    }
  }

  const isReplyMode = mode === 'reply'
  const isEditMode = mode === 'edit'

  return (
    <div className={cn('space-y-2', isReplyMode && 'pl-8')}>
      {/* 대댓글 표시 */}
      {isReplyMode && replyToName && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CornerDownRight className="h-4 w-4" />
          <span>@{replyToName}에게 답글</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0"
            onClick={handleCancel}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* 입력 영역 */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            if (error) setError(null)
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'min-h-[80px] resize-none pr-20',
            error && 'border-destructive'
          )}
          disabled={isSubmitting}
        />

        {/* 제출 버튼 */}
        <div className="absolute right-2 bottom-2 flex items-center gap-1">
          {(isReplyMode || isEditMode) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              취소
            </Button>
          )}
          <Button
            size="sm"
            className="h-7"
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
            {isEditMode ? '수정' : '등록'}
          </Button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* 단축키 안내 */}
      <p className="text-xs text-muted-foreground">
        Ctrl + Enter로 등록 {(isReplyMode || isEditMode) && '/ Esc로 취소'}
      </p>
    </div>
  )
}
