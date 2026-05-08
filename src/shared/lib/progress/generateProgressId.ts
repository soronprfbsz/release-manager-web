/**
 * generateProgressId
 *
 * 서버 진행도 polling 용 UUID v4 생성.
 *
 * - crypto.randomUUID: HTTPS(secure context) 환경에서 우선 사용
 * - crypto.getRandomValues: 일부 HTTP 환경에서도 동작
 * - fallback: timestamp + Math.random (HTTP + 구형 환경 대비)
 *
 * progressId 는 단일 사용자의 단일 작업 매핑 용도이므로 보안 강도보다
 * HTTP 환경 호환성이 중요. UUID v4 형식만 유지.
 */
export function generateProgressId(): string {
  const c: Crypto | undefined =
    typeof crypto !== 'undefined' ? crypto : undefined

  // 1순위: crypto.randomUUID (HTTPS 전용)
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID()
  }

  // 2순위: crypto.getRandomValues (일부 HTTP 지원)
  const bytes = new Uint8Array(16)
  if (c && typeof c.getRandomValues === 'function') {
    c.getRandomValues(bytes)
  } else {
    // 3순위: Math.random fallback
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256)
  }

  // RFC 4122 v4
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
