/**
 * Service Group List Component
 * 서비스 타입별 그룹 목록 컴포넌트
 */

import { useMemo, useState } from 'react'
import { Server, ChevronDown, ChevronRight } from 'lucide-react'

import type { Service } from '@/entities/infrastructure/service'
import { useReorderServices } from '@/entities/infrastructure/service'
import { useCodesByType, CODE_TYPE } from '@/entities/_shared/code'
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
  // 카테고리별 펼침/접힘 상태 (기본: 모두 펼침)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [isInitialized, setIsInitialized] = useState(false)

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

  // 초기 로드 시 모든 카테고리 펼침
  if (!isInitialized && sortedServiceTypes.length > 0) {
    setExpandedCategories(new Set(sortedServiceTypes.map(t => t.value)))
    setIsInitialized(true)
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

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
            {/* Group Header with Toggle */}
            <button
              onClick={() => toggleCategory(serviceType.value)}
              className="flex items-center gap-3 w-full text-left group"
            >
              <div className="p-2 rounded-lg bg-[hsl(var(--header-bg))] border border-border">
                <Icon className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base">{serviceType.name}</h3>
                <p className="text-xs text-muted-foreground">{serviceList.length}개의 서비스</p>
              </div>
              <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                {expandedCategories.has(serviceType.value) ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </div>
            </button>

            {/* Card Grid with Sortable - Collapsible */}
            {expandedCategories.has(serviceType.value) && (
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
                  />
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
