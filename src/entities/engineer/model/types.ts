/**
 * Engineer Entity Types
 * 엔지니어 도메인 타입 정의
 */

export interface Engineer {
  engineerId: number
  engineerName: string
  engineerEmail: string
  departmentId: number | null
  departmentName: string | null
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface EngineerCreateRequest {
  engineerName: string
  engineerEmail: string
  departmentId?: number
  description?: string
}

export interface EngineerUpdateRequest {
  engineerName?: string
  engineerEmail?: string
  departmentId?: number
  description?: string
}
