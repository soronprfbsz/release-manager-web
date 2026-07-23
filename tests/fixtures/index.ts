import { test as base, expect } from '@playwright/test'

/**
 * Custom Test Fixtures
 * 테스트에서 공통으로 사용하는 fixtures를 정의합니다.
 */

// 테스트 데이터 타입 - 사이트
export interface TestSite {
  siteCode: string
  siteName: string
  description?: string
  isActive?: boolean
}

// 테스트 데이터 타입 - 릴리즈 버전
export interface TestReleaseVersion {
  version: string
  majorMinor: string
  isInstall: boolean
}

// 테스트용 사이트 데이터 생성
export function generateTestSite(suffix?: string): TestSite {
  const timestamp = Date.now()
  const uniqueSuffix = suffix || timestamp.toString().slice(-6)

  return {
    siteCode: `TEST_${uniqueSuffix}`,
    siteName: `테스트 사이트 ${uniqueSuffix}`,
    description: `E2E 테스트용 사이트 (${new Date().toISOString()})`,
    isActive: true,
  }
}

// 테스트용 버전 데이터 생성
export function generateTestVersion(majorMinor?: string): TestReleaseVersion {
  const mm = majorMinor || '1.0'
  const patchVersion = Math.floor(Math.random() * 100)

  return {
    version: `${mm}.${patchVersion}`,
    majorMinor: mm,
    isInstall: false,
  }
}

// Extended test with custom fixtures
// Playwright의 `use`는 React Hook이 아님 - ESLint 오탐 방지
/* eslint-disable react-hooks/rules-of-hooks, no-empty-pattern */
export const test = base.extend<{
  testSite: TestSite
}>({
  testSite: async ({}, use) => {
    const site = generateTestSite()
    await use(site)
  },
})
/* eslint-enable react-hooks/rules-of-hooks, no-empty-pattern */

export { expect }
