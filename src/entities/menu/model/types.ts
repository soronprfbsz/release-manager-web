/**
 * Menu Entity Types
 * 메뉴 도메인 타입 정의
 */

/**
 * API 응답 메뉴 항목
 * 서버에서 받는 원본 데이터 구조
 */
export interface MenuResponse {
  menuId: string
  menuName: string
  children: MenuResponse[]
}

/**
 * 메뉴 ID 타입
 * 타입 안전성을 위한 리터럴 타입
 */
export type MenuId =
  // 버전 관리
  | 'version_management'
  | 'version_standard'
  | 'version_custom'
  // 패치 관리
  | 'patch_management'
  | 'patch_standard'
  | 'patch_custom'
  // 운영 관리
  | 'operation_management'
  | 'operation_customer'
  | 'operation_engineer'
  | 'operation_account'
  // 작업 관리
  | 'job_management'
  | 'job_mariadb'
  | 'job_terminal'
  // 리소스 관리
  | 'resource_management'
