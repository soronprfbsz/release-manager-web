/**
 * BuildPickerSection Component
 * 빌드 파일 picker 섹션 — WEB radio + ENGINE 행 + 일괄 액션
 */

import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Label } from '@/shared/ui/label'

import type { BuildCandidate, BuildsInRangeResponse } from '@/entities/releases/release'
import type { BuildSelection, SelectedEngine } from '@/entities/patches/patch'

interface BuildPickerSectionProps {
  data: BuildsInRangeResponse
  value: BuildSelection
  onChange: (next: BuildSelection) => void
  disabled?: boolean
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

export function BuildPickerSection({
  data,
  value,
  onChange,
  disabled,
}: BuildPickerSectionProps) {
  const setWeb = (buildVersionId: number | null) => {
    onChange({ ...value, web: buildVersionId == null ? null : { buildVersionId } })
  }

  const setEngine = (engineName: string, buildVersionId: number | null) => {
    const others = value.engines.filter((e) => e.engineName !== engineName)
    onChange({
      ...value,
      engines:
        buildVersionId == null ? others : [...others, { engineName, buildVersionId }],
    })
  }

  const selectAllLatest = () => {
    onChange(computeAutoPreselect(data))
  }

  const clearAll = () => onChange({ ...value, web: null, engines: [] })

  const hasBuilds = data.web.length > 0 || data.engines.length > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {!hasBuilds ? '이 범위에 빌드가 없습니다' : '빌드 파일을 선택하세요'}
        </span>
        {hasBuilds && (
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={selectAllLatest}
              disabled={disabled}
            >
              모두 최신
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={clearAll}
              disabled={disabled}
            >
              모두 해제
            </Button>
          </div>
        )}
      </div>

      {data.web.length > 0 && (
        <section>
          <h4 className="mb-2 text-sm font-semibold">WEB</h4>
          <ul className="flex flex-col gap-2">
            <BuildPickerRow
              label="WEB"
              candidates={data.web}
              selectedBuildId={value.web?.buildVersionId ?? null}
              onChange={(bv) => setWeb(bv)}
              disabled={disabled}
            />
          </ul>
        </section>
      )}

      {data.engines.length > 0 && (
        <section>
          <h4 className="mb-2 text-sm font-semibold">ENGINE</h4>
          <ul className="flex flex-col gap-2">
            {data.engines.map((g) => (
              <BuildPickerRow
                key={g.engineName}
                label={g.engineName}
                candidates={g.candidates}
                selectedBuildId={
                  value.engines.find((e) => e.engineName === g.engineName)
                    ?.buildVersionId ?? null
                }
                onChange={(bv) => setEngine(g.engineName, bv)}
                disabled={disabled}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

interface BuildPickerRowProps {
  label: string
  candidates: BuildCandidate[]
  selectedBuildId: number | null
  onChange: (buildVersionId: number | null) => void
  disabled?: boolean
}

/**
 * 빌드 picker 의 한 행 — WEB 1개 또는 각 ENGINE 1개에 동일 형태로 사용.
 * dropdown trigger 안에 현재 선택값(또는 '포함 안 함') 표시,
 * dropdown menu 에 후보 목록 + 마지막에 '포함 안 함' 옵션.
 */
function BuildPickerRow({
  label,
  candidates,
  selectedBuildId,
  onChange,
  disabled,
}: BuildPickerRowProps) {
  const selected: BuildCandidate | undefined =
    selectedBuildId == null
      ? undefined
      : candidates.find((c) => c.buildVersionId === selectedBuildId)

  return (
    <li className="grid grid-cols-[160px_1fr] items-center gap-2">
      <Label className="text-sm">{label}</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="sm" disabled={disabled}>
            {selected ? (
              <>
                {selected.fullVersion}
                {selected.isLatest && (
                  <span className="ml-1 rounded bg-primary/20 px-1 text-xs text-primary">
                    최신
                  </span>
                )}
              </>
            ) : (
              '포함 안 함'
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {candidates.map((c) => (
            <DropdownMenuItem
              key={c.buildVersionId}
              onSelect={() => onChange(c.buildVersionId)}
            >
              {c.fullVersion}
              {c.isLatest && (
                <span className="ml-1 rounded bg-primary/20 px-1 text-xs text-primary">
                  최신
                </span>
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => onChange(null)}>포함 안 함</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}
