/**
 * Service Group List Component
 * 서비스 타입별 그룹 목록 컴포넌트
 */

import { useMemo, useState } from 'react'
import { Plus, Server } from 'lucide-react'

import type { Service } from '@/entities/infrastructure/service'
import { useReorderServices } from '@/entities/infrastructure/service'
import { useCodesByType, CODE_TYPE } from '@/entities/_shared/code'
import { Button } from '@/shared/ui/button'
import { CollapsibleSection } from '@/shared/ui/collapsible-section'
import { SortableList } from '@/shared/ui/sortable'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

import { getServiceTypeIcon } from '../lib/serviceHelpers'
import { SortableServiceCard } from './SortableServiceCard'

interface ServiceGroupListProps {
  services: Service[]
  onEdit: (service: Service) => void
  onDelete: (service: Service) => void
  onManageComponents: (service: Service) => void
  /** 서비스 추가 (서비스 타입이 선택된 상태로) */
  onAdd?: (serviceType: string) => void
}

export function ServiceGroupList({
  services,
  onEdit,
  onDelete,
  onManageComponents,
  onAdd,
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
          <CollapsibleSection
            key={serviceType.value}
            icon={Icon}
            title={serviceType.name}
            subtitle={`${serviceList.length}개의 서비스`}
            variant="boxed-icon"
            expanded={expandedCategories.has(serviceType.value)}
            onExpandedChange={(expanded) => {
              setExpandedCategories(prev => {
                const next = new Set(prev)
                if (expanded) {
                  next.add(serviceType.value)
                } else {
                  next.delete(serviceType.value)
                }
                return next
              })
            }}
            actions={
              onAdd && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        onAdd(serviceType.value)
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{serviceType.name} 서비스 추가</p>
                  </TooltipContent>
                </Tooltip>
              )
            }
            className="mb-14 last:mb-0"
          >
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
          </CollapsibleSection>
        )
      })}
    </div>
  )
}
