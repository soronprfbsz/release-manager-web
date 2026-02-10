/**
 * Component List Preview
 * 서비스 카드 내 컴포넌트 미리보기
 */

import { ExternalLink, Terminal } from 'lucide-react'

import type { ServiceComponent } from '@/entities/infrastructure/service'

import { Badge } from '@/shared/ui/badge'

import { getComponentTypeIcon, getComponentDisplayInfo, getComponentTypeTextColor } from '../lib/serviceHelpers'

interface ComponentListProps {
  components: ServiceComponent[]
  maxDisplay?: number
}

export function ComponentList({ components, maxDisplay = 3 }: ComponentListProps) {
  const displayComponents = components.slice(0, maxDisplay)
  const remainingCount = components.length - maxDisplay

  if (components.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic">
        등록된 컴포넌트가 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {displayComponents.map((component) => {
        const Icon = getComponentTypeIcon(component.componentType)
        const displayInfo = getComponentDisplayInfo(component)
        const textColor = getComponentTypeTextColor(component.componentType)
        const hasUrl = !!component.url
        const hasSsh = !!(component.sshPort && component.host)

        return (
          <div key={component.componentId} className="flex items-start gap-2 text-sm">
            <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${textColor}`} />
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                {hasUrl ? (
                  <a
                    href={component.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`font-medium truncate flex items-center gap-1 hover:underline ${textColor}`}
                  >
                    {component.componentName}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                ) : (
                  <div className={`font-medium truncate ${textColor}`}>{component.componentName}</div>
                )}
                {hasSsh && (
                  <Badge variant="secondary" className="h-5 text-xs flex items-center gap-1 flex-shrink-0">
                    <Terminal className="h-3 w-3" />
                    SSH
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground truncate">{displayInfo}</div>
            </div>
          </div>
        )
      })}

      {remainingCount > 0 && (
        <div className="text-xs text-muted-foreground font-medium">
          +{remainingCount}개 더보기
        </div>
      )}
    </div>
  )
}
