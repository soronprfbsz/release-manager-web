/**
 * Engineer Entity Types
 * 엔지니어 도메인 타입 정의
 */

export interface Engineer {
  engineerId: number
  engineerName: string
  engineerEmail: string
  engineerPhone: string | null
  department: string | null
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface EngineerCreateRequest {
  engineerName: string
  engineerEmail: string
  engineerPhone?: string
  department?: string
  description?: string
}

export interface EngineerUpdateRequest {
  engineerName?: string
  engineerEmail?: string
  engineerPhone?: string
  department?: string
  description?: string
}
