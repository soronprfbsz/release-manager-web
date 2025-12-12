/**
 * Service Group List Component
 * 서비스 타입별 그룹 목록 컴포넌트
 */

import { Server } from 'lucide-react'

import type { Service } from '@/entities/service'
import { useReorderServices } from '@/entities/service'
import { SortableList } from '@/shared/ui/sortable'

import { getServiceTypeIcon } from '../lib/serviceHelpers'
import { SortableServiceCard } from './SortableServiceCard'

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
  const reorderMutation = useReorderServices()

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

  // 각 그룹별로 독립적인 handleReorder 생성
  const createHandleReorder = (serviceType: string) => (reorderedServices: Service[]) => {
    // 전체 목록에서의 원래 순서를 유지하면서 해당 타입만 재정렬
    const allServices = [...services]
    const firstIndexOfType = allServices.findIndex((s) => (s.serviceType || 'etc') === serviceType)

    // 해당 타입의 서비스들을 재정렬된 순서로 교체
    reorderedServices.forEach((service, index) => {
      const targetIndex = firstIndexOfType + index
      allServices[targetIndex] = service
    })

    const serviceIds = allServices.map((s) => s.serviceId)
    reorderMutation.mutate(serviceIds)
  }

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

            {/* Card Grid with Sortable */}
            <SortableList
              items={serviceList}
              onReorder={createHandleReorder(type)}
              keyExtractor={(service) => service.serviceId}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              strategy="grid"
              renderItem={(service) => (
                <SortableServiceCard
                  service={service}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onManageComponents={onManageComponents}
                />
              )}
            />
          </div>
        )
      })}
    </div>
  )
}
