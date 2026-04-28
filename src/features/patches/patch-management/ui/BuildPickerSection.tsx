/**
 * BuildPickerSection Component
 * 빌드 파일 picker 섹션 — WEB radio + ENGINE 행 + 일괄 액션
 */

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Label } from '@/shared/ui/label'

import type {
  BuildCandidate,
  BuildsInRangeResponse,
  EngineGroup,
} from '@/entities/releases/release/model/types'
import type { BuildSelection, SelectedEngine } from '@/entities/patches/patch/model/types'

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
  const engines: SelectedEngine[] = data.engines.map((g) => ({
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
          <div className="flex flex-wrap gap-2">
            {data.web.map((c) => (
              <button
                key={c.buildVersionId}
                type="button"
                onClick={() =>
                  setWeb(
                    value.web?.buildVersionId === c.buildVersionId ? null : c.buildVersionId
                  )
                }
                disabled={disabled}
                className={cn(
                  'flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm transition-colors',
                  value.web?.buildVersionId === c.buildVersionId
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-input bg-background text-foreground hover:bg-accent',
                  disabled && 'cursor-not-allowed opacity-50'
                )}
              >
                {c.fullVersion}
                {c.isLatest && (
                  <span className="ml-1 rounded bg-primary/20 px-1 text-xs text-primary">
                    최신
                  </span>
                )}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setWeb(null)}
              disabled={disabled}
              className={cn(
                'flex items-center rounded-md border px-3 py-1.5 text-sm transition-colors',
                value.web == null
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input bg-background text-muted-foreground hover:bg-accent',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              포함 안 함
            </button>
          </div>
        </section>
      )}

      {data.engines.length > 0 && (
        <section>
          <h4 className="mb-2 text-sm font-semibold">ENGINE</h4>
          <ul className="flex flex-col gap-2">
            {data.engines.map((g) => (
              <EngineRow
                key={g.engineName}
                group={g}
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

interface EngineRowProps {
  group: EngineGroup
  selectedBuildId: number | null
  onChange: (buildVersionId: number | null) => void
  disabled?: boolean
}

function EngineRow({ group, selectedBuildId, onChange, disabled }: EngineRowProps) {
  const selected: BuildCandidate | undefined =
    selectedBuildId == null
      ? undefined
      : group.candidates.find((c) => c.buildVersionId === selectedBuildId)

  return (
    <li className="grid grid-cols-[160px_1fr] items-center gap-2">
      <Label className="text-sm">{group.engineName}</Label>
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
          {group.candidates.map((c) => (
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
