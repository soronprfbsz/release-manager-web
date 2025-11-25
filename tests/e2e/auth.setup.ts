import { test as setup, expect } from '@playwright/test'

const authFile = 'tests/.auth/user.json'

/**
 * Authentication Setup
 * 로그인 상태를 저장하여 다른 테스트에서 재사용합니다.
 */
setup('authenticate', async ({ page }) => {
  // 로그인 페이지로 이동
  await page.goto('/login')

  // 로그인 폼이 로드될 때까지 대기
  await expect(page.getByText('Release Manager')).toBeVisible()

  // 테스트 계정으로 로그인 (환경변수 필수)
  const testEmail = process.env.TEST_USER_EMAIL
  const testPassword = process.env.TEST_USER_PASSWORD

  if (!testEmail || !testPassword) {
    throw new Error(
      'TEST_USER_EMAIL과 TEST_USER_PASSWORD 환경변수가 필요합니다. .env.test 파일을 확인하세요.'
    )
  }

  // id 선택자 사용 (더 안정적)
  await page.locator('#email').fill(testEmail)
  await page.locator('#password').fill(testPassword)
  await page.getByRole('button', { name: '로그인' }).click()

  // 로그인 성공 후 로그인 페이지가 아닌 곳으로 이동 확인
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 })

  // 인증 상태 저장
  await page.context().storageState({ path: authFile })
})
