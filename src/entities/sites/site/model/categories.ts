/**
 * 사이트 구분(카테고리) 메타데이터 — 엔티티 정본
 * 좌측 트리 그룹핑 · 폼 세그먼트 · 사이트 선택 콤보박스가 공유하는 단일 출처.
 */

import type { SiteCategory } from './types'

export interface SiteCategoryMeta {
  value: SiteCategory
  /** 그룹 헤더 · 세그먼트 버튼 제목 */
  label: string
  /** 세그먼트 버튼 부제 */
  description: string
}

/** 표시 순서 = 배열 순서 (고객사 먼저) */
export const SITE_CATEGORIES: readonly SiteCategoryMeta[] = [
  { value: 'CUSTOMER', label: '고객사', description: '실제 납품·운영' },
  { value: 'INTERNAL_TEST', label: '내부 테스트', description: 'demo · 사내 운영서버' },
] as const

/** 기본 분류 */
export const DEFAULT_SITE_CATEGORY: SiteCategory = 'CUSTOMER'

export function getSiteCategoryLabel(category: SiteCategory): string {
  return SITE_CATEGORIES.find((c) => c.value === category)?.label ?? category
}
