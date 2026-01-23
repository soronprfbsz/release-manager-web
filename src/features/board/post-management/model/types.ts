/**
 * Post Management Feature Types
 * 게시글 관리 기능 타입 정의
 */

import type { IssueStatus, IssuePriority } from '@/entities/board'

export interface PostFormData {
  title: string
  content: string // HTML
  isPinned: boolean
  status: IssueStatus | null
  priority: IssuePriority | null
  assigneeId: number | null
}

export const INITIAL_POST_FORM_DATA: PostFormData = {
  title: '',
  content: '',
  isPinned: false,
  status: null,
  priority: null,
  assigneeId: null,
}

export type PostFormMode = 'create' | 'edit' | null

export interface PostFiltersState {
  sort: 'top' | 'newest'
  keyword: string
}
