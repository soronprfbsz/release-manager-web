import { test, expect } from '../../fixtures'

test.describe('스크립트 다운로드 페이지', () => {
  test.beforeEach(async ({ page }) => {
    // 스크립트 다운로드 페이지로 이동
    await page.goto('/downloads/scripts')
    await page.waitForLoadState('networkidle')

    // 로그인 버튼 또는 새로고침 버튼 중 하나가 보일 때까지 대기
    const loginButton = page.getByRole('button', { name: '로그인' })
    const refreshButton = page.locator('button[title="새로고침"]')

    await expect(loginButton.or(refreshButton)).toBeVisible({ timeout: 5000 })

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

      // 로그인 후 스크립트 다운로드 페이지가 아니면 이동
      if (!page.url().includes('/downloads/scripts')) {
        await page.goto('/downloads/scripts')
        await page.waitForLoadState('networkidle')
      }
    }

    // 스크립트 다운로드 페이지 로드 확인 - 페이지 컨텐츠가 표시될 때까지 대기
    await expect(page.getByText('다운로드')).toBeVisible({ timeout: 5000 })
  })

  test.describe('페이지 로딩', () => {
    test('스크립트 다운로드 페이지가 정상적으로 로드된다', async ({ page }) => {
      // 페이지 타이틀 확인
      await expect(page.getByText('다운로드')).toBeVisible()

      // 설명 텍스트 확인
      await expect(
        page.getByText('데이터베이스 백업 및 복원에 필요한 스크립트를 다운로드할 수 있습니다.')
      ).toBeVisible()

      // Breadcrumb 확인
      await expect(page.locator('nav[aria-label="breadcrumb"]')).toContainText('다운로드')
      await expect(page.locator('nav[aria-label="breadcrumb"]')).toContainText('스크립트')

      // 새로고침 버튼 확인
      await expect(page.locator('button[title="새로고침"]')).toBeVisible()
    })

    test('스크립트 목록이 표시된다', async ({ page }) => {
      // 스크립트 카드들이 표시되는지 확인
      await expect(page.getByText('MariaDB 백업 스크립트')).toBeVisible()
      await expect(page.getByText('MariaDB 복원 스크립트')).toBeVisible()
      await expect(page.getByText('CrateDB 백업 스크립트')).toBeVisible()
      await expect(page.getByText('CrateDB 복원 스크립트')).toBeVisible()
    })

    test('스크립트 카드에 파일명이 표시된다', async ({ page }) => {
      // 데이터 로드 대기 - 첫 번째 스크립트 카드가 표시될 때까지 대기
      await expect(page.getByText('MariaDB 백업 스크립트')).toBeVisible()

      // 파일명 확인
      await expect(page.getByText('mariadb_backup.sh')).toBeVisible()
      await expect(page.getByText('mariadb_restore.sh')).toBeVisible()
      await expect(page.getByText('cratedb_backup.sh')).toBeVisible()
      await expect(page.getByText('cratedb_restore.sh')).toBeVisible()
    })

    test('스크립트 카드에 파일 확장자 뱃지가 표시된다', async ({ page }) => {
      // 데이터 로드 대기
      await expect(page.getByText('MariaDB 백업 스크립트')).toBeVisible()

      // .sh 확장자 뱃지가 표시되는지 확인
      const shBadges = page.getByText('.sh')
      await expect(shBadges.first()).toBeVisible()
    })

    test('각 스크립트 카드에 다운로드 버튼이 있다', async ({ page }) => {
      // 데이터 로드 대기
      await expect(page.getByText('MariaDB 백업 스크립트')).toBeVisible()

      // 다운로드 버튼 개수 확인 (최소 4개)
      const downloadButtons = page.locator('main button', { hasText: '다운로드' })
      await expect(downloadButtons.first()).toBeVisible()
      const count = await downloadButtons.count()
      expect(count).toBeGreaterThanOrEqual(4)
    })
  })

  test.describe('UI 요소', () => {
    test('백업 스크립트 카드가 표시된다', async ({ page }) => {
      // 백업 스크립트 카드 확인
      await expect(page.getByText('MariaDB 백업 스크립트')).toBeVisible()
      await expect(page.getByText('CrateDB 백업 스크립트')).toBeVisible()
    })

    test('복원 스크립트 카드가 표시된다', async ({ page }) => {
      // 복원 스크립트 카드 확인
      await expect(page.getByText('MariaDB 복원 스크립트')).toBeVisible()
      await expect(page.getByText('CrateDB 복원 스크립트')).toBeVisible()
    })
  })

  test.describe('다운로드 기능', () => {
    test('MariaDB 백업 스크립트 다운로드 버튼이 클릭 가능하다', async ({ page }) => {
      const button = page.locator('main button', { hasText: '다운로드' }).first()
      await expect(button).toBeVisible()
      await expect(button).toBeEnabled()

      // 버튼 클릭
      await button.click()

      // 페이지 상태 유지 확인
      await page.waitForTimeout(1000)
      await expect(page.getByText('다운로드')).toBeVisible()
    })

    test('MariaDB 복원 스크립트 다운로드 버튼이 클릭 가능하다', async ({ page }) => {
      const button = page.locator('main button', { hasText: '다운로드' }).nth(1)
      await expect(button).toBeVisible()
      await expect(button).toBeEnabled()

      // 버튼 클릭
      await button.click()

      // 페이지 상태 유지 확인
      await page.waitForTimeout(1000)
      await expect(page.getByText('다운로드')).toBeVisible()
    })

    test('CrateDB 백업 스크립트 다운로드 버튼이 클릭 가능하다', async ({ page }) => {
      const button = page.locator('main button', { hasText: '다운로드' }).nth(2)
      await expect(button).toBeVisible()
      await expect(button).toBeEnabled()

      // 버튼 클릭
      await button.click()

      // 페이지 상태 유지 확인
      await page.waitForTimeout(1000)
      await expect(page.getByText('다운로드')).toBeVisible()
    })

    test('CrateDB 복원 스크립트 다운로드 버튼이 클릭 가능하다', async ({ page }) => {
      const button = page.locator('main button', { hasText: '다운로드' }).nth(3)
      await expect(button).toBeVisible()
      await expect(button).toBeEnabled()

      // 버튼 클릭
      await button.click()

      // 페이지 상태 유지 확인
      await page.waitForTimeout(1000)
      await expect(page.getByText('다운로드')).toBeVisible()
    })

  })

  test.describe('새로고침 기능', () => {
    test('새로고침 버튼을 클릭하면 목록이 다시 로드된다', async ({ page }) => {
      // 새로고침 버튼 클릭
      await page.locator('button[title="새로고침"]').click()

      // 목록이 다시 표시되는지 확인
      await expect(page.getByText('MariaDB 백업 스크립트')).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('네비게이션', () => {
    test('홈 버튼을 클릭하면 홈으로 이동한다', async ({ page }) => {
      // Breadcrumb의 홈 링크 클릭
      await page.locator('nav[aria-label="breadcrumb"] a').first().click()

      // 홈 페이지로 이동 확인
      await expect(page).toHaveURL('/')
    })

    test('상단 메뉴에서 다운로드 > 스크립트로 접근할 수 있다', async ({ page }) => {
      // 헤더의 다운로드 메뉴 클릭 (banner 내의 버튼)
      await page.getByRole('banner').getByRole('button', { name: '다운로드' }).click()

      // 스크립트 서브메뉴 클릭
      await page.getByRole('link', { name: '스크립트', exact: true }).click()

      // 스크립트 다운로드 페이지로 이동 확인
      await expect(page).toHaveURL('/downloads/scripts')
      await expect(page.getByText('다운로드')).toBeVisible()
    })
  })

  test.describe('반응형 레이아웃', () => {
    test('모바일 뷰에서 카드가 표시된다', async ({ page }) => {
      // 데이터 로드 대기 후 뷰포트 변경
      await expect(page.getByText('MariaDB 백업 스크립트')).toBeVisible()

      // 모바일 뷰포트 설정
      await page.setViewportSize({ width: 375, height: 667 })

      // 레이아웃 변경 후 카드 확인
      await expect(page.locator('main button', { hasText: '다운로드' }).first()).toBeVisible()
    })

    test('태블릿 뷰에서 카드가 표시된다', async ({ page }) => {
      // 데이터 로드 대기 후 뷰포트 변경
      await expect(page.getByText('MariaDB 백업 스크립트')).toBeVisible()

      // 태블릿 뷰포트 설정
      await page.setViewportSize({ width: 768, height: 1024 })

      // 레이아웃 변경 후 카드 확인
      await expect(page.locator('main button', { hasText: '다운로드' }).first()).toBeVisible()
    })

    test('데스크톱 뷰에서 카드가 표시된다', async ({ page }) => {
      // 데이터 로드 대기 후 뷰포트 변경
      await expect(page.getByText('MariaDB 백업 스크립트')).toBeVisible()

      // 데스크톱 뷰포트 설정
      await page.setViewportSize({ width: 1920, height: 1080 })

      // 레이아웃 변경 후 카드 확인
      await expect(page.locator('main button', { hasText: '다운로드' }).first()).toBeVisible()
    })
  })
})

test.describe('인증되지 않은 사용자', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('로그인하지 않은 사용자는 로그인 페이지로 리다이렉트된다', async ({ page }) => {
    // 스크립트 다운로드 페이지로 직접 이동 시도
    await page.goto('/downloads/scripts')
    await page.waitForLoadState('networkidle')

    // 잠시 대기 (리다이렉트 처리 시간)
    await page.waitForTimeout(1000)

    // 로그인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL(/\/login/)
  })
})
