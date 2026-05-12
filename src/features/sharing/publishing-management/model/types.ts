/**
 * Publishing Management Types
 * 퍼블리싱 관리 관련 타입 정의
 */

/** 퍼블리싱 업로드 폼 데이터 */
export interface PublishingUploadFormData {
  file: File | null
  publishingName: string
  publishingCategory: string    // INFRAEYE1, INFRAEYE2, COMMON, ETC
  subCategory: string           // DASHBOARD, REPORT, MONITORING 등
  description: string
  customerId: number | null     // 고객사 ID (커스터마이징용)
  glyphText: string
  glyphBackgroundColor: string
}

/** 퍼블리싱 필터 상태 */
export interface PublishingFiltersState {
  keyword: string
  publishingCategory: string
}
