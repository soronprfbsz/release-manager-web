/**
 * Engineer Entity Types
 * 엔지니어 도메인 타입 정의
 */

export interface Engineer {
  rowNumber: number
  engineerId: number
  engineerName: string
  position: string | null
  engineerEmail: string
  departmentId: number | null
  departmentName: string | null
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface EngineerCreateRequest {
  engineerName: string
  position?: string
  engineerEmail: string
  departmentId?: number
  description?: string
}

export interface EngineerUpdateRequest {
  engineerName?: string
  position?: string
  engineerEmail?: string
  departmentId?: number
  description?: string
}
