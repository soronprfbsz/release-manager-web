/**
 * Engineer Management Feature Types
 * 엔지니어 관리 기능 타입 정의
 */

export interface EngineerFormData {
  engineerName: string
  positionCode: string
  engineerEmail: string
  departmentId: string
  description: string
}

export interface EngineerFiltersState {
  keyword: string
}

export type EngineerFormMode = 'create' | 'edit' | null
