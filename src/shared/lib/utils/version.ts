/**
 * 버전 관련 유틸리티 함수
 */

import type { MajorMinorNode, VersionNode, CustomerReleaseNode } from '@/entities/releases/release'

/**
 * 버전 문자열을 숫자 배열로 파싱
 * @param version "1.2.3" -> [1, 2, 3]
 */
export function parseVersion(version: string): number[] {
  return version.split('.').map((v) => parseInt(v, 10) || 0)
}

/**
 * 두 버전을 비교
 * @returns 양수: a > b, 음수: a < b, 0: 동일
 */
export function compareVersions(a: string, b: string): number {
  const partsA = parseVersion(a)
  const partsB = parseVersion(b)
  const maxLength = Math.max(partsA.length, partsB.length)

  for (let i = 0; i < maxLength; i++) {
    const numA = partsA[i] || 0
    const numB = partsB[i] || 0
    if (numA !== numB) {
      return numA - numB
    }
  }
  return 0
}

/**
 * 트리 데이터에서 최신 버전 ID를 찾음
 * @param majorMinorGroups 트리 그룹 데이터
 * @returns 가장 높은 버전의 versionId
 */
export function findLatestVersionId(majorMinorGroups: MajorMinorNode[]): number | null {
  if (!majorMinorGroups || majorMinorGroups.length === 0) {
    return null
  }

  let latestVersion: VersionNode | null = null

  for (const group of majorMinorGroups) {
    for (const version of group.versions) {
      if (!latestVersion || compareVersions(version.version, latestVersion.version) > 0) {
        latestVersion = version
      }
    }
  }

  return latestVersion?.versionId ?? null
}

/**
 * 주어진 버전이 최신 버전인지 확인
 */
export function isLatestVersion(versionId: number, majorMinorGroups: MajorMinorNode[]): boolean {
  const latestId = findLatestVersionId(majorMinorGroups)
  return latestId === versionId
}

/**
 * 트리 데이터에서 최신 버전 문자열을 찾음
 */
export function findLatestVersionString(majorMinorGroups: MajorMinorNode[]): string | null {
  if (!majorMinorGroups || majorMinorGroups.length === 0) {
    return null
  }

  let latestVersion: string | null = null

  for (const group of majorMinorGroups) {
    for (const version of group.versions) {
      if (!latestVersion || compareVersions(version.version, latestVersion) > 0) {
        latestVersion = version.version
      }
    }
  }

  return latestVersion
}

/**
 * 다음 패치 버전을 계산 (x.x.N+1)
 * @param version "1.2.3" -> "1.2.4", "10.11.123" -> "10.11.124"
 */
export function getNextPatchVersion(version: string): string {
  const parts = parseVersion(version)
  if (parts.length < 3) {
    // 버전이 3부분 미만이면 .1 추가
    while (parts.length < 3) {
      parts.push(0)
    }
  }
  // 마지막 부분(패치 버전) 증가
  parts[parts.length - 1] += 1
  return parts.join('.')
}

/**
 * 트리 데이터에서 다음 버전을 제안
 * @returns 다음 패치 버전 문자열 또는 기본값
 */
export function suggestNextVersion(majorMinorGroups: MajorMinorNode[]): string {
  const latestVersion = findLatestVersionString(majorMinorGroups)
  
  if (!latestVersion) {
    return '1.0.0'
  }
  
  return getNextPatchVersion(latestVersion)
}

/**
 * 고객사별 최신 버전 ID 맵을 생성
 * @param customers 고객사 릴리즈 노드 배열
 * @returns { customerCode: latestVersionId } 맵
 */
export function findLatestVersionIdByCustomer(customers: CustomerReleaseNode[]): Map<string, number> {
  const latestVersionMap = new Map<string, number>()

  for (const customer of customers) {
    const latestId = findLatestVersionId(customer.majorMinorGroups)
    if (latestId !== null) {
      latestVersionMap.set(customer.customerCode, latestId)
    }
  }

  return latestVersionMap
}

/**
 * 고객사별 최신 버전 문자열 맵을 생성
 * @param customers 고객사 릴리즈 노드 배열
 * @returns { customerCode: latestVersionString } 맵
 */
export function findLatestVersionStringByCustomer(customers: CustomerReleaseNode[]): Map<string, string> {
  const latestVersionMap = new Map<string, string>()

  for (const customer of customers) {
    const latestVersion = findLatestVersionString(customer.majorMinorGroups)
    if (latestVersion !== null) {
      latestVersionMap.set(customer.customerCode, latestVersion)
    }
  }

  return latestVersionMap
}

/**
 * 주어진 버전이 해당 고객사의 최신 버전인지 확인
 */
export function isLatestVersionForCustomer(
  versionId: number,
  customerCode: string,
  customers: CustomerReleaseNode[]
): boolean {
  const customer = customers.find(c => c.customerCode === customerCode)
  if (!customer) return false
  
  const latestId = findLatestVersionId(customer.majorMinorGroups)
  return latestId === versionId
}

