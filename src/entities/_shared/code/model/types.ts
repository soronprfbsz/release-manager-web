/**
 * 코드 간단 응답 (셀렉트박스, 라디오버튼 등에서 사용)
 */
export interface CodeSimpleResponse {
  /** 코드 값 (value) */
  value: string
  /** 코드 이름 (표시용 label) */
  name: string
  /** 정렬 순서 */
  sortOrder: number
}

/**
 * 코드 타입 상수
 */
export const CODE_TYPE = {
  RELEASE_CATEGORY: 'RELEASE_CATEGORY',
  FILE_CATEGORY: 'FILE_CATEGORY',
  DATABASE_TYPE: 'DATABASE_TYPE',
  RELEASE_TYPE: 'RELEASE_TYPE',
  // 리소스 파일 카테고리
  RESOURCE_FILE_CATEGORY: 'RESOURCE_FILE_CATEGORY',
  RESOURCE_SUBCATEGORY_SCRIPT: 'RESOURCE_SUBCATEGORY_SCRIPT',
  RESOURCE_SUBCATEGORY_DOCUMENT: 'RESOURCE_SUBCATEGORY_DOCUMENT',
  // 엔지니어 직급
  POSITION: 'POSITION',
  // 서비스 타입
  SERVICE_TYPE: 'SERVICE_TYPE',
  // 리소스 링크 카테고리
  LINK_CATEGORY: 'LINK_CATEGORY',
  LINK_SUBCATEGORY: 'LINK_SUBCATEGORY',
  // 파일 동기화 액션
  FILE_SYNC_ACTION: 'FILE_SYNC_ACTION',
} as const

export type CodeType = typeof CODE_TYPE[keyof typeof CODE_TYPE]
