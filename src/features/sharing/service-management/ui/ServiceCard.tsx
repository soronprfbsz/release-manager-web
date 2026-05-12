/**
 * Service Card
 * 서비스 카드 컴포넌트 (리뉴얼)
 */

import { GripVertical, Pencil, Settings, Trash2 } from 'lucide-react'

import type { Service } from '@/entities/infrastructure/service'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'

import { resolveGlyph, getGlyphFontSizeClass } from '../lib/glyph'
import { ComponentList } from './ComponentList'

interface ServiceCardProps {
  service: Service
  onEdit: (service: Service) => void
  onDelete: (service: Service) => void
  onManageComponents: (service: Service) => void
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
}

export function ServiceCard({
  service,
  onEdit,
  onDelete,
  onManageComponents,
  dragHandleProps,
}: ServiceCardProps) {
  const { text: glyphText, glyphClass } = resolveGlyph(service)
  const fontSizeClass = getGlyphFontSizeClass(glyphText)

  return (
    <div className="group relative h-full">
      {/* 드래그 핸들 — 카드 좌측 테두리에 딱 붙어 fade in (호버 시) */}
      {dragHandleProps && (
        <button
          type="button"
          className={cn(
            'absolute -left-3 top-1/2 -translate-y-1/2 z-10',
            'flex items-center justify-center w-3 h-6',
            'cursor-grab active:cursor-grabbing',
            'text-muted-foreground/50 hover:text-foreground',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-150'
          )}
          aria-label="카드 이동"
          {...dragHandleProps}
        >
          <GripVertical className="h-4 w-4" />
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
          {/* 상단 행: 글리프 + 서비스명 + 호버 액션 */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* 글리프 배지 */}
              <div
                className={cn(
                  'flex-shrink-0 h-10 w-10 rounded-md flex items-center justify-center',
                  'font-mono font-semibold select-none',
                  fontSizeClass,
                  glyphClass
                )}
              >
                {glyphText}
              </div>

              {/* 서비스명 + 설명 */}
              <div className="flex-1 min-w-0 pt-0.5">
                <h3 className="font-semibold text-base leading-tight truncate">
                  {service.serviceName}
                </h3>
                {service.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {service.description}
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(service)}
                className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onManageComponents(service)}
                className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(service)}
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* 타이틀 ↔ 컴포넌트 영역 구분선 */}
        <CardContent className="border-t pt-4 px-4 pb-4 flex-1 min-h-[100px]">
          <ComponentList components={service.components} maxDisplay={3} />
        </CardContent>
      </Card>
    </div>
  )
}
