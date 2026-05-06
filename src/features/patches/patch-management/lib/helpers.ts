/**
 * Patch Management Feature Helpers
 * 패치 관리 기능 헬퍼 함수
 */

import type { VersionOption } from '../model/types'

/** 엔진 후보 식별 정책 안내 문구 */
export const ENGINE_CANDIDATE_POLICY_HINT =
  'SubCategoryValidator 화이트리스트 ∪ NC_*/OZ_* prefix 통과 항목이 엔진 후보입니다 (확장자 있는 파일은 공유 자산으로 자동 동반).'

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
