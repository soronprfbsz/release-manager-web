/**
 * Customer Site Version Entity Types
 * 고객사 사이트 컴포넌트별 현재 버전 타입 정의
 */

/** 사이트 버전 컴포넌트 구분 */
export type SiteComponent = 'BASE' | 'WEB' | 'ENGINE'

/** 고객사 사이트 버전 응답 DTO */
export interface SiteVersionResponse {
  /** 컴포넌트 구분 (BASE: 기본 버전, WEB: 웹 빌드, ENGINE: 엔진 빌드) */
  component: SiteComponent
  /** 엔진명 (component=ENGINE 일 때만; BASE/WEB 은 null) */
  engineName: string | null
  /** 현재 적용된 버전 문자열 (BASE: "1.1.0", WEB/ENGINE: "1.1.0.260511-1") */
  currentVersion: string
  /** 마지막 갱신 일시 (ISO datetime) */
  updatedAt: string
  /** 마지막 갱신 처리자 계정 식별자 */
  updatedBy: string | null
}

/**
 * 다음 패치 범위 추천 응답 DTO
 * GET /api/customers/{customerId}/projects/{projectId}/next-patch-range
 */
export interface NextPatchRangeResponse {
  /** 사이트에 마지막으로 적용된 base 버전 (패치 이력 없으면 null) */
  currentVersion: string | null
  /** 추천 시작 버전 — currentVersion 직후 버전 (사이트가 이미 최신이면 null) */
  suggestedFromVersion: string | null
  /** 추천 시작 버전 ID */
  suggestedFromVersionId: number | null
  /** 추천 종료 버전 — 가장 최신 base 버전 (표준 버전 없으면 null) */
  suggestedToVersion: string | null
  /** 추천 종료 버전 ID */
  suggestedToVersionId: number | null
}
