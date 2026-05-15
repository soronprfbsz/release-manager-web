/**
 * Dashboard Entity Types
 * 대시보드 도메인 타입 정의
 */

// ============================================================================
// 표준본 최신 릴리즈 (Standard)
// ============================================================================

/** 표준본 릴리즈 버전 아이템 */
export interface RecentStandardVersion {
  releaseVersionId: number
  version: string
  releaseType: string
  createdAt: string
  comment: string | null
  fileCategories: string[]
  createdByName: string
  createdByEmail: string
  createdByAvatarStyle: string | null
  createdByAvatarSeed: string | null
}

/** 표준본 최신 릴리즈 응답 */
export interface RecentStandardResponse {
  versions: RecentStandardVersion[]
}

// ============================================================================
// 최신 빌드 버전 (Build) — 표준 + 커스텀 통합
// ============================================================================

/**
 * 최신 빌드 버전 아이템
 *
 * `version` 은 빌드 라벨까지 포함된 full 버전 (예: "1.1.0.260501-1").
 * customer* 필드는 CUSTOM 빌드인 경우에만 채워진다.
 */
export interface RecentBuildVersion {
  releaseVersionId: number
  version: string
  releaseType: string
  createdAt: string
  comment: string | null
  fileCategories: string[]
  customerId: number | null
  customerCode: string | null
  customerName: string | null
  createdByName: string
  createdByEmail: string
  createdByAvatarStyle: string | null
  createdByAvatarSeed: string | null
}

/** 최신 빌드 버전 응답 */
export interface RecentBuildResponse {
  versions: RecentBuildVersion[]
}

// ============================================================================
// 최근 생성 패치 (Patch)
// ============================================================================

/** 최근 생성 패치 아이템 (패치 완료된 항목만) */
export interface RecentPatch {
  historyId: number
  patchName: string
  fromVersion: string
  toVersion: string
  releaseType: string
  createdAt: string
  description: string | null
  customerId: number | null
  customerCode: string | null
  customerName: string | null
  assigneeName: string | null
  assigneeEmail: string | null
  assigneeAvatarStyle: string | null
  assigneeAvatarSeed: string | null
  createdByName: string
  createdByEmail: string
  createdByAvatarStyle: string | null
  createdByAvatarSeed: string | null
}

/** 최근 생성 패치 응답 */
export interface RecentPatchResponse {
  patches: RecentPatch[]
}

// ============================================================================
// Legacy 타입 (하위 호환성)
// ============================================================================

/** @deprecated Use RecentStandardVersion instead */
export interface RecentVersion {
  releaseVersionId: number
  version: string
  releaseType: string
  fileCategories: string[]
  createdAt: string
  createdBy: string
  comment: string
}

/** @deprecated Use separate APIs instead */
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
  customerCounts: Record<string, number> // 고객사별 패치 수
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

// ============================================================================
// 버전별 고객사 분포
// ============================================================================

/** 고객사 간단 정보 (버전별 그룹 안에 들어가는 segment) */
export interface CustomerInfo {
  customerId: number
  customerCode: string
  customerName: string
}

/** 버전별 고객사 그룹 */
export interface VersionCustomerGroup {
  version: string
  count: number
  customers: CustomerInfo[]
}

/** 버전별 고객사 분포 응답 */
export interface VersionCustomerDistributionResponse {
  versions: VersionCustomerGroup[]
}

/** 최근 데이터 요청 파라미터 */
export interface RecentDataParams {
  versionLimit?: number
  patchLimit?: number
}
