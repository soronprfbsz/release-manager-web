/**
 * Customer Version Info — 고객사 현재 버전 / 빌드 버전 요약 (속성 메타 박스)
 *
 * <p>customer_site_version 테이블에서 컴포넌트별 최신 버전을 직접 조회해 표시.
 *  - BASE   → "VERSION" 행 (크게)
 *  - WEB    → "BUILD · WEB" 행 (모노 풀버전)
 *  - ENGINE → "BUILD · ENGINE" 행 (없으면 생략)
 *  - 응답 빈 배열 → "패치 미적용" fallback
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
        <AttributeRow label="VERSION" value="확인 중..." dim />
      </VersionInfoBox>
    )
  }

  // 패치 완료 이력 없음 (빈 배열)
  if (!projectId || siteVersions.length === 0) {
    return (
      <VersionInfoBox>
        <AttributeRow label="VERSION" value="패치 미적용" dim />
      </VersionInfoBox>
    )
  }

  // component 별로 인덱싱 (BE 는 BASE → ENGINE → WEB 알파벳 순 반환)
  const byComponent = Object.fromEntries(
    siteVersions.map((sv) => [sv.component, sv.currentVersion])
  )

  return (
    <VersionInfoBox>
      {/* BASE 컴포넌트: 기본 버전 (크게) */}
      {byComponent.BASE && (
        <AttributeRow label="VERSION" value={byComponent.BASE} large />
      )}

      {/* WEB 빌드 버전 */}
      {byComponent.WEB && (
        <AttributeRow label="BUILD · WEB" value={byComponent.WEB} />
      )}

      {/* ENGINE 빌드 버전 */}
      {byComponent.ENGINE && (
        <AttributeRow label="BUILD · ENGINE" value={byComponent.ENGINE} />
      )}
    </VersionInfoBox>
  )
}

/* ----------------------------- 내부 컴포넌트 ----------------------------- */

function VersionInfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      {children}
    </div>
  )
}

function AttributeRow({
  label,
  value,
  large = false,
  dim = false,
}: {
  label: string
  value: string
  large?: boolean
  dim?: boolean
}) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-[10px] font-medium tracking-widest text-muted-foreground/70 uppercase flex-shrink-0 w-28">
        {label}
      </span>
      <span
        className={
          dim
            ? 'text-muted-foreground text-sm'
            : large
              ? 'font-mono text-xl font-semibold text-foreground'
              : 'font-mono text-sm text-foreground'
        }
      >
        {value}
      </span>
    </div>
  )
}
