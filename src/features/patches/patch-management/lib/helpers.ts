/**
 * Patch Management Feature Helpers
 * 패치 관리 기능 헬퍼 함수
 */

import { compareVersions } from '@/shared/lib/utils/version'

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

/** 버전 라벨. 미승인이면 '(미승인)' 접미어를 붙인다. value 는 항상 순수 버전 문자열을 유지. */
export const formatVersionLabel = (version: string, isApproved: boolean): string =>
  isApproved ? version : `${version} (미승인)`

/**
 * from~to 구간(양 끝 포함)에 들어가는 미승인 버전 목록.
 *
 * 백엔드 범위 검증과 같은 기준이라, 셀렉트박스 라벨로는 드러나지 않는
 * "구간 중간의 미승인" 까지 폼에서 미리 안내할 수 있다.
 */
export const findUnapprovedInRange = <T extends { version: string; isApproved: boolean }>(
  options: T[],
  fromVersion: string,
  toVersion: string,
): T[] => {
  if (!fromVersion || !toVersion) return []
  return options.filter(
    (opt) =>
      !opt.isApproved &&
      compareVersions(opt.version, fromVersion) >= 0 &&
      compareVersions(opt.version, toVersion) <= 0,
  )
}
