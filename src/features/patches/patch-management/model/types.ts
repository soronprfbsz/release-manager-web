/**
 * Patch Management Feature Types
 * 패치 관리 기능 타입 정의
 */

import type { BuildSelection } from '@/entities/patches/patch/model/types'

export interface PatchCreateFormData {
  fromVersion: string
  toVersion: string
  /** 시작 버전 ID (builds-in-range 조회용) */
  fromVersionId: number | null
  /** 종료 버전 ID (builds-in-range 조회용) */
  toVersionId: number | null
  /** 프로젝트 ID (builds-in-range 조회용) */
  projectId: string
  customerCode: string
  /** 고객사 ID (커스텀 패치 시 builds-in-range customerId 전달용) */
  customerId: number | null
  assigneeId: number | null
  description: string
  buildSelection: BuildSelection | null
  patchName: string
}

export interface CustomPatchCreateFormData {
  customerId: number | null
  fromVersion: string
  toVersion: string
  assigneeId: number | null
  description: string
  patchName: string
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
