/**
 * Service Group List Component
 * 서비스 타입별 그룹 목록 컴포넌트
 */

import { Server } from 'lucide-react'

import type { Service } from '@/entities/service'

import { getServiceTypeIcon } from '../lib/serviceHelpers'
import { ServiceCard } from './ServiceCard'

interface ServiceGroupListProps {
  services: Service[]
  onEdit: (service: Service) => void
  onDelete: (service: Service) => void
  onManageComponents: (service: Service) => void
}

// 서비스 타입별 라벨 매핑
const SERVICE_TYPE_LABELS: Record<string, string> = {
  infraeye1: 'Infraeye 1',
  infraeye2: 'Infraeye 2',
  infra: 'Infra',
}

export function ServiceGroupList({
  services,
  onEdit,
  onDelete,
  onManageComponents,
}: ServiceGroupListProps) {
  // Group services by serviceType
  const groupedServices = services.reduce(
    (acc, service) => {
      const type = service.serviceType || 'etc'
      if (!acc[type]) acc[type] = []
      acc[type].push(service)
      return acc
    },
    {} as Record<string, Service[]>
  )

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Server className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-lg font-semibold">등록된 서비스가 없습니다.</p>
      </div>
    )
  }

  return (
    <div>
      {Object.entries(groupedServices).map(([type, serviceList]) => {
        const Icon = getServiceTypeIcon(type as Service['serviceType'])
        const label = SERVICE_TYPE_LABELS[type] || type.toUpperCase()

        return (
          <div
            key={type}
            className="space-y-4 py-8 first:pt-0 last:pb-0 border-t first:border-t-0"
          >
            {/* Group Header */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-base">{label}</h3>
                <p className="text-xs text-muted-foreground">{serviceList.length}개의 서비스</p>
              </div>
            </div>

            {/* Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {serviceList.map((service) => (
                <ServiceCard
                  key={service.serviceId}
                  service={service}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onManageComponents={onManageComponents}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
