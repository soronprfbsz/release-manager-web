/**
 * Patch Management Feature Helpers
 * 패치 관리 기능 헬퍼 함수
 */

import type { BuildsInRangeResponse } from '@/entities/releases/release'
import type { BuildSelection } from '@/entities/patches/patch'

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

/**
 * 빌드 선택 위험 항목 타입
 * - reason='outdated': 선택된 빌드가 범위 내 최신이 아님
 * - reason='missing':  picker 후보가 있는데 사용자가 '포함 안 함' 으로 두어 누락됨
 *
 * 두 경우 모두 to 버전 사이트에 “해당 항목만 옛 상태” 가 되어 호환성 사고 위험.
 */
export type OutdatedSelection = {
  kind: 'WEB' | 'ENGINE'
  engineName?: string
  reason: 'outdated' | 'missing'
  /** 미선택(missing) 케이스에서는 null */
  selected: { buildVersionId: number; fullVersion: string } | null
  latest: { buildVersionId: number; fullVersion: string }
}

/**
 * 빌드 선택의 위험 항목 (구버전 / 미선택) 을 검출합니다.
 *
 * 검사 정책:
 * - BuildSelection.enabled 가 false 이면 빈 배열 반환 (검사 skip — 토글 OFF)
 * - 토글 ON 이지만 picker 에서 후보가 있는 항목을 '포함 안 함' 으로 두면 missing
 * - 선택된 buildVersionId 가 그 그룹의 isLatest=true 가 아니면 outdated
 */
export function detectOutdatedSelections(
  buildsInRange: BuildsInRangeResponse,
  selection: BuildSelection,
): OutdatedSelection[] {
  if (!selection.enabled) return []

  const result: OutdatedSelection[] = []

  // WEB 검사
  if (buildsInRange.web.length > 0) {
    const latest = buildsInRange.web.find((c) => c.isLatest)
    if (latest) {
      if (!selection.web) {
        // 토글 ON 이지만 WEB 미선택 → 사이트 WEB 만 옛 상태가 됨
        result.push({
          kind: 'WEB',
          reason: 'missing',
          selected: null,
          latest: { buildVersionId: latest.buildVersionId, fullVersion: latest.fullVersion },
        })
      } else if (latest.buildVersionId !== selection.web.buildVersionId) {
        const sel = buildsInRange.web.find(
          (c) => c.buildVersionId === selection.web!.buildVersionId,
        )
        if (sel) {
          result.push({
            kind: 'WEB',
            reason: 'outdated',
            selected: { buildVersionId: sel.buildVersionId, fullVersion: sel.fullVersion },
            latest: { buildVersionId: latest.buildVersionId, fullVersion: latest.fullVersion },
          })
        }
      }
    }
  }

  // ENGINE 검사 — 후보(EngineGroup) 기준으로 순회 (미선택 검출을 위해)
  for (const group of buildsInRange.engines) {
    const latest = group.candidates.find((c) => c.isLatest)
    if (!latest) continue

    const eng = selection.engines.find((e) => e.engineName === group.engineName)
    if (!eng) {
      // 후보 있는데 picker 미선택 → 사이트 해당 엔진만 옛 상태
      result.push({
        kind: 'ENGINE',
        engineName: group.engineName,
        reason: 'missing',
        selected: null,
        latest: { buildVersionId: latest.buildVersionId, fullVersion: latest.fullVersion },
      })
      continue
    }
    if (latest.buildVersionId !== eng.buildVersionId) {
      const sel = group.candidates.find((c) => c.buildVersionId === eng.buildVersionId)
      if (sel) {
        result.push({
          kind: 'ENGINE',
          engineName: group.engineName,
          reason: 'outdated',
          selected: { buildVersionId: sel.buildVersionId, fullVersion: sel.fullVersion },
          latest: { buildVersionId: latest.buildVersionId, fullVersion: latest.fullVersion },
        })
      }
    }
  }

  return result
}
