/**
 * Patch Management Feature Types
 * 패치 관리 기능 타입 정의
 */

import type { BuildSelection } from '@/entities/patches/patch'

/** 버전 선택 옵션 (version 문자열 + versionId) */
export interface VersionOption {
  version: string
  versionId: number
  /** 승인 여부 — 미승인은 권한에 따라 숨기거나 '(미승인)' 라벨로 표시 */
  isApproved: boolean
}

export interface PatchCreateFormData {
  fromVersion: string
  toVersion: string
  /** 시작 버전 ID (builds-in-range 조회용) */
  fromVersionId: number | null
  /** 종료 버전 ID (builds-in-range 조회용) */
  toVersionId: number | null
  /** 프로젝트 ID (builds-in-range 조회용) */
  projectId: string
  siteCode: string
  /** 사이트 ID (커스텀 패치 시 builds-in-range siteId 전달용) */
  siteId: number | null
  assigneeId: number | null
  description: string
  buildSelection: BuildSelection | null
  patchName: string
}

export interface CustomPatchCreateFormData {
  siteId: number | null
  /** 시작 버전 (베이스 또는 커스텀, 빌드 인식) */
  fromVersion: string
  /** 종료 커스텀 버전 (빌드 인식) */
  toVersion: string
  /** 시작 버전 ID (builds-in-range 조회용) */
  fromVersionId: number | null
  /** 종료 버전 ID (builds-in-range 조회용) */
  toVersionId: number | null
  /** 프로젝트 ID (builds-in-range 조회용) */
  projectId: string
  assigneeId: number | null
  description: string
  patchName: string
  /** 빌드 파일 선택 (default ON, picker) — 표준 흐름과 동일 */
  buildSelection: BuildSelection | null
}

export interface PatchFiltersState {
  keyword?: string
  releaseType?: 'STANDARD' | 'CUSTOM'
}

export type PatchFormMode = 'create' | null

export interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}
