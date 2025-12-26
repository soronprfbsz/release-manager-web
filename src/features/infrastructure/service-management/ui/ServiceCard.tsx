/**
 * Service Card
 * 서비스 카드 컴포넌트
 */

import { Pencil, Trash2, Settings, GripVertical } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import type { Service } from '@/entities/infrastructure/service'
import { ComponentList } from './ComponentList'

interface ServiceCardProps {
  service: Service
  onEdit: (service: Service) => void
  onDelete: (service: Service) => void
  onManageComponents: (service: Service) => void
  dragHandleProps?: any
  categoryIndex?: number // 순서 기반 카테고리 인덱스
}

export function ServiceCard({
  service,
  onEdit,
  onDelete,
  onManageComponents,
  dragHandleProps,
}: Omit<ServiceCardProps, 'categoryIndex'>) {

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md bg-[hsl(var(--header-bg))] border-border hover:border-primary/50 relative ${!service.isActive ? 'bg-muted/30' : ''
        }`}
    >
      {!service.isActive && (
        <div className="absolute inset-0 bg-muted/50 rounded-lg pointer-events-none" />
      )}

      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* 드래그 핸들 */}
            {dragHandleProps && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-grab active:cursor-grabbing flex-shrink-0"
                {...dragHandleProps}
              >
                <GripVertical className="h-4 w-4" />
              </Button>
            )}

            {/* 서비스명 */}
            <h3 className="font-semibold text-lg truncate flex-1 min-w-0">{service.serviceName}</h3>
          </div>

          {/* 액션 버튼 - 우측 상단 */}
          <div className="flex gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(service)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onManageComponents(service)}
              className="h-8 w-8"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(service)}
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {service.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {service.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="relative z-10 min-h-[140px]">
        {/* 컴포넌트 미리보기 */}
        <ComponentList components={service.components} maxDisplay={2} />
      </CardContent>
    </Card>
  )
}
