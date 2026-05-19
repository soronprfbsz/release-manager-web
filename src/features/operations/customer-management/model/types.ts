/**
 * Customer Management Feature Types
 * 고객사 관리 기능 타입 정의
 */

export interface CustomerFormData {
  customerCode: string
  customerName: string
  description: string
  isActive: boolean
  projectId: string
  glyphText: string
  glyphBackgroundColor: string
}

export interface CustomerFiltersState {
  keyword: string
  isActive: 'all' | 'true' | 'false'
}

export type CustomerFormMode = 'create' | 'edit' | null
