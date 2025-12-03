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
