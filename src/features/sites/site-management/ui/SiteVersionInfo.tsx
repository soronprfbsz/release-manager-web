/**
 * Site Version Info — 사이트 현재 버전 / 빌드 버전 요약 (속성 메타 박스)
 *
 * <p>site_site_version 테이블에서 컴포넌트별 최신 버전을 직접 조회해 표시.
 *  - BASE → "VERSION" 행 (크게)
 *  - WEB + ENGINE → "BUILD VERSION" 통합 칩. 클릭 시 Sheet 에 WEB(최상단 고정) + 엔진별 풀버전 목록.
 *  - 응답 빈 배열 → "패치 미적용" fallback
 */

import type { Site } from '@/entities/sites/site'
import { useSiteVersions } from '@/entities/sites/site-version'

import { BuildVersionsRow } from './BuildVersionsRow'

interface SiteVersionInfoProps {
  site: Site
}

export function SiteVersionInfo({ site }: SiteVersionInfoProps) {
  const projectId = site.project?.projectId

  const { data: siteVersions = [], isLoading } = useSiteVersions(
    site.siteId,
    projectId
  )

  if (isLoading) {
    return (
      <VersionInfoBox>
        <AttributeRow label="VERSION" value="확인 중..." dim />
      </VersionInfoBox>
    )
  }

  if (!projectId || siteVersions.length === 0) {
    return (
      <VersionInfoBox>
        <AttributeRow label="VERSION" value="패치 미적용" dim />
      </VersionInfoBox>
    )
  }

  const baseVersion = siteVersions.find((sv) => sv.component === 'BASE')?.currentVersion
  const webVersion = siteVersions.find((sv) => sv.component === 'WEB')?.currentVersion
  const engineRows = siteVersions.filter((sv) => sv.component === 'ENGINE')

  return (
    <VersionInfoBox>
      {baseVersion && <AttributeRow label="VERSION" value={baseVersion} large />}
      {(webVersion || engineRows.length > 0) && (
        <BuildVersionsRow
          siteName={site.siteName}
          webVersion={webVersion ?? null}
          engines={engineRows}
        />
      )}
    </VersionInfoBox>
  )
}

/* ----------------------------- 내부 컴포넌트 ----------------------------- */

function VersionInfoBox({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>
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
