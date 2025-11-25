import { useState } from 'react'
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileCode, Package } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { MajorMinorNode, VersionNode } from '@/shared/api/types'

interface ReleaseTreeProps {
  majorMinorGroups: MajorMinorNode[]
  selectedVersionId: number | null
  onSelectVersion: (version: VersionNode) => void
}

export function ReleaseTree({ majorMinorGroups, selectedVersionId, onSelectVersion }: ReleaseTreeProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    // 첫 번째 그룹은 기본 펼침
    const initial = new Set<string>()
    if (majorMinorGroups.length > 0) {
      initial.add(majorMinorGroups[0].majorMinor)
    }
    return initial
  })

  const toggleGroup = (majorMinor: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(majorMinor)) {
        next.delete(majorMinor)
      } else {
        next.add(majorMinor)
      }
      return next
    })
  }

  if (majorMinorGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Package className="h-12 w-12 mb-2 opacity-50" />
        <p className="text-sm">릴리즈 버전이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {majorMinorGroups.map((group) => {
        const isExpanded = expandedGroups.has(group.majorMinor)

        return (
          <div key={group.majorMinor}>
            <button
              onClick={() => toggleGroup(group.majorMinor)}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-accent text-left"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 text-yellow-500 shrink-0" />
              ) : (
                <Folder className="h-4 w-4 text-yellow-500 shrink-0" />
              )}
              <span className="font-medium">{group.majorMinor}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                ({group.versions.length})
              </span>
            </button>

            {isExpanded && (
              <div className="ml-4 pl-2 border-l border-border">
                {group.versions.map((version) => (
                  <button
                    key={version.versionId}
                    onClick={() => onSelectVersion(version)}
                    className={cn(
                      'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-left text-sm',
                      'hover:bg-accent',
                      selectedVersionId === version.versionId && 'bg-accent'
                    )}
                  >
                    <FileCode className="h-4 w-4 text-blue-500 shrink-0" />
                    <span>{version.version}</span>
                    {version.isInstall && (
                      <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-1.5 py-0.5 rounded ml-auto">
                        설치본
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
