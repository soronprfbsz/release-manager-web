/**
 * Comment Management Feature Types
 * 댓글 관리 기능 타입 정의
 */

export interface CommentFormData {
  content: string
  parentCommentId: number | null
}

export const INITIAL_COMMENT_FORM_DATA: CommentFormData = {
  content: '',
  parentCommentId: null,
}

export type CommentFormMode = 'create' | 'edit' | 'reply' | null
