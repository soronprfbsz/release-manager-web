/**
 * Site Management Feature Types
 * 사이트 관리 기능 타입 정의
 */

import type { SiteCategory } from '@/entities/sites/site'

export interface SiteFormData {
  siteCode: string
  siteName: string
  siteCategory: SiteCategory
  description: string
  isActive: boolean
  projectId: string
  glyphText: string
  glyphBackgroundColor: string
}

export interface SiteFiltersState {
  keyword: string
  isActive: 'all' | 'true' | 'false'
}

export type SiteFormMode = 'create' | 'edit' | null

/** 사이트 리스트 필터 탭 (표준 / 커스텀) */
export type SiteFilter = 'standard' | 'custom'
