import { test as base, expect } from '@playwright/test'

/**
 * Custom Test Fixtures
 * 테스트에서 공통으로 사용하는 fixtures를 정의합니다.
 */

// 테스트 데이터 타입
export interface TestCustomer {
  customerCode: string
  customerName: string
  description?: string
  isActive?: boolean
}

// 테스트용 고객사 데이터 생성
export function generateTestCustomer(suffix?: string): TestCustomer {
  const timestamp = Date.now()
  const uniqueSuffix = suffix || timestamp.toString().slice(-6)

  return {
    customerCode: `TEST_${uniqueSuffix}`,
    customerName: `테스트 고객사 ${uniqueSuffix}`,
    description: `E2E 테스트용 고객사 (${new Date().toISOString()})`,
    isActive: true,
  }
}

// Extended test with custom fixtures
export const test = base.extend<{
  testCustomer: TestCustomer
}>({
  testCustomer: async ({}, use) => {
    const customer = generateTestCustomer()
    await use(customer)
  },
})

export { expect }
