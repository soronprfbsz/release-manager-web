/**
 * Comment Form Validation
 * 댓글 폼 유효성 검증
 */

import type { CommentFormData } from './types'

export interface ValidationResult {
  isValid: boolean
  errors: Partial<Record<keyof CommentFormData, string>>
}

export function validateCommentForm(data: CommentFormData): ValidationResult {
  const errors: Partial<Record<keyof CommentFormData, string>> = {}

  const content = data.content.trim()

  if (!content) {
    errors.content = '댓글 내용을 입력해주세요.'
  } else if (content.length > 2000) {
    errors.content = '댓글은 2000자 이내로 입력해주세요.'
  }

  const isValid = Object.keys(errors).length === 0

  return { isValid, errors }
}
