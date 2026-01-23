/**
 * Post Form Validation
 * 게시글 폼 유효성 검증
 */

import type { PostFormData } from './types'

export interface ValidationResult {
  isValid: boolean
  errors: Partial<Record<keyof PostFormData, string>>
}

export function validatePostForm(data: PostFormData): ValidationResult {
  const errors: Partial<Record<keyof PostFormData, string>> = {}

  if (!data.title.trim()) {
    errors.title = '제목을 입력해주세요.'
  } else if (data.title.length > 200) {
    errors.title = '제목은 200자 이내로 입력해주세요.'
  }

  // HTML 태그 제거 후 컨텐츠 길이 확인
  const plainText = data.content.replace(/<[^>]*>/g, '').trim()
  if (!plainText) {
    errors.content = '내용을 입력해주세요.'
  }

  const isValid = Object.keys(errors).length === 0

  return { isValid, errors }
}

/**
 * HTML 내용에서 첫 번째 이미지 URL 추출
 */
export function extractFirstImageUrl(html: string): string | null {
  const imgMatch = html.match(/<img[^>]+src="([^"]+)"/)
  return imgMatch ? imgMatch[1] : null
}

/**
 * HTML 내용을 Plain text로 변환 (미리보기용)
 */
export function htmlToPlainText(html: string, maxLength: number = 200): string {
  const text = html
    .replace(/<[^>]*>/g, '') // HTML 태그 제거
    .replace(/&nbsp;/g, ' ') // &nbsp; 처리
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ') // 연속 공백 정리
    .trim()

  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
