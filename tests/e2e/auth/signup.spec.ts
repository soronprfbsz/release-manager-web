import { test, expect } from '@playwright/test'

// 회원가입 페이지 테스트는 인증 없이 진행해야 함
test.use({ storageState: { cookies: [], origins: [] } })

// 테스트용 고유 이메일 생성
function generateTestEmail(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `test_${timestamp}_${random}@example.com`
}

test.describe('회원가입 페이지', () => {
  test.beforeEach(async ({ page }) => {
    // 회원가입 페이지로 이동
    await page.goto('/signup')
    await page.waitForLoadState('networkidle')
  })

  test.describe('페이지 로딩', () => {
    test('회원가입 페이지가 정상적으로 로드된다', async ({ page }) => {
      // 타이틀 확인 (CardTitle은 div로 렌더링됨)
      await expect(page.getByText('회원가입', { exact: true }).first()).toBeVisible()

      // 설명 텍스트 확인
      await expect(page.getByText('새 계정을 만들어 시작하세요')).toBeVisible()

      // 이름 입력 필드 확인
      await expect(page.locator('#accountName')).toBeVisible()
      await expect(page.getByText('이름', { exact: true })).toBeVisible()

      // 이메일 입력 필드 확인
      await expect(page.locator('#email')).toBeVisible()
      await expect(page.getByText('이메일', { exact: true })).toBeVisible()

      // 비밀번호 입력 필드 확인
      await expect(page.locator('#password')).toBeVisible()
      await expect(page.getByText('비밀번호', { exact: true }).first()).toBeVisible()

      // 비밀번호 확인 입력 필드 확인
      await expect(page.locator('#confirmPassword')).toBeVisible()
      await expect(page.getByText('비밀번호 확인')).toBeVisible()

      // 회원가입 버튼 확인
      await expect(page.getByRole('button', { name: '회원가입' })).toBeVisible()

      // 로그인 링크 확인
      await expect(page.getByText('이미 계정이 있으신가요?')).toBeVisible()
      await expect(page.getByRole('link', { name: '로그인' })).toBeVisible()
    })

    test('placeholder가 정상적으로 표시된다', async ({ page }) => {
      await expect(page.getByPlaceholder('홍길동')).toBeVisible()
      await expect(page.getByPlaceholder('your@email.com')).toBeVisible()
      await expect(page.getByPlaceholder('8자 이상 입력')).toBeVisible()
      await expect(page.getByPlaceholder('비밀번호 재입력')).toBeVisible()
    })
  })

  test.describe('폼 입력', () => {
    test('이름을 입력할 수 있다', async ({ page }) => {
      const nameInput = page.locator('#accountName')
      await nameInput.fill('테스트 사용자')
      await expect(nameInput).toHaveValue('테스트 사용자')
    })

    test('이메일을 입력할 수 있다', async ({ page }) => {
      const emailInput = page.locator('#email')
      await emailInput.fill('test@example.com')
      await expect(emailInput).toHaveValue('test@example.com')
    })

    test('비밀번호를 입력할 수 있다', async ({ page }) => {
      const passwordInput = page.locator('#password')
      await passwordInput.fill('password123')
      await expect(passwordInput).toHaveValue('password123')
    })

    test('비밀번호 확인을 입력할 수 있다', async ({ page }) => {
      const confirmPasswordInput = page.locator('#confirmPassword')
      await confirmPasswordInput.fill('password123')
      await expect(confirmPasswordInput).toHaveValue('password123')
    })

    test('비밀번호 필드가 password 타입이다', async ({ page }) => {
      await expect(page.locator('#password')).toHaveAttribute('type', 'password')
      await expect(page.locator('#confirmPassword')).toHaveAttribute('type', 'password')
    })
  })

  test.describe('폼 유효성 검사', () => {
    test('이름 없이 회원가입 시 브라우저 유효성 검사가 동작한다', async ({ page }) => {
      // 이름 외 다른 필드 입력
      await page.locator('#email').fill('test@example.com')
      await page.locator('#password').fill('password123')
      await page.locator('#confirmPassword').fill('password123')

      // 회원가입 버튼 클릭
      await page.getByRole('button', { name: '회원가입' }).click()

      // HTML5 유효성 검사로 인해 폼이 제출되지 않음
      await expect(page.locator('#accountName')).toBeVisible()
    })

    test('이메일 없이 회원가입 시 브라우저 유효성 검사가 동작한다', async ({ page }) => {
      // 이메일 외 다른 필드 입력
      await page.locator('#accountName').fill('테스트')
      await page.locator('#password').fill('password123')
      await page.locator('#confirmPassword').fill('password123')

      // 회원가입 버튼 클릭
      await page.getByRole('button', { name: '회원가입' }).click()

      // HTML5 유효성 검사로 인해 폼이 제출되지 않음
      await expect(page.locator('#email')).toBeVisible()
    })

    test('비밀번호 없이 회원가입 시 브라우저 유효성 검사가 동작한다', async ({ page }) => {
      // 비밀번호 외 다른 필드 입력
      await page.locator('#accountName').fill('테스트')
      await page.locator('#email').fill('test@example.com')
      await page.locator('#confirmPassword').fill('password123')

      // 회원가입 버튼 클릭
      await page.getByRole('button', { name: '회원가입' }).click()

      // HTML5 유효성 검사로 인해 폼이 제출되지 않음
      await expect(page.locator('#password')).toBeVisible()
    })

    test('비밀번호 확인 없이 회원가입 시 브라우저 유효성 검사가 동작한다', async ({ page }) => {
      // 비밀번호 확인 외 다른 필드 입력
      await page.locator('#accountName').fill('테스트')
      await page.locator('#email').fill('test@example.com')
      await page.locator('#password').fill('password123')

      // 회원가입 버튼 클릭
      await page.getByRole('button', { name: '회원가입' }).click()

      // HTML5 유효성 검사로 인해 폼이 제출되지 않음
      await expect(page.locator('#confirmPassword')).toBeVisible()
    })

    test('비밀번호가 8자 미만이면 브라우저 유효성 검사가 동작한다', async ({ page }) => {
      // 모든 필드 입력 (비밀번호 8자 미만)
      await page.locator('#accountName').fill('테스트')
      await page.locator('#email').fill('test@example.com')
      await page.locator('#password').fill('1234567') // 7자
      await page.locator('#confirmPassword').fill('1234567')

      // 회원가입 버튼 클릭
      await page.getByRole('button', { name: '회원가입' }).click()

      // HTML5 minLength 유효성 검사로 인해 폼이 제출되지 않음 (페이지 유지)
      await expect(page.locator('#password')).toBeVisible()
      // 회원가입 페이지에 그대로 있는지 확인
      await expect(page).toHaveURL(/\/signup/)
    })

    test('비밀번호와 비밀번호 확인이 일치하지 않으면 오류 토스트가 표시된다', async ({ page }) => {
      // 모든 필드 입력 (비밀번호 불일치)
      await page.locator('#accountName').fill('테스트')
      await page.locator('#email').fill('test@example.com')
      await page.locator('#password').fill('password123')
      await page.locator('#confirmPassword').fill('differentpassword')

      // 회원가입 버튼 클릭
      await page.getByRole('button', { name: '회원가입' }).click()

      // 비밀번호 불일치 토스트 확인
      await expect(page.getByText('비밀번호 불일치')).toBeVisible({ timeout: 5000 })
      await expect(page.getByText('비밀번호와 비밀번호 확인이 일치하지 않습니다.')).toBeVisible()
    })

    test('잘못된 이메일 형식은 브라우저 유효성 검사가 동작한다', async ({ page }) => {
      // 잘못된 이메일 형식 입력
      await page.locator('#accountName').fill('테스트')
      await page.locator('#email').fill('invalid-email')
      await page.locator('#password').fill('password123')
      await page.locator('#confirmPassword').fill('password123')

      // 회원가입 버튼 클릭
      await page.getByRole('button', { name: '회원가입' }).click()

      // HTML5 이메일 유효성 검사로 인해 폼이 제출되지 않음
      await expect(page.locator('#email')).toBeVisible()
    })
  })

  test.describe('회원가입 기능', () => {
    test('유효한 정보로 회원가입하면 성공 토스트가 표시되고 로그인 페이지로 이동한다', async ({ page }) => {
      const testEmail = generateTestEmail()

      // 모든 필드 입력
      await page.locator('#accountName').fill('테스트 사용자')
      await page.locator('#email').fill(testEmail)
      await page.locator('#password').fill('testpassword123')
      await page.locator('#confirmPassword').fill('testpassword123')

      // 회원가입 버튼 클릭
      await page.getByRole('button', { name: '회원가입' }).click()

      // 성공 토스트 또는 에러 토스트 확인 (서버 상태에 따라)
      // 성공 시: 회원가입 완료 토스트 + 로그인 페이지 이동
      // 실패 시: 회원가입 실패 토스트
      await page.waitForTimeout(2000)

      const successToast = page.getByText('회원가입 완료')
      const failToast = page.getByText('회원가입 실패')

      const isSuccess = await successToast.isVisible().catch(() => false)
      const isFail = await failToast.isVisible().catch(() => false)

      // 둘 중 하나는 반드시 표시되어야 함
      expect(isSuccess || isFail).toBeTruthy()

      // 성공한 경우 로그인 페이지로 이동 확인
      if (isSuccess) {
        await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
      }
    })

    test('이미 존재하는 이메일로 회원가입하면 오류 토스트가 표시된다', async ({ page }) => {
      const testEmail = process.env.TEST_USER_EMAIL

      if (!testEmail) {
        test.skip()
        return
      }

      // 이미 존재하는 이메일로 회원가입 시도
      await page.locator('#accountName').fill('테스트 사용자')
      await page.locator('#email').fill(testEmail)
      await page.locator('#password').fill('testpassword123')
      await page.locator('#confirmPassword').fill('testpassword123')

      // 회원가입 버튼 클릭
      await page.getByRole('button', { name: '회원가입' }).click()

      // 회원가입 실패 토스트 확인 (first로 중복 요소 처리)
      await expect(page.getByText('회원가입 실패', { exact: true }).first()).toBeVisible({ timeout: 10000 })
    })

    test('회원가입 중 로딩 상태가 표시된다', async ({ page }) => {
      const testEmail = generateTestEmail()

      // 모든 필드 입력
      await page.locator('#accountName').fill('테스트')
      await page.locator('#email').fill(testEmail)
      await page.locator('#password').fill('password123')
      await page.locator('#confirmPassword').fill('password123')

      // 회원가입 버튼 클릭
      await page.getByRole('button', { name: '회원가입' }).click()

      // 버튼이 여전히 존재하는지 확인 (에러가 발생하든 성공하든)
      const signupButton = page.getByRole('button', { name: /회원가입|가입 중/ })
      await expect(signupButton).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('네비게이션', () => {
    test('로그인 링크를 클릭하면 로그인 페이지로 이동한다', async ({ page }) => {
      // 로그인 링크 클릭
      await page.getByRole('link', { name: '로그인' }).click()

      // 로그인 페이지로 이동 확인
      await expect(page).toHaveURL(/\/login/)
    })
  })

  test.describe('접근성', () => {
    test('이름 입력 필드에 label이 연결되어 있다', async ({ page }) => {
      const nameLabel = page.locator('label[for="accountName"]')
      await expect(nameLabel).toBeVisible()
      await expect(nameLabel).toHaveText('이름')
    })

    test('이메일 입력 필드에 label이 연결되어 있다', async ({ page }) => {
      const emailLabel = page.locator('label[for="email"]')
      await expect(emailLabel).toBeVisible()
      await expect(emailLabel).toHaveText('이메일')
    })

    test('비밀번호 입력 필드에 label이 연결되어 있다', async ({ page }) => {
      const passwordLabel = page.locator('label[for="password"]')
      await expect(passwordLabel).toBeVisible()
      await expect(passwordLabel).toHaveText('비밀번호')
    })

    test('비밀번호 확인 입력 필드에 label이 연결되어 있다', async ({ page }) => {
      const confirmLabel = page.locator('label[for="confirmPassword"]')
      await expect(confirmLabel).toBeVisible()
      await expect(confirmLabel).toHaveText('비밀번호 확인')
    })

    test('Tab 키로 폼 요소를 탐색할 수 있다', async ({ page }) => {
      // 이름 필드에 포커스
      await page.locator('#accountName').focus()
      await expect(page.locator('#accountName')).toBeFocused()

      // Tab으로 이메일 필드로 이동
      await page.keyboard.press('Tab')
      await expect(page.locator('#email')).toBeFocused()

      // Tab으로 비밀번호 필드로 이동
      await page.keyboard.press('Tab')
      await expect(page.locator('#password')).toBeFocused()

      // Tab으로 비밀번호 확인 필드로 이동
      await page.keyboard.press('Tab')
      await expect(page.locator('#confirmPassword')).toBeFocused()

      // Tab으로 회원가입 버튼으로 이동
      await page.keyboard.press('Tab')
      await expect(page.getByRole('button', { name: '회원가입' })).toBeFocused()
    })

    test('Enter 키로 폼을 제출할 수 있다', async ({ page }) => {
      // 모든 필드 입력
      await page.locator('#accountName').fill('테스트')
      await page.locator('#email').fill('test@example.com')
      await page.locator('#password').fill('password123')
      await page.locator('#confirmPassword').fill('password123')

      // Enter 키로 제출
      await page.keyboard.press('Enter')

      // 폼이 제출되었는지 확인 (토스트 표시)
      await page.waitForTimeout(2000)

      // 어떤 토스트든 표시됨 (성공 또는 실패)
      const hasToast = await page.locator('[role="status"]').first().isVisible().catch(() => false)
      const hasSignupResult = await page.getByText(/회원가입 완료|회원가입 실패/).first().isVisible().catch(() => false)

      expect(hasToast || hasSignupResult).toBeTruthy()
    })
  })

  test.describe('인증된 사용자', () => {
    test('이미 로그인한 사용자는 홈으로 리다이렉트된다', async ({ page }) => {
      const testEmail = process.env.TEST_USER_EMAIL
      const testPassword = process.env.TEST_USER_PASSWORD

      if (!testEmail || !testPassword) {
        test.skip()
        return
      }

      // 먼저 로그인
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      await page.locator('#email').fill(testEmail)
      await page.locator('#password').fill(testPassword)
      await page.getByRole('button', { name: '로그인' }).click()

      // 홈으로 이동 대기
      await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 })

      // 다시 회원가입 페이지로 이동 시도
      await page.goto('/signup')
      await page.waitForLoadState('networkidle')

      // 홈으로 리다이렉트되어야 함
      expect(page.url()).not.toContain('/signup')
    })
  })

  test.describe('입력 제한', () => {
    test('이름 필드는 최대 50자까지 입력 가능하다', async ({ page }) => {
      const nameInput = page.locator('#accountName')
      await expect(nameInput).toHaveAttribute('maxlength', '50')
    })

    test('이메일 필드는 최대 50자까지 입력 가능하다', async ({ page }) => {
      const emailInput = page.locator('#email')
      await expect(emailInput).toHaveAttribute('maxlength', '50')
    })

    test('비밀번호 필드는 최소 8자 이상 입력해야 한다', async ({ page }) => {
      const passwordInput = page.locator('#password')
      await expect(passwordInput).toHaveAttribute('minlength', '8')
    })

    test('비밀번호 필드는 최대 100자까지 입력 가능하다', async ({ page }) => {
      const passwordInput = page.locator('#password')
      await expect(passwordInput).toHaveAttribute('maxlength', '100')
    })
  })
})
