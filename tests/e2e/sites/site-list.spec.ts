import { test, expect, generateTestSite } from '../../fixtures'

test.describe('사이트 관리 페이지', () => {
  test.beforeEach(async ({ page }) => {
    // 사이트 관리 페이지로 이동
    await page.goto('/sites')
    await page.waitForLoadState('networkidle')

    // 로그인 버튼 또는 사이트 생성 버튼 중 하나가 보일 때까지 대기
    const loginButton = page.getByRole('button', { name: '로그인' })
    const siteButton = page.getByRole('button', { name: '사이트 생성' })

    await expect(loginButton.or(siteButton)).toBeVisible({ timeout: 5000 })

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

      // 로그인 후 사이트 페이지가 아니면 이동
      if (!page.url().includes('/sites')) {
        await page.goto('/sites')
        await page.waitForLoadState('networkidle')
      }
    }

    // 사이트 페이지 로드 확인 - 페이지 컨텐츠가 표시될 때까지 대기
    await expect(page.getByText('사이트 목록')).toBeVisible({ timeout: 5000 })
  })

  test.describe('페이지 로딩', () => {
    test('사이트 목록 페이지가 정상적으로 로드된다', async ({ page }) => {
      // Breadcrumb 확인 (breadcrumb 내의 텍스트)
      await expect(page.locator('nav[aria-label="breadcrumb"]')).toContainText('사이트 관리')

      // 새로고침 버튼 확인 (아이콘 버튼, title 속성으로 식별)
      await expect(page.locator('button[title="새로고침"]')).toBeVisible()

      // 사이트 생성 버튼 확인
      await expect(page.getByRole('button', { name: '사이트 생성' })).toBeVisible()

      // 검색 입력 확인
      await expect(page.getByPlaceholder('검색...')).toBeVisible()

      // 상태 필터 확인 (Select trigger)
      await expect(page.locator('button[role="combobox"]')).toBeVisible()
    })

    test('사이트 목록 테이블이 표시된다', async ({ page }) => {
      // 테이블이 있는지 확인
      const table = page.locator('table')

      // 테이블이 있으면 헤더 확인 (thead 내에서 텍스트 확인)
      if (await table.isVisible()) {
        const thead = table.locator('thead')
        await expect(thead).toContainText('ID')
        await expect(thead).toContainText('사이트 코드')
        await expect(thead).toContainText('사이트명')
        await expect(thead).toContainText('상태')
        await expect(thead).toContainText('등록일')
      } else {
        // 데이터가 없는 경우 빈 상태 메시지 확인
        await expect(page.getByText('등록된 사이트가 없습니다.')).toBeVisible()
      }
    })
  })

  test.describe('사이트 검색 및 필터', () => {
    test('사이트명으로 검색할 수 있다', async ({ page }) => {
      const searchInput = page.getByPlaceholder('검색...')

      // 검색어 입력
      await searchInput.fill('테스트')

      // 검색 결과 로딩 대기 (debounce 고려)
      await page.waitForTimeout(500)

      // 페이지가 정상적으로 유지되는지 확인
      await expect(page.getByText('사이트 목록')).toBeVisible()
    })

    test('상태 필터로 필터링할 수 있다', async ({ page }) => {
      // 페이지 로드 대기
      await expect(page.getByText('사이트 목록')).toBeVisible()

      // Select trigger 클릭
      const statusFilter = page.locator('button[role="combobox"]')
      await expect(statusFilter).toBeVisible()
      await statusFilter.click()

      // SelectContent 내의 옵션만 선택 (exact: true로 정확히 매치)
      const selectContent = page.locator('[role="listbox"]')
      await expect(selectContent).toBeVisible()
      await selectContent.getByRole('option', { name: '활성', exact: true }).click()

      // 드롭다운 닫힘 대기 후 다시 열기
      await expect(selectContent).not.toBeVisible()
      await statusFilter.click()
      await expect(selectContent).toBeVisible()
      await selectContent.getByRole('option', { name: '비활성', exact: true }).click()

      // 전체 보기로 복원
      await expect(selectContent).not.toBeVisible()
      await statusFilter.click()
      await expect(selectContent).toBeVisible()
      await selectContent.getByRole('option', { name: '전체', exact: true }).click()

      // 페이지가 정상적으로 유지되는지 확인
      await expect(page.getByText('사이트 목록')).toBeVisible()
    })
  })

  test.describe('사이트 CRUD', () => {
    // CRUD 테스트는 API 호출이 많아 타임아웃 증가
    test.describe.configure({ timeout: 30000 })

    test('새 사이트를 등록할 수 있다', async ({ page }) => {
      const testSite = generateTestSite()

      // 사이트 생성 버튼 클릭
      await page.getByRole('button', { name: '사이트 생성' }).click()

      // Sheet 패널이 열릴 때까지 대기
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible({ timeout: 5000 })
      await expect(dialog.getByText('사이트 생성', { exact: true })).toBeVisible()

      // 폼 입력 (dialog 내에서 찾기)
      await dialog.getByPlaceholder('e.g. siteA').fill(testSite.siteCode)
      await dialog.getByPlaceholder('e.g. A회사').fill(testSite.siteName)
      await dialog.getByPlaceholder('사이트에 대한 설명을 입력하세요').fill(testSite.description || '')

      // 등록 버튼 클릭
      await dialog.getByRole('button', { name: '등록' }).click()

      // 성공 토스트 확인 (first로 중복 요소 처리)
      await expect(page.getByText('사이트 생성 완료', { exact: true }).first()).toBeVisible({ timeout: 10000 })

      // 모달이 닫힘
      await expect(dialog).not.toBeVisible({ timeout: 5000 })

      // 목록에 새 사이트가 표시되는지 확인
      await expect(page.getByText(testSite.siteCode)).toBeVisible({ timeout: 5000 })
    })

    test('사이트 정보를 수정할 수 있다', async ({ page }) => {
      // 먼저 테스트용 사이트 생성
      const testSite = generateTestSite()
      await createTestSite(page, testSite)

      // Toast 알림이 사라질 때까지 대기
      await page.waitForTimeout(2000)

      // 액션 드롭다운 열기 (해당 사이트 행에서)
      const row = page.getByRole('row').filter({ hasText: testSite.siteCode })
      await row.getByRole('button', { name: '메뉴 열기' }).click()

      // 드롭다운에서 수정 클릭
      await page.getByRole('menuitem', { name: '수정' }).click()

      // 수정 Sheet 패널 확인
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible({ timeout: 5000 })
      await expect(dialog.getByText('사이트 수정', { exact: true })).toBeVisible()

      // 사이트 코드는 수정 불가 확인
      await expect(dialog.getByPlaceholder('e.g. siteA')).toBeDisabled()

      // 사이트명 수정
      const updatedName = `${testSite.siteName} (수정됨)`
      await dialog.getByPlaceholder('e.g. A회사').clear()
      await dialog.getByPlaceholder('e.g. A회사').fill(updatedName)

      // 수정 버튼 클릭
      await dialog.getByRole('button', { name: '수정' }).click()

      // 성공 토스트 확인 (first로 중복 요소 처리)
      await expect(page.getByText('수정 완료', { exact: true }).first()).toBeVisible({ timeout: 10000 })

      // 모달이 닫힘
      await expect(dialog).not.toBeVisible({ timeout: 5000 })

      // 목록에서 수정된 이름 확인
      await expect(page.getByText(updatedName)).toBeVisible({ timeout: 5000 })
    })

    test('사이트 활성화 상태를 토글할 수 있다', async ({ page }) => {
      // 테이블이 있는지 확인
      const table = page.locator('table')

      if (await table.isVisible()) {
        // 첫 번째 사이트의 액션 드롭다운 열기
        const firstRow = page.getByRole('row').nth(1) // 헤더 제외
        const menuButton = firstRow.getByRole('button', { name: '메뉴 열기' })

        if (await menuButton.isVisible()) {
          await menuButton.click()

          // 드롭다운에서 활성화/비활성화 클릭
          const toggleItem = page.getByRole('menuitem', { name: /활성화|비활성화/ })
          await toggleItem.click()

          // 성공 토스트 확인 (first로 중복 요소 처리)
          await expect(page.getByText('상태 변경 완료', { exact: true }).first()).toBeVisible({ timeout: 10000 })
        }
      }
    })

    test('사이트를 삭제할 수 있다', async ({ page }) => {
      // 먼저 테스트용 사이트 생성
      const testSite = generateTestSite()
      await createTestSite(page, testSite)

      // Toast 알림이 사라질 때까지 대기
      await page.waitForTimeout(2000)

      // 액션 드롭다운 열기
      const row = page.getByRole('row').filter({ hasText: testSite.siteCode })
      await row.getByRole('button', { name: '메뉴 열기' }).click()

      // 드롭다운에서 삭제 클릭
      await page.getByRole('menuitem', { name: '삭제' }).click()

      // 삭제 확인 모달
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible({ timeout: 5000 })
      await expect(dialog.getByText('사이트 삭제', { exact: true })).toBeVisible()
      await expect(dialog.getByText('정말로 이 사이트를 삭제하시겠습니까?')).toBeVisible()

      // 삭제 확인
      await dialog.getByRole('button', { name: '삭제' }).click()

      // 성공 토스트 확인 (first로 중복 요소 처리)
      await expect(page.getByText('삭제 완료', { exact: true }).first()).toBeVisible({ timeout: 10000 })

      // 목록에서 삭제 확인
      await expect(page.getByText(testSite.siteCode)).not.toBeVisible({ timeout: 5000 })
    })

    test('삭제를 취소할 수 있다', async ({ page }) => {
      // 테이블이 있는지 확인
      const table = page.locator('table')

      if (await table.isVisible()) {
        // 첫 번째 사이트의 액션 드롭다운 열기
        const firstRow = page.getByRole('row').nth(1)
        const menuButton = firstRow.getByRole('button', { name: '메뉴 열기' })

        if (await menuButton.isVisible()) {
          await menuButton.click()

          // 드롭다운에서 삭제 클릭
          await page.getByRole('menuitem', { name: '삭제' }).click()

          // 삭제 확인 모달에서 취소
          const dialog = page.getByRole('dialog')
          await expect(dialog).toBeVisible({ timeout: 5000 })
          await dialog.getByRole('button', { name: '취소' }).click()

          // 모달이 닫힘
          await expect(dialog).not.toBeVisible({ timeout: 5000 })
        }
      }
    })
  })

  test.describe('폼 유효성 검사', () => {
    test.describe.configure({ timeout: 15000 })

    test('필수 필드 없이 등록 시 오류가 표시된다', async ({ page }) => {
      // 사이트 생성 Sheet 열기
      await page.getByRole('button', { name: '사이트 생성' }).click()

      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible({ timeout: 5000 })
      await expect(dialog.getByText('사이트 생성', { exact: true })).toBeVisible()

      // 빈 상태로 등록 시도
      await dialog.getByRole('button', { name: '등록' }).click()

      // 오류 토스트 확인 (first로 중복 요소 처리)
      await expect(page.getByText('입력 오류', { exact: true }).first()).toBeVisible({ timeout: 5000 })
    })

    test('등록 Sheet를 취소할 수 있다', async ({ page }) => {
      // 사이트 생성 Sheet 열기
      await page.getByRole('button', { name: '사이트 생성' }).click()

      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible({ timeout: 5000 })
      await expect(dialog.getByText('사이트 생성', { exact: true })).toBeVisible()

      // 일부 데이터 입력
      await dialog.getByPlaceholder('e.g. siteA').fill('TEST_CANCEL')

      // 취소 버튼 클릭
      await dialog.getByRole('button', { name: '취소' }).click()

      // Sheet이 닫힘
      await expect(dialog).not.toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('새로고침', () => {
    test('새로고침 버튼으로 목록을 갱신할 수 있다', async ({ page }) => {
      // 새로고침 버튼 클릭 (아이콘 버튼)
      await page.locator('button[title="새로고침"]').click()

      // 로딩 후 목록이 다시 표시됨
      await expect(page.getByText('사이트 목록')).toBeVisible()
    })
  })
})

/**
 * 테스트용 사이트 생성 헬퍼 함수
 */
async function createTestSite(
  page: import('@playwright/test').Page,
  site: { siteCode: string; siteName: string; description?: string }
) {
  await page.getByRole('button', { name: '사이트 생성' }).click()

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible({ timeout: 5000 })
  await expect(dialog.getByText('사이트 생성', { exact: true })).toBeVisible()

  await dialog.getByPlaceholder('e.g. siteA').fill(site.siteCode)
  await dialog.getByPlaceholder('e.g. A회사').fill(site.siteName)
  if (site.description) {
    await dialog.getByPlaceholder('사이트에 대한 설명을 입력하세요').fill(site.description)
  }

  await dialog.getByRole('button', { name: '등록' }).click()
  await expect(page.getByText('사이트 생성 완료', { exact: true }).first()).toBeVisible({ timeout: 10000 })
  await expect(dialog).not.toBeVisible({ timeout: 5000 })

  // 목록에 새 사이트가 나타날 때까지 대기
  await expect(page.getByText(site.siteCode)).toBeVisible({ timeout: 5000 })
}
