/**
 * Project Management Feature Types
 * 프로젝트 관리 기능 타입 정의
 */

export interface ProjectFormData {
  projectId: string
  projectName: string
  description: string
}

export type ProjectFormMode = 'create' | 'edit' | null

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}
