/**
 * API Log Management Types
 * API 로그 관리 기능 타입 정의
 */

/** API 로그 필터 상태 */
export interface ApiLogFiltersState {
  keyword: string
  responseStatus: string
  httpMethod: string
}

/** 초기 필터 상태 */
export const INITIAL_API_LOG_FILTERS: ApiLogFiltersState = {
  keyword: '',
  responseStatus: 'ALL',
  httpMethod: 'ALL',
}

/** 정렬 설정 */
export interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

/** HTTP 메서드 옵션 */
export const HTTP_METHOD_OPTIONS = [
  { value: 'ALL', label: '전체' },
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'PATCH', label: 'PATCH' },
  { value: 'DELETE', label: 'DELETE' },
] as const

/** 응답 상태 코드 옵션 */
export const RESPONSE_STATUS_OPTIONS = [
  { value: 'ALL', label: '전체' },
  { value: '200', label: '200 OK' },
  { value: '201', label: '201 Created' },
  { value: '204', label: '204 No Content' },
  { value: '400', label: '400 Bad Request' },
  { value: '401', label: '401 Unauthorized' },
  { value: '403', label: '403 Forbidden' },
  { value: '404', label: '404 Not Found' },
  { value: '500', label: '500 Server Error' },
] as const
