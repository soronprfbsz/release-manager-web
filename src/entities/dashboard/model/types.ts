/**
 * Dashboard Entity Types
 * 대시보드 도메인 타입 정의
 */

export interface RecentVersion {
  releaseVersionId: number
  version: string
  releaseType: string
  releaseCategory: string
  fileCategories: string[]
  createdAt: string
  createdBy: string
  comment: string
}

export interface RecentPatch {
  patchId: number
  patchName: string
  fromVersion: string
  toVersion: string
  releaseType: string
  createdAt: string
  createdBy: string
  description: string
}

export interface DashboardRecentData {
  latestInstall: RecentVersion | null
  recentVersions: RecentVersion[]
  recentPatches: RecentPatch[]
}

/** 고객사별 패치 통계 아이템 */
export interface CustomerPatchStat {
  customerId: number
  customerCode: string
  customerName: string
  patchCount: number
}

/** 고객사별 패치 통계 응답 */
export interface TopCustomersResponse {
  months: number
  topN: number
  customers: CustomerPatchStat[]
}

/** 월별 패치 통계 아이템 (고객사별 breakdown 포함) */
export interface MonthlyPatchStat {
  yearMonth: string // "2025-06" 형식
  [customerName: string]: string | number // 고객사별 패치 수 (동적 키)
}

/** 월별 패치 통계 응답 */
export interface MonthlyPatchesResponse {
  months: number
  customers: string[] // 고객사 목록
  monthly: MonthlyPatchStat[]
}

/** 통계 요청 파라미터 */
export interface StatisticsParams {
  months?: number
  topN?: number
}
