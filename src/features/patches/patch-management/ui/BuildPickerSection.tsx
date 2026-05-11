/**
 * BuildSummarySection — 범위 내 자동 선택된 최신 빌드 read-only 표시
 *
 * <p>운영자가 임의로 옛 빌드를 고르는 기능은 폐기 (잘못 선택 위험 제거).
 *  WEB / ENGINE 별로 "어떤 fullVersion 이 패치에 포함될지" 정보 제공만.
 *  computeAutoPreselect 가 PatchCreateForm 측에서 항상 호출되어 폼 state
 *  의 buildSelection 을 자동 채워 두므로 submit 시 그대로 전송됨.
 */

import { Label } from '@/shared/ui/label'

import type { BuildCandidate, BuildsInRangeResponse } from '@/entities/releases/release'
import type { BuildSelection, SelectedEngine } from '@/entities/patches/patch'

interface BuildSummarySectionProps {
  data: BuildsInRangeResponse
}

/** 자동 preselect: 모든 항목의 첫 번째(최신) 후보로 BuildSelection 생성 */
export function computeAutoPreselect(data: BuildsInRangeResponse): BuildSelection {
  const web =
    data.web.length > 0 ? { buildVersionId: data.web[0].buildVersionId } : null
  // candidates 가 비어 있는 EngineGroup 은 안전하게 건너뜀
  const engines: SelectedEngine[] = data.engines
    .filter((g) => g.candidates.length > 0)
    .map((g) => ({
      engineName: g.engineName,
      buildVersionId: g.candidates[0].buildVersionId,
    }))
  return { enabled: true, web, engines }
}

export function BuildPickerSection({ data }: BuildSummarySectionProps) {
  const hasBuilds = data.web.length > 0 || data.engines.length > 0

  return (
    <div className="flex flex-col gap-4">
      {!hasBuilds && (
        <span className="text-sm text-muted-foreground">이 범위에 빌드가 없습니다</span>
      )}

      {data.web.length > 0 && (
        <section>
          <h4 className="mb-2 text-sm font-semibold">WEB</h4>
          <ul className="flex flex-col gap-2">
            <BuildSummaryRow label="WEB" build={data.web[0]} />
          </ul>
        </section>
      )}

      {data.engines.length > 0 && (
        <section>
          <h4 className="mb-1 text-sm font-semibold">ENGINE</h4>
          <p className="mb-2 text-xs text-muted-foreground">
            <span className="mr-1">ⓘ</span>
            <span>
              <span className="font-mono">NC_</span>, <span className="font-mono">OZ_</span>
              {' '}로 시작하는 파일이 엔진 빌드 파일로 인식됩니다. 그 외 동봉된 자산은 자동 포함됩니다.
            </span>
          </p>
          <ul className="flex flex-col gap-2">
            {data.engines
              .filter((g) => g.candidates.length > 0)
              .map((g) => (
                <BuildSummaryRow
                  key={g.engineName}
                  label={g.engineName}
                  build={g.candidates[0]}
                />
              ))}
          </ul>
        </section>
      )}

      {!hasBuilds && (
        <p className="text-xs text-muted-foreground">
          <span className="mr-1">ⓘ</span>
          <span>
            <span className="font-mono">NC_</span>, <span className="font-mono">OZ_</span>
            {' '}로 시작하는 파일이 엔진 빌드 파일로 인식됩니다. 그 외 동봉된 자산은 자동 포함됩니다.
          </span>
        </p>
      )}
    </div>
  )
}

interface BuildSummaryRowProps {
  label: string
  build: BuildCandidate
}

/** read-only 한 줄 — fullVersion 텍스트만 (어차피 항상 최신) */
function BuildSummaryRow({ label, build }: BuildSummaryRowProps) {
  return (
    <li className="grid grid-cols-[160px_1fr] items-center gap-2">
      <Label className="text-sm">{label}</Label>
      <span className="font-mono text-sm">{build.fullVersion}</span>
    </li>
  )
}
