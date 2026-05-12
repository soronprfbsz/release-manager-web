/**
 * Component List Preview
 * 서비스 카드 내 컴포넌트 미리보기 — 좌측 아이콘+pill / 우측 URL/주소
 */

import type { ServiceComponent } from '@/entities/infrastructure/service'

import { Badge } from '@/shared/ui/badge'

import {
  getComponentTypeIcon,
  getComponentDisplayInfo,
  getComponentTypeTextColor,
} from '../lib/serviceHelpers'

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

        return (
          <div
            key={component.componentId}
            className="flex items-center gap-2 text-sm min-w-0"
          >
            <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <Badge
              variant={component.componentType.toLowerCase() as 'database' | 'web' | 'engine' | 'etc'}
              className="h-[18px] px-1.5 py-0 text-[10px] font-semibold tracking-wide leading-none"
            >
              {component.componentType}
            </Badge>
            <div className="flex-1" />
            {hasUrl ? (
              <a
                href={component.url!}
                target="_blank"
                rel="noopener noreferrer"
                className={`font-mono text-xs truncate hover:underline ${textColor}`}
              >
                {displayInfo}
              </a>
            ) : (
              <span className={`font-mono text-xs truncate ${textColor}`}>
                {displayInfo}
              </span>
            )}
          </div>
        )
      })}

      {remainingCount > 0 && (
        <div className="text-xs text-muted-foreground font-medium pt-1">
          +{remainingCount}개 더보기
        </div>
      )}
    </div>
  )
}
