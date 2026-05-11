/**
 * Customer Version Info — 고객사 현재 버전 / 빌드 버전 요약 (속성 메타 박스)
 *
 * <p>customer_site_version 테이블에서 컴포넌트별 최신 버전을 직접 조회해 표시.
 *  - BASE   → "Version" 행
 *  - WEB    → "Build Version (WEB)" 행
 *  - ENGINE → "Build Version (ENGINE)" 행
 *  - 응답 빈 배열 → "Version  패치 미적용" 한 줄 fallback
 */

import { useCustomerSiteVersions } from '@/entities/operations/customer-site-version'
import type { Customer } from '@/entities/operations/customer'

interface CustomerVersionInfoProps {
  customer: Customer
}

export function CustomerVersionInfo({ customer }: CustomerVersionInfoProps) {
  const projectId = customer.project?.projectId

  const { data: siteVersions = [], isLoading } = useCustomerSiteVersions(
    customer.customerId,
    projectId
  )

  // 로딩 중
  if (isLoading) {
    return (
      <VersionInfoBox>
        <Row label="Version" value="확인 중..." mono={false} />
      </VersionInfoBox>
    )
  }

  // 패치 완료 이력 없음 (빈 배열)
  if (!projectId || siteVersions.length === 0) {
    return (
      <VersionInfoBox>
        <Row label="Version" value="패치 미적용" mono={false} />
      </VersionInfoBox>
    )
  }

  // component 별로 인덱싱 (BE 는 BASE → ENGINE → WEB 알파벳 순 반환)
  const byComponent = Object.fromEntries(
    siteVersions.map((sv) => [sv.component, sv.currentVersion])
  )

  return (
    <VersionInfoBox>
      {/* BASE 컴포넌트: 기본 버전 */}
      {byComponent.BASE && (
        <Row label="Version" value={byComponent.BASE} />
      )}

      {/* WEB 빌드 버전 */}
      {byComponent.WEB && (
        <Row label="Build Version (WEB)" value={byComponent.WEB} />
      )}

      {/* ENGINE 빌드 버전 */}
      {byComponent.ENGINE && (
        <Row label="Build Version (ENGINE)" value={byComponent.ENGINE} />
      )}
    </VersionInfoBox>
  )
}

/* ----------------------------- 내부 컴포넌트 ----------------------------- */

function VersionInfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 px-4 py-3">
      <dl className="grid grid-cols-[160px_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-sm">
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
