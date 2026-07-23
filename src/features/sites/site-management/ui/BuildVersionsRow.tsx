/**
 * Build Versions Row — 사이트 헤더의 BUILD VERSION 통합 라인
 *
 * <p>헤더는 VERSION / BUILD VERSION 두 행으로 단순화. WEB 1개 + ENGINE N개 빌드를
 *  하나의 요약 칩(예: "WEB + 엔진 N개 →") 으로 표시하고, 클릭 시 우측 Sheet 가
 *  열려 WEB(최상단 고정) + ENGINE 별 빌드 버전 목록을 보여준다.
 *
 * <p>요청사항 (사용자) — Sheet 안에는 검색 / 전체 복사 / 상세 화살표 / 표시 방식 토글
 *  같은 부가 기능 없이 컴포넌트 라벨 + 풀버전 만 표시한다. WEB 은 항상 최상단.
 */

import { useMemo, useState } from 'react'

import { ArrowRight } from 'lucide-react'

import type { SiteVersionResponse } from '@/entities/sites/site-version'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'

interface BuildVersionsRowProps {
  /** 사이트명 (Sheet 상단 안내용) */
  siteName: string
  /** WEB 빌드 풀버전 (없으면 null) */
  webVersion: string | null
  /** 엔진별 site_version row 목록 (component=ENGINE) */
  engines: SiteVersionResponse[]
  /** 라벨 컬럼 폭 (헤더 메타 행의 라벨 정렬용). 기본 w-28 */
  labelWidthClass?: string
}

export function BuildVersionsRow({
  siteName,
  webVersion,
  engines,
  labelWidthClass = 'w-28',
}: BuildVersionsRowProps) {
  const [open, setOpen] = useState(false)

  const sortedEngines = useMemo(
    () =>
      [...engines].sort((a, b) =>
        (a.engineName ?? '').localeCompare(b.engineName ?? '')
      ),
    [engines]
  )

  // WEB(있으면) + ENGINE 총합 — 빌드 항목 수
  const totalCount = (webVersion ? 1 : 0) + engines.length

  // 칩 텍스트 — WEB 유무에 따라 분기, ENGINE 0개여도 WEB 만 표시 가능
  const chipText =
    webVersion && engines.length > 0
      ? (
        <>
          WEB + <strong>엔진 {engines.length}개</strong>
        </>
      )
      : webVersion
        ? <>WEB 1개</>
        : <><strong>엔진 {engines.length}개</strong></>

  if (totalCount === 0) {
    return null
  }

  return (
    <>
      <div className="flex items-baseline gap-3">
        <span
          className={`text-[10px] font-medium tracking-widest text-muted-foreground/70 uppercase flex-shrink-0 ${labelWidthClass}`}
        >
          BUILD VERSION
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="h-7 px-2.5 text-xs font-normal gap-1.5"
        >
          <span>{chipText}</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
        </Button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[420px] sm:max-w-[420px]">
          <SheetHeader>
            <SheetTitle>빌드 버전</SheetTitle>
            <SheetDescription>
              {siteName} · 빌드 {totalCount}개
            </SheetDescription>
          </SheetHeader>
          <div
            className="mt-6 overflow-y-auto pr-1"
            style={{ maxHeight: 'calc(100vh - 140px)' }}
          >
            <ul className="space-y-0">
              {/* WEB — 항상 최상단 고정 */}
              {webVersion && (
                <li className="flex items-center gap-3 py-2.5 px-1 border-b">
                  <Badge
                    variant="web"
                    className="text-[10px] px-1.5 py-0 h-4 leading-none flex-shrink-0"
                  >
                    WEB
                  </Badge>
                  <span className="font-mono text-sm text-foreground flex-1 truncate">
                    WEB
                  </span>
                  <span className="font-mono text-sm text-muted-foreground tabular-nums">
                    {webVersion}
                  </span>
                </li>
              )}
              {/* ENGINE — 가나다순 */}
              {sortedEngines.map((row, i) => (
                <li
                  key={`${row.engineName ?? '(legacy)'}-${i}`}
                  className="flex items-center gap-3 py-2.5 px-1 border-b last:border-b-0"
                >
                  <Badge
                    variant="engine"
                    className="text-[10px] px-1.5 py-0 h-4 leading-none flex-shrink-0"
                  >
                    ENGINE
                  </Badge>
                  <span className="font-mono text-sm text-foreground flex-1 truncate">
                    {row.engineName ?? '(미지정)'}
                  </span>
                  <span className="font-mono text-sm text-muted-foreground tabular-nums">
                    {row.currentVersion}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
