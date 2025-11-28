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
  status: 'fail' | 'error'
  data: {
    code: string
    message: string
    detail?: Record<string, string>
  }
}

export interface PaginationParams {
  page?: number
  size?: number
  sort?: string
}

/**
 * Spring Data JPA Page 응답 형식
 */
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
  numberOfElements: number
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      sorted: boolean
      empty: boolean
      unsorted: boolean
    }
    offset: number
    paged: boolean
    unpaged: boolean
  }
  sort: {
    sorted: boolean
    empty: boolean
    unsorted: boolean
  }
}

/** @deprecated Use PageResponse instead */
export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
