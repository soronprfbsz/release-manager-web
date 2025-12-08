/**
 * Project Entity Types
 * 프로젝트 도메인 타입 정의
 */

export interface Project {
  projectId: string
  projectName: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProjectCreateRequest {
  projectId: string
  projectName: string
  description?: string
}

export interface ProjectUpdateRequest {
  projectName?: string
  description?: string
  isActive?: boolean
}

/** 기본 프로젝트 ID */
export const DEFAULT_PROJECT_ID = 'infraeye2'
