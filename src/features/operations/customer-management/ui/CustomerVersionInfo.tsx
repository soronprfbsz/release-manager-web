/**
 * Customer Version Info — 고객사 현재 버전 / 빌드 버전 요약 (속성 메타 박스)
 *
 * <p>InfraEye `info version` 명령 출력과 유사한 한 줄 요약 형태로,
 * 고객사 상세 패널 최상단에 위치해 "사이트의 현재 버전" 을 한눈에 보여준다.
 *
 * <p>데이터는 완료된 PatchHistory 누적에서 추출:
 *  - Version       : 가장 최근 완료 패치 toVersion 의 base (major.minor.patch)
 *  - Build Version : 동일 base 위에 적용된 빌드 fullVersion 들 (최신순)
 */

import { usePatchHistories } from '@/entities/patches/patch'
import type { Customer } from '@/entities/operations/customer'

interface CustomerVersionInfoProps {
  customer: Customer
}

const HISTORY_FETCH_SIZE = 100

export function CustomerVersionInfo({ customer }: CustomerVersionInfoProps) {
  const projectId = customer.project?.projectId ?? ''
  const enabled = !!projectId && !!customer.customerId

  const { data, isLoading } = usePatchHistories(
    {
      page: 0,
      size: HISTORY_FETCH_SIZE,
      projectId,
      customerId: customer.customerId,
      sort: 'completedAt,desc',
    },
    { enabled }
  )

  const histories = data?.content ?? []

  // 패치 미적용 / 로딩 / 비활성 케이스 → "패치 미적용" 표시 (한 줄)
  if (!enabled || isLoading || histories.length === 0) {
    return (
      <VersionInfoBox>
        <Row label="Version" value={isLoading ? '확인 중...' : '패치 미적용'} mono={false} />
      </VersionInfoBox>
    )
  }

  // 가장 최근 완료된 패치의 base 버전을 현재 버전으로 표기
  const latest = histories[0]
  const currentBase = getBaseVersion(latest.toVersion)

  // 동일 base 에 적용된 빌드 버전들만 모음 (최신 → 과거)
  const buildVersions = histories
    .filter((h) => isBuildVersion(h.toVersion))
    .filter((h) => getBaseVersion(h.toVersion) === currentBase)
    .map((h) => h.toVersion)

  return (
    <VersionInfoBox>
      <Row label="Version" value={currentBase ?? '-'} />
      <Row
        label="Build Version"
        value={buildVersions.length > 0 ? buildVersions.join(', ') : '없음'}
      />
    </VersionInfoBox>
  )
}

/* ----------------------------- 내부 컴포넌트 ----------------------------- */

function VersionInfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 px-4 py-3">
      <dl className="grid grid-cols-[120px_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-sm">
        {children}
      </dl>
    </div>
  )
}

function Row({
  label,
  value,
  mono = true,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? 'font-mono text-foreground break-all' : 'text-foreground'}>
        {value}
      </dd>
    </>
  )
}

/* --------------------------------- 유틸 --------------------------------- */

/** "1.1.0.260511-1" → "1.1.0", "1.1.0" → "1.1.0" */
function getBaseVersion(v: string | null | undefined): string | null {
  if (!v) return null
  const m = v.match(/^(\d+\.\d+\.\d+)/)
  return m?.[1] ?? v
}

/** "1.1.0.260511-1" 같은 4번째 segment(빌드) 가 있으면 true */
function isBuildVersion(v: string | null | undefined): boolean {
  if (!v) return false
  return /^\d+\.\d+\.\d+\.\d+/.test(v)
}
