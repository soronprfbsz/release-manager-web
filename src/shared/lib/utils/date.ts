/**
 * Date/Time Formatting Utilities
 * 날짜 및 시간 포맷팅 유틸리티
 */

/**
 * 서버에서 받은 날짜 문자열을 UTC로 파싱
 * 타임존 정보가 없는 문자열(e.g. "2025-02-11T05:30:00")에 'Z'를 붙여 UTC로 해석
 */
function parseUTC(dateStr: string): Date {
  if (!dateStr.endsWith('Z') && !dateStr.includes('+') && !/[-+]\d{2}:\d{2}$/.test(dateStr)) {
    return new Date(dateStr + 'Z')
  }
  return new Date(dateStr)
}

/**
 * Format date string to Korean locale date
 * @param dateStr - ISO date string
 * @returns Formatted date string or '-' if invalid
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const date = parseUTC(dateStr)
  if (isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format date string to Korean locale datetime
 * @param dateStr - ISO date string
 * @returns Formatted datetime string or '-' if invalid
 */
export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const date = parseUTC(dateStr)
  if (isNaN(date.getTime())) return '-'

  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format date string to short format (YYYY-MM-DD)
 * @param dateStr - ISO date string
 * @returns Formatted date string or '-' if invalid
 */
export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const date = parseUTC(dateStr)
  if (isNaN(date.getTime())) return '-'

  return date
    .toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\. /g, '-')
    .replace('.', '')
}

/**
 * Format date string to Korean locale datetime with long month
 * @param dateStr - ISO date string
 * @returns Formatted datetime string or '-' if invalid
 */
export function formatDateTimeLong(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const date = parseUTC(dateStr)
  if (isNaN(date.getTime())) return '-'

  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Get relative time from now
 * @param dateStr - ISO date string
 * @returns Relative time string (e.g., "2시간 전")
 */
export function getRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const date = parseUTC(dateStr)
  if (isNaN(date.getTime())) return '-'

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`

  return formatDate(dateStr)
}
