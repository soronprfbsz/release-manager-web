/**
 * Shared API Types
 * 공통 API 타입 정의 (비즈니스 로직 없음)
 */

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  timestamp?: string
}

export interface ApiError {
  success: false
  error: string
  message: string
  timestamp: string
}

export interface PaginationParams {
  page?: number
  size?: number
  sort?: string
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
