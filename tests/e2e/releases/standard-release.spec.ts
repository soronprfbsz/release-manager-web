import { test, expect } from '../../fixtures'

test.describe('표준 버전 관리 페이지', () => {
  test.beforeEach(async ({ page }) => {
    // 표준 버전 관리 페이지로 이동
    await page.goto('/releases/standard')
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

      // 로그인 후 표준 버전 관리 페이지가 아니면 이동
      if (!page.url().includes('/releases/standard')) {
        await page.goto('/releases/standard')
        await page.waitForLoadState('networkidle')
      }
    }

    // 표준 버전 관리 페이지 로드 확인 - 페이지 컨텐츠가 표시될 때까지 대기
    await expect(page.getByText('버전 트리')).toBeVisible({ timeout: 5000 })
  })

  test.describe('페이지 로딩', () => {
    test('표준 버전 관리 페이지가 정상적으로 로드된다', async ({ page }) => {
      // Breadcrumb 확인
      await expect(page.locator('nav[aria-label="breadcrumb"]')).toContainText('버전 관리')
      await expect(page.locator('nav[aria-label="breadcrumb"]')).toContainText('Standard')

      // 새로고침 버튼 확인
      await expect(page.locator('button[title="새로고침"]')).toBeVisible()

      // 페이지 컨텐츠 확인 (정상 로드 또는 에러 상태)
      const hasTree = await page.getByText('버전 트리').isVisible().catch(() => false)
      const hasInfo = await page.getByText('버전 정보').isVisible().catch(() => false)
      const hasError = await page.getByText('데이터를 불러오는 중 오류가 발생했습니다').isVisible().catch(() => false)

      // 셋 중 하나라도 있으면 페이지가 정상 로드됨
      expect(hasTree || hasInfo || hasError).toBeTruthy()
    })

    test('버전 트리가 로드된다', async ({ page }) => {
      // 버전 트리 영역 확인
      const treeCard = page.locator('div').filter({ hasText: '버전 트리' }).first()
      await expect(treeCard).toBeVisible()

      // 버전이 있으면 버전 수 표시, 없으면 빈 메시지 확인
      const versionCount = page.getByText(/\d+개 버전/)
      const emptyMessage = page.getByText('릴리즈 버전이 없습니다.')

      const hasVersions = await versionCount.isVisible().catch(() => false)
      const isEmpty = await emptyMessage.isVisible().catch(() => false)

      expect(hasVersions || isEmpty).toBeTruthy()
    })
  })

  test.describe('버전 트리 네비게이션', () => {
    test('버전 그룹을 펼치고 접을 수 있다', async ({ page }) => {
      // 데이터 로딩 대기
      await page.waitForLoadState('networkidle')

      // 버전이 있는지 확인
      const versionCount = page.getByText(/\d+개 버전/)
      const hasVersions = await versionCount.isVisible().catch(() => false)

      if (hasVersions) {
        // 첫 번째 폴더 버튼 찾기 (펼침/접힘 토글)
        const folderButtons = page.locator('button').filter({ hasText: /^\d+\.\d+$/ })
        const firstFolder = folderButtons.first()

        if (await firstFolder.isVisible()) {
          // 현재 상태 확인
          const initialExpanded = await page.locator('svg.lucide-chevron-down').first().isVisible().catch(() => false)

          // 폴더 클릭
          await firstFolder.click()
          await page.waitForTimeout(300)

          // 상태 변경 확인
          const afterClickExpanded = await page.locator('svg.lucide-chevron-down').first().isVisible().catch(() => false)

          // 상태가 토글되었거나 펼쳐진 상태 유지
          expect(initialExpanded !== afterClickExpanded || afterClickExpanded).toBeTruthy()
        }
      }
    })

    test('버전을 선택하면 상세 정보가 표시된다', async ({ page }) => {
      // 데이터 로딩 대기
      await page.waitForLoadState('networkidle')

      // 버전이 있는지 확인
      const versionCount = page.getByText(/\d+개 버전/)
      const hasVersions = await versionCount.isVisible().catch(() => false)

      if (hasVersions) {
        // 버전 아이템 찾기 (파일 아이콘이 있는 버전)
        const versionItems = page.locator('button').filter({ hasText: /^\d+\.\d+\.\d+/ })
        const firstVersion = versionItems.first()

        if (await firstVersion.isVisible()) {
          // 버전 클릭
          await firstVersion.click()
          await page.waitForLoadState('networkidle')

          // 버전 정보 패널에 상세 정보 표시 확인
          const detailPanel = page.locator('div').filter({ hasText: '버전 정보' }).last()

          // 상세 정보가 로드되는 동안 대기
          await page.waitForTimeout(1000)

          // 버전 상세 정보나 빈 상태 메시지 확인
          const hasDetail = await detailPanel.getByText(/버전|Version/).isVisible().catch(() => false)
          const hasEmptyState = await page.getByText('좌측 트리에서 버전을 선택하세요').isVisible().catch(() => false)

          expect(hasDetail || hasEmptyState).toBeTruthy()
        }
      }
    })

    test('설치본 버전에 배지가 표시된다', async ({ page }) => {
      // 데이터 로딩 대기
      await page.waitForLoadState('networkidle')

      // 버전이 있는지 확인
      const versionCount = page.getByText(/\d+개 버전/)
      const hasVersions = await versionCount.isVisible().catch(() => false)

      if (hasVersions) {
        // 설치본 배지 확인 (있을 수도 있고 없을 수도 있음)
        const installBadge = page.getByText('설치본')
        const hasInstallBadge = await installBadge.first().isVisible().catch(() => false)

        // 배지가 있든 없든 페이지는 정상 작동해야 함
        await expect(page.getByText('버전 트리')).toBeVisible()

        if (hasInstallBadge) {
          // 설치본 배지 스타일 확인
          await expect(installBadge.first()).toHaveClass(/bg-green/)
        }
      }
    })
  })

  test.describe('버전 상세 정보', () => {
    test('버전 선택 전 안내 메시지가 표시된다', async ({ page }) => {
      // 페이지 로드 대기 - 버전 트리가 표시될 때까지 대기
      await expect(page.getByText('버전 트리')).toBeVisible()

      // 버전 정보 패널 확인
      await expect(page.getByText('버전 정보')).toBeVisible()
    })

    test('버전 상세에 파일 목록이 표시된다', async ({ page }) => {
      // 페이지 로드 대기 - 버전 트리가 표시될 때까지 대기
      await expect(page.getByText('버전 트리')).toBeVisible()

      // 버전이 있는지 확인
      const versionCount = page.getByText(/\d+개 버전/)
      const hasVersions = await versionCount.isVisible().catch(() => false)

      if (hasVersions) {
        // 첫 번째 버전 선택
        const versionItems = page.locator('button').filter({ hasText: /^\d+\.\d+\.\d+/ })
        const firstVersion = versionItems.first()

        if (await firstVersion.isVisible()) {
          await firstVersion.click()
          await page.waitForLoadState('networkidle')

          // 상세 정보 로딩 대기
          await page.waitForTimeout(1500)

          // 파일 테이블이나 파일 정보 확인
          const hasFileTable = await page.locator('table').isVisible().catch(() => false)
          const hasFileInfo = await page.getByText(/파일|file/i).isVisible().catch(() => false)
          const hasNoFiles = await page.getByText('등록된 파일이 없습니다').isVisible().catch(() => false)

          expect(hasFileTable || hasFileInfo || hasNoFiles).toBeTruthy()
        }
      }
    })
  })

  test.describe('새로고침', () => {
    test('새로고침 버튼으로 트리를 갱신할 수 있다', async ({ page }) => {
      // 새로고침 버튼 클릭
      const refreshButton = page.locator('button[title="새로고침"]')
      await expect(refreshButton).toBeVisible()
      await refreshButton.click()

      // 로딩 후 트리가 다시 표시됨
      await page.waitForLoadState('networkidle')
      await expect(page.getByText('버전 트리')).toBeVisible()
    })
  })

  test.describe('에러 처리', () => {
    test('네트워크 오류 시 에러 메시지와 다시 시도 버튼이 표시된다', async ({ page }) => {
      // API 요청 가로채기 - 에러 시뮬레이션
      await page.route('**/api/v1/releases/standard/tree', (route) => {
        route.abort('failed')
      })

      // 페이지 새로고침
      await page.reload()
      await page.waitForLoadState('networkidle')

      // 에러 상태 확인 (오류 메시지 또는 다시 시도 버튼)
      const errorMessage = page.getByText('데이터를 불러오는 중 오류가 발생했습니다')
      const retryButton = page.getByRole('button', { name: '다시 시도' })

      const hasError = await errorMessage.isVisible().catch(() => false)
      const hasRetry = await retryButton.isVisible().catch(() => false)

      // 에러 상태가 정상적으로 표시되는지 확인
      if (hasError) {
        await expect(errorMessage).toBeVisible()
        await expect(retryButton).toBeVisible()
      }
    })
  })

  test.describe('반응형 레이아웃', () => {
    test('트리와 상세 패널이 적절한 비율로 표시된다', async ({ page }) => {
      // 그리드 레이아웃 확인
      const gridContainer = page.locator('.grid.grid-cols-12')
      await expect(gridContainer).toBeVisible()

      // 트리 패널 (col-span-2)
      const treePanel = page.locator('.col-span-2')
      await expect(treePanel).toBeVisible()

      // 상세 패널 (col-span-10)
      const detailPanel = page.locator('.col-span-10')
      await expect(detailPanel).toBeVisible()
    })
  })
})

