/**
 * Patch Management Feature Helpers
 * 패치 관리 기능 헬퍼 함수
 */

import type { VersionOption } from '../model/types'

/**
 * versionOptions 배열에서 version 문자열에 해당하는 versionId를 반환합니다.
 * 매칭되지 않거나 version이 undefined면 null을 반환합니다.
 */
export const getVersionIdFromOption = (
  versionOptions: VersionOption[],
  version: string | undefined,
): number | null => {
  if (!version) return null
  return versionOptions.find((opt) => opt.version === version)?.versionId ?? null
}
