/**
 * Link Card
 * 링크 카드 컴포넌트 (ServiceCard 패턴 적용 — 아이콘 박스 버전)
 */

import { ExternalLink, GripVertical, Pencil, Trash2 } from 'lucide-react'

import type { LinkResource } from '@/entities/infrastructure/link'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'

import { getLinkIcon } from '../lib/linkHelpers'

interface LinkCardProps {
  resource: LinkResource
  onDelete: (resource: LinkResource) => void
  onEdit?: (resource: LinkResource) => void
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
}

export function LinkCard({
  resource,
  onDelete,
  onEdit,
  dragHandleProps,
}: LinkCardProps) {
  const icon = getLinkIcon(resource.subCategory)

  return (
    <div className="group relative h-full">
      {/* 드래그 핸들 */}
      {dragHandleProps && (
        <button
          type="button"
          className={cn(
            'absolute -left-4 -top-2 z-10',
            'flex items-center justify-center w-5 h-16',
            'cursor-grab active:cursor-grabbing',
            'text-muted-foreground hover:text-foreground',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-150'
          )}
          aria-label="카드 이동"
          {...dragHandleProps}
        >
          <GripVertical className="h-5 w-5" />
        </button>
      )}

      <Card
        className={cn(
          'overflow-hidden transition-all duration-200',
          'h-full flex flex-col',
          'bg-card border hover:border-foreground/20'
        )}
      >
        <CardHeader className="pb-3 pt-4 px-4">
          {/* 상단 행: 아이콘 박스 + 링크명 + 호버 액션 */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* 아이콘 박스 — 글리프와 동일한 크기/스타일 */}
              <div
                className={cn(
                  'flex-shrink-0 h-10 w-10 rounded-md flex items-center justify-center',
                  'bg-muted'
                )}
              >
                {icon}
              </div>

              {/* 링크명 + 설명 */}
              <div className="flex-1 min-w-0 pt-0.5">
                <h3 className="font-semibold text-base leading-tight truncate">
                  {resource.linkName}
                </h3>
                {resource.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {resource.description}
                  </p>
                )}
              </div>
            </div>

            {/* 우상단 액션 버튼 — 호버 시만 표시 */}
            <div
              className={cn(
                'flex items-center gap-0.5 flex-shrink-0',
                'opacity-0 group-hover:opacity-100 transition-opacity duration-150'
              )}
            >
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(resource)}
                  className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(resource)}
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* 점선 구분선 */}
        <div className="mx-4 border-t border-dashed border-border" />

        <CardContent className="pt-3 px-4 pb-4 flex-1 min-h-[100px] flex flex-col justify-between">
          {/* URL 표시 */}
          <div className="flex-1">
            <p className="text-xs font-mono text-muted-foreground truncate">
              {resource.linkUrl}
            </p>
          </div>

          {/* 열기 버튼 */}
          <div className="mt-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(resource.linkUrl, '_blank', 'noopener,noreferrer')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              열기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
