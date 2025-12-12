/**
 * Service Card
 * 서비스 카드 컴포넌트
 */

import { Pencil, Trash2, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import type { Service } from '@/entities/service'
import { getServiceTypeColor } from '../lib/serviceHelpers'
import { ComponentList } from './ComponentList'

interface ServiceCardProps {
  service: Service
  onEdit: (service: Service) => void
  onDelete: (service: Service) => void
  onManageComponents: (service: Service) => void
}

export function ServiceCard({
  service,
  onEdit,
  onDelete,
  onManageComponents,
}: ServiceCardProps) {
  const colorClasses = getServiceTypeColor(service.serviceType)

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md hover:border-primary/30 ${colorClasses} relative ${
        !service.isActive ? 'bg-muted/30' : ''
      }`}
    >
      {!service.isActive && (
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,hsl(var(--muted))_10px,hsl(var(--muted))_11px)] rounded-lg pointer-events-none opacity-30" />
      )}
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg truncate flex-1 min-w-0">{service.serviceName}</h3>
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

      <CardContent className="relative z-10">
        {/* 컴포넌트 미리보기 */}
        <ComponentList components={service.components} />
      </CardContent>
    </Card>
  )
}
