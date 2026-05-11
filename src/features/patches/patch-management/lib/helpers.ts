/**
 * Patch Management Feature Helpers
 * 패치 관리 기능 헬퍼 함수
 */

import type { VersionOption } from '../model/types'

/** 엔진 후보 식별 정책 안내 문구 (사용자 친화적 단순 표현) */
export const ENGINE_CANDIDATE_POLICY_HINT =
  'NC_, OZ_ 로 시작하는 파일이 엔진 빌드 파일로 인식됩니다. 그 외 동봉된 자산은 자동 포함됩니다.'

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
