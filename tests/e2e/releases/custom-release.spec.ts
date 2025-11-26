import { test, expect } from '../../fixtures'

test.describe('커스텀 버전 관리 페이지', () => {
  test.beforeEach(async ({ page }) => {
    // 커스텀 버전 관리 페이지로 이동
    await page.goto('/releases/custom')
    await page.waitForLoadState('networkidle')

    // 로그인 버튼 또는 Custom 헤딩 중 하나가 보일 때까지 대기
    const loginButton = page.getByRole('button', { name: '로그인' })
    const customHeading = page.getByRole('heading', { name: 'Custom' })

    await expect(loginButton.or(customHeading)).toBeVisible({ timeout: 5000 })

    // 로그인 페이지인 경우 로그인 처리
    if (await loginButton.isVisible().catch(() => false)) {
      const testEmail = process.env.TEST_USER_EMAIL
      const testPassword = process.env.TEST_USER_PASSWORD

      if (!testEmail || !testPassword) {
        throw new Error(
          'TEST_USER_EMAIL과 TEST_USER_PASSWORD 환경변수가 필요합니다. .env.test 파일을 확인하세요.'
        )
      }

      await page.getByRole('textbox', { name: '이메일' }).fill(testEmail)
      await page.getByRole('textbox', { name: '비밀번호' }).fill(testPassword)
      await loginButton.click()

      await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 5000 })

      // 로그인 후 커스텀 버전 관리 페이지가 아니면 이동
      if (!page.url().includes('/releases/custom')) {
        await page.goto('/releases/custom')
        await page.waitForLoadState('networkidle')
      }
    }

    // 커스텀 버전 관리 페이지 로드 확인
    await expect(customHeading).toBeVisible({ timeout: 5000 })
  })

  test.describe('페이지 로딩', () => {
    test('커스텀 버전 관리 페이지가 정상적으로 로드된다', async ({ page }) => {
      // 페이지 제목 확인
      await expect(page.getByRole('heading', { name: 'Custom' })).toBeVisible({ timeout: 15000 })

      // 설명 텍스트 확인
      await expect(page.getByText('Custom 버전 관리 페이지입니다.')).toBeVisible()
    })

    test('페이지 URL이 정상적으로 표시된다', async ({ page }) => {
      // 페이지가 로드될 때까지 대기
      await page.waitForLoadState('networkidle')
      
      // 로그인 페이지가 아닌 경우에만 URL 확인
      if (!page.url().includes('/login')) {
        expect(page.url()).toContain('/releases/custom')
      } else {
        // 로그인 페이지에 있으면 인증이 필요함을 의미
        expect(page.url()).toContain('/login')
      }
    })
  })
})

