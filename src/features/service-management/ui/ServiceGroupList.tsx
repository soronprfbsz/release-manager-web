/**
 * Service Group List Component
 * 서비스 타입별 그룹 목록 컴포넌트
 */

import { useMemo } from 'react'
import { Server } from 'lucide-react'

import type { Service } from '@/entities/service'
import { useReorderServices } from '@/entities/service'
import { useCodesByType, CODE_TYPE } from '@/entities/code'
import { SortableList } from '@/shared/ui/sortable'

import { getServiceTypeIcon } from '../lib/serviceHelpers'
import { SortableServiceCard } from './SortableServiceCard'

interface ServiceGroupListProps {
  services: Service[]
  onEdit: (service: Service) => void
  onDelete: (service: Service) => void
  onManageComponents: (service: Service) => void
}

export function ServiceGroupList({
  services,
  onEdit,
  onDelete,
  onManageComponents,
}: ServiceGroupListProps) {
  const reorderMutation = useReorderServices()
  const { data: serviceTypes = [] } = useCodesByType(CODE_TYPE.SERVICE_TYPE)

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

  // sortOrder로 정렬된 서비스 타입 목록
  const sortedServiceTypes = useMemo(() => {
    return [...serviceTypes]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .filter((type) => groupedServices[type.value]) // 실제 서비스가 있는 타입만
  }, [serviceTypes, groupedServices])

  // 각 그룹별로 독립적인 handleReorder 생성
  const createHandleReorder = (serviceType: string) => (reorderedServices: Service[]) => {
    // 재정렬된 서비스들의 ID 목록
    const serviceIds = reorderedServices.map((s) => s.serviceId)

    // serviceType과 함께 전달
    reorderMutation.mutate({ serviceType, serviceIds })
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
      {sortedServiceTypes.map((serviceType) => {
        const serviceList = groupedServices[serviceType.value]
        const Icon = getServiceTypeIcon(serviceType.value as Service['serviceType'])

        return (
          <div
            key={serviceType.value}
            className="space-y-4 py-8 first:pt-0 last:pb-0 border-t first:border-t-0"
          >
            {/* Group Header */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--header-bg))] border border-border">
                <Icon className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-base">{serviceType.name}</h3>
                <p className="text-xs text-muted-foreground">{serviceList.length}개의 서비스</p>
              </div>
            </div>

            {/* Card Grid with Sortable */}
            <SortableList
              items={serviceList}
              onReorder={createHandleReorder(serviceType.value)}
              keyExtractor={(service) => service.serviceId}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              strategy="grid"
              renderItem={(service) => (
                <SortableServiceCard
                  service={service}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onManageComponents={onManageComponents}
                  categoryIndex={0}
                />
              )}
            />
          </div>
        )
      })}
    </div>
  )
}
