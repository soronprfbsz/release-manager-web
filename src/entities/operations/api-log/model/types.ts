/**
 * API Log Types
 * API 로그 타입 정의
 */

/** API 로그 상세 응답 */
export interface ApiLog {
  logId: number
  requestId: string
  httpMethod: string
  requestUri: string
  queryString: string | null
  requestBody: string | null
  requestContentType: string | null
  responseStatus: number
  responseBody: string | null
  responseContentType: string | null
  clientIp: string | null
  userAgent: string | null
  accountId: number | null
  accountEmail: string | null
  executionTimeMs: number | null
  createdAt: string
}

/** API 로그 목록 응답 (간략) */
export interface ApiLogListItem {
  logId: number
  requestId: string
  httpMethod: string
  requestUri: string
  responseStatus: number
  clientIp: string | null
  accountId: number | null
  accountEmail: string | null
  accountName: string | null
  avatarStyle: string | null
  avatarSeed: string | null
  executionTimeMs: number | null
  createdAt: string
  /** rowNumber for display */
  rowNumber?: number
}

/** API 로그 검색 조건 */
export interface ApiLogSearchParams {
  httpMethod?: string
  requestUri?: string
  responseStatus?: number
  accountEmail?: string
  clientIp?: string
  startDate?: string
  endDate?: string
  keyword?: string
  page?: number
  size?: number
  sort?: string
}

/** 페이지 응답 */
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
