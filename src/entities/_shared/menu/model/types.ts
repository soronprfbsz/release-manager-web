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
  menuUrl?: string
  icon?: string              // 아이콘명 (Lucide React)
  isIconVisible?: boolean    // 아이콘 표시 여부
  description?: string
  isDescriptionVisible?: boolean
  isLineBreak?: boolean
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
  | 'operation_customers'
  | 'operation_engineers'
  | 'operation_accounts'
  // 업무 지원 (1depth)
  | 'support'
  // 원격 작업 (2depth under support)
  | 'remote_jobs'
  | 'remote_mariadb'
  | 'remote_terminal'
  // 인프라 (2depth under support)
  | 'infrastructure'
  | 'infrastructure_resources'
  | 'infrastructure_services'
