/**
 * BuildPickerSection Component
 * 빌드 파일 picker 섹션 — WEB radio + ENGINE 행
 *
 * 정책: 토글 ON 시 PatchCreateForm 이 computeAutoPreselect 로 모든 항목을 범위 내 최신
 * 빌드로 자동 선택해 둔다. 운영자가 dropdown 으로 의도적으로 다른 빌드를 고를 때만
 * OutdatedBuildsWarningDialog 가 트리거된다.
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

  const hasBuilds = data.web.length > 0 || data.engines.length > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {!hasBuilds
            ? '이 범위에 빌드가 없습니다'
            : '범위 내 최신 빌드가 자동 선택됩니다'}
        </span>
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
          <h4 className="mb-1 text-sm font-semibold">ENGINE</h4>
          <p className="mb-2 text-xs text-muted-foreground">
            <span className="mr-1">ⓘ</span>
            <span>
              <span className="font-mono">NC_</span>, <span className="font-mono">OZ_</span>
              {' '}로 시작하는 파일이 엔진 빌드 파일로 인식됩니다. 그 외 동봉된 자산은 자동 포함됩니다.
            </span>
          </p>
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
