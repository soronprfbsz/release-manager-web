/**
 * Engine Build Versions Row
 *
 * <p>고객사 헤더의 BUILD · ENGINE 라인. ENGINE 컴포넌트는 엔진별로 N개의
 *  row 가 들어올 수 있어 좁은 헤더 영역에 단일 값으로 표현 불가.
 *  요약 칩 (예: "20개 엔진 빌드 3종 →") 을 클릭하면 Sheet 가 열려
 *  엔진별 빌드 버전 목록을 표시한다.
 *
 * <p>요청사항 (사용자) — Sheet 안에는 검색 / 전체 복사 / 상세 화살표 / 표시 방식 토글
 *  같은 부가 기능 없이 번호 + 엔진명 + 빌드 풀버전 만 표시한다.
 */

import { useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'

import type { SiteVersionResponse } from '@/entities/operations/customer-site-version'
import { Button } from '@/shared/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'

interface EngineBuildVersionsRowProps {
  /** 고객사명 (Sheet 상단 안내용) */
  customerName: string
  /** 엔진별 site_version row 목록 (component=ENGINE) */
  engines: SiteVersionResponse[]
  /** 라벨 컬럼 폭 (헤더 메타 행의 라벨 정렬용). 기본 w-28 */
  labelWidthClass?: string
}

export function EngineBuildVersionsRow({
  customerName,
  engines,
  labelWidthClass = 'w-28',
}: EngineBuildVersionsRowProps) {
  const [open, setOpen] = useState(false)

  const sorted = useMemo(
    () =>
      [...engines].sort((a, b) =>
        (a.engineName ?? '').localeCompare(b.engineName ?? '')
      ),
    [engines]
  )

  const distinctVersions = new Set(engines.map((e) => e.currentVersion)).size

  return (
    <>
      <div className="flex items-baseline gap-3">
        <span
          className={`text-[10px] font-medium tracking-widest text-muted-foreground/70 uppercase flex-shrink-0 ${labelWidthClass}`}
        >
          BUILD · ENGINE
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="h-7 px-2.5 text-xs font-normal gap-1.5"
        >
          <span>
            <strong>{engines.length}</strong>개 엔진
            {distinctVersions > 0 && (
              <>
                {' '}
                <span className="text-muted-foreground">빌드 {distinctVersions}종</span>
              </>
            )}
          </span>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
        </Button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[420px] sm:max-w-[420px]">
          <SheetHeader>
            <SheetTitle>엔진 빌드 버전</SheetTitle>
            <SheetDescription>
              {customerName} · 엔진 {engines.length}개
            </SheetDescription>
          </SheetHeader>
          <div
            className="mt-6 overflow-y-auto pr-1"
            style={{ maxHeight: 'calc(100vh - 140px)' }}
          >
            <ul className="space-y-0">
              {sorted.map((row, i) => (
                <li
                  key={`${row.engineName ?? '(legacy)'}-${i}`}
                  className="flex items-center gap-3 py-2.5 px-1 border-b last:border-b-0"
                >
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
