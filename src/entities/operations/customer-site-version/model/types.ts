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
  /** 현재 적용된 버전 문자열 (BASE: "1.1.0", WEB/ENGINE: "1.1.0.260511-1") */
  currentVersion: string
  /** 마지막 갱신 일시 (ISO datetime) */
  updatedAt: string
  /** 마지막 갱신 처리자 계정 식별자 */
  updatedBy: string | null
}
