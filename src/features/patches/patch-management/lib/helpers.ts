/**
 * Patch Management Feature Helpers
 * 패치 관리 기능 헬퍼 함수
 */

import type { BuildsInRangeResponse } from '@/entities/releases/release'
import type { BuildSelection } from '@/entities/patches/patch'

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

/**
 * 구버전 빌드 선택 항목 타입
 * 현재 선택된 빌드가 범위 내 최신이 아닐 때 해당 정보를 담습니다.
 */
export type OutdatedSelection = {
  kind: 'WEB' | 'ENGINE'
  engineName?: string
  selected: { buildVersionId: number; fullVersion: string }
  latest: { buildVersionId: number; fullVersion: string }
}

/**
 * 빌드 선택에서 구버전 항목을 검출합니다.
 *
 * - BuildSelection.enabled 가 false 이면 빈 배열 반환 (검사 skip)
 * - WEB / ENGINE 각각 isLatest=true 인 후보와 비교
 * - 선택된 buildVersionId 가 최신이 아니면 OutdatedSelection 으로 수집
 */
export function detectOutdatedSelections(
  buildsInRange: BuildsInRangeResponse,
  selection: BuildSelection,
): OutdatedSelection[] {
  if (!selection.enabled) return []

  const result: OutdatedSelection[] = []

  // WEB 검사
  if (selection.web && buildsInRange.web.length > 0) {
    const latest = buildsInRange.web.find((c) => c.isLatest)
    if (latest && latest.buildVersionId !== selection.web.buildVersionId) {
      const sel = buildsInRange.web.find(
        (c) => c.buildVersionId === selection.web!.buildVersionId,
      )
      if (sel) {
        result.push({
          kind: 'WEB',
          selected: { buildVersionId: sel.buildVersionId, fullVersion: sel.fullVersion },
          latest: { buildVersionId: latest.buildVersionId, fullVersion: latest.fullVersion },
        })
      }
    }
  }

  // ENGINE 검사
  for (const eng of selection.engines) {
    const group = buildsInRange.engines.find((g) => g.engineName === eng.engineName)
    if (!group) continue
    const latest = group.candidates.find((c) => c.isLatest)
    if (latest && latest.buildVersionId !== eng.buildVersionId) {
      const sel = group.candidates.find((c) => c.buildVersionId === eng.buildVersionId)
      if (sel) {
        result.push({
          kind: 'ENGINE',
          engineName: eng.engineName,
          selected: { buildVersionId: sel.buildVersionId, fullVersion: sel.fullVersion },
          latest: { buildVersionId: latest.buildVersionId, fullVersion: latest.fullVersion },
        })
      }
    }
  }

  return result
}
