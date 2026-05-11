/**
 * Patch File Explorer
 * 패치 상세 정보 + 파일 탐색기 통합 sheet
 *  - 헤더 슬롯에 버전(from→to) / 포함된 빌드 메타박스 표시
 *  - 본문에 공통 FileExplorer (트리 + 뷰어)
 *  - PatchDetailSheet 의 역할을 흡수해 한 곳에서 모두 확인 가능
 */

import { Tag, type LucideIcon } from 'lucide-react'

import { FileExplorer, type FileTreeData, type FileContentData } from '@/widgets/common/file-explorer'

import {
  usePatch,
  usePatchFileStructure,
  usePatchFileContent,
} from '@/entities/patches/patch'

import { TypographyInlineCode, TypographyMuted } from '@/shared/ui/typography'


interface PatchFileExplorerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patchId: number | null
  patchName: string
  /** 패치 타입에 따른 아이콘 (기본값: Tag) */
  icon?: LucideIcon
}

export function PatchFileExplorer({ open, onOpenChange, patchId, patchName, icon = Tag }: PatchFileExplorerProps) {
  const { data: fileStructure, isLoading, error } = usePatchFileStructure(
    patchId ?? 0,
    open && patchId !== null
  )

  // 패치 메타데이터 (버전 / 포함된 빌드) — 헤더 슬롯에 표시
  const { data: patch } = usePatch(patchId ?? 0, {
    enabled: open && patchId !== null,
  })

  // useFileContent 훅을 래핑하여 공통 인터페이스로 변환
  const useFileContent = (filePath: string, enabled: boolean) => {
    const result = usePatchFileContent(filePath, enabled)
    return {
      data: result.data as FileContentData | undefined,
      isLoading: result.isLoading,
      error: result.error as Error | null,
    }
  }

  return (
    <FileExplorer
      open={open}
      onOpenChange={onOpenChange}
      title={patchName}
      icon={icon}
      description="패치의 상세 정보와 파일 구조를 확인합니다."
      fileTree={fileStructure as FileTreeData | undefined}
      isLoading={isLoading}
      error={error as Error | null}
      useFileContent={useFileContent}
      headerSlot={patch ? <PatchMetaBox patch={patch} /> : null}
    />
  )
}

/* ----------------------------- 헤더 메타박스 ----------------------------- */

interface PatchMetaBoxProps {
  patch: NonNullable<ReturnType<typeof usePatch>['data']>
}

function PatchMetaBox({ patch }: PatchMetaBoxProps) {
  const hasBuilds = patch.isBuildIncluded && patch.includedBuilds && (
    patch.includedBuilds.web || (patch.includedBuilds.engines?.length ?? 0) > 0
  )

  return (
    <div className="rounded-md border border-border bg-muted/30 px-4 py-3 space-y-2.5 text-sm">
      {/* 버전 — 라벨 옆 한 줄 */}
      <div className="grid grid-cols-[100px_minmax(0,1fr)] items-center gap-x-3">
        <span className="text-muted-foreground">버전</span>
        <span className="flex items-center gap-2">
          <TypographyInlineCode className="bg-transparent text-xs">{patch.fromVersion}</TypographyInlineCode>
          <span className="text-muted-foreground">→</span>
          <TypographyInlineCode className="bg-transparent text-xs font-medium">{patch.toVersion}</TypographyInlineCode>
        </span>
      </div>

      {/* 포함된 빌드 — 라벨 한 줄, 항목들은 다음 줄부터 */}
      {hasBuilds ? (
        <div className="space-y-1">
          <div className="text-muted-foreground">포함된 빌드</div>
          <div className="flex flex-col gap-0.5 pl-3">
            {patch.includedBuilds?.web && (
              <BuildRow label="WEB" fullVersion={patch.includedBuilds.web.fullVersion}
                        deleted={patch.includedBuilds.web.buildVersionId == null} />
            )}
            {patch.includedBuilds?.engines.map((e) => (
              <BuildRow key={e.engineName} label={e.engineName} fullVersion={e.fullVersion}
                        deleted={e.buildVersionId == null} />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-[100px_minmax(0,1fr)] items-center gap-x-3">
          <span className="text-muted-foreground">포함된 빌드</span>
          <TypographyMuted className="text-sm">없음</TypographyMuted>
        </div>
      )}
    </div>
  )
}

function BuildRow({ label, fullVersion, deleted }: { label: string; fullVersion: string; deleted: boolean }) {
  return (
    <div className="grid grid-cols-[100px_minmax(0,1fr)] items-center gap-x-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-xs break-all">
        {fullVersion}
        {deleted && <span className="ml-2 text-xs text-muted-foreground">(삭제됨)</span>}
      </span>
    </div>
  )
}
