/**
 * Phone Number Utilities
 * 전화번호 처리 공통 모듈
 */

/**
 * 전화번호에서 하이픈(-) 및 공백 제거 (숫자만 추출)
 * 010-1234-5678 → 01012345678
 * 010 1234 5678 → 01012345678
 */
export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, '')
}

/**
 * 전화번호 포맷팅 (표시용)
 * 01012345678 → 010-1234-5678
 * 0212345678 → 02-1234-5678
 */
export function formatPhoneNumber(phone: string): string {
  const normalized = normalizePhoneNumber(phone)

  // 휴대폰 번호 (010, 011, 016, 017, 018, 019)
  if (/^01[016789]/.test(normalized)) {
    if (normalized.length <= 3) return normalized
    if (normalized.length <= 7) return normalized.replace(/^(\d{3})(\d{0,4})/, '$1-$2')
    return normalized.replace(/^(\d{3})(\d{4})(\d{0,4})/, '$1-$2-$3')
  }

  // 서울 지역번호 (02)
  if (/^02/.test(normalized)) {
    if (normalized.length <= 2) return normalized
    if (normalized.length <= 5) return normalized.replace(/^(\d{2})(\d{0,3})/, '$1-$2')
    if (normalized.length <= 9) return normalized.replace(/^(\d{2})(\d{3})(\d{0,4})/, '$1-$2-$3')
    return normalized.replace(/^(\d{2})(\d{4})(\d{0,4})/, '$1-$2-$3')
  }

  // 기타 지역번호 (031, 032, ...)
  if (/^0[3-9]/.test(normalized)) {
    if (normalized.length <= 3) return normalized
    if (normalized.length <= 6) return normalized.replace(/^(\d{3})(\d{0,3})/, '$1-$2')
    if (normalized.length <= 10) return normalized.replace(/^(\d{3})(\d{3})(\d{0,4})/, '$1-$2-$3')
    return normalized.replace(/^(\d{3})(\d{4})(\d{0,4})/, '$1-$2-$3')
  }

  return normalized
}

/**
 * 유효한 전화번호인지 검증
 */
export function isValidPhoneNumber(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone)
  // 휴대폰: 010, 011, 016, 017, 018, 019로 시작하는 10-11자리
  // 유선전화: 02-0n으로 시작하는 9-11자리
  return /^(01[016789]\d{7,8}|0[2-9]\d{7,9})$/.test(normalized)
}
