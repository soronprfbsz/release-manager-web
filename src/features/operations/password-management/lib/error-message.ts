/**
 * Password Management Error Message
 * 비밀번호 관련 에러코드 → 사용자 친화 문구 매핑.
 * 백엔드가 한글 메시지를 주므로 error.message 가 기본값이며,
 * 일부 코드만 친절 문구로 override 한다. (PRD §6)
 */

import { getErrorMessage } from '@/shared/lib/utils/error-handler'

// 키는 백엔드 응답 본문의 code 값(ErrorCode.getCode()). 이름(name())이 아니라 영숫자 코드가 내려온다.
// A004 = INVALID_CURRENT_PASSWORD, A005 = PASSWORD_SAME_AS_CURRENT (ErrorCode.java 참조)
const FRIENDLY_MESSAGES: Record<string, string> = {
  A004: '현재 비밀번호가 올바르지 않습니다.',
  A005: '새 비밀번호는 현재 비밀번호와 달라야 합니다.',
}

/** 에러 객체에서 비밀번호용 사용자 문구를 추출 (코드 우선, 없으면 message) */
export function getPasswordErrorMessage(error: unknown): string {
  const code = (error as { code?: string } | null)?.code
  if (code && FRIENDLY_MESSAGES[code]) {
    return FRIENDLY_MESSAGES[code]
  }
  return getErrorMessage(error)
}
