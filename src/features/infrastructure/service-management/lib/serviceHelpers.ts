/**
 * Service Management Helpers
 * 서비스 관리 헬퍼 함수
 */

import { Server, Globe, Database, Cog, Package, Box, type LucideIcon } from 'lucide-react'
import type { ServiceType, ComponentType, ServiceComponent } from '@/entities/infrastructure/service'
import {
  getCategoryCardColorClass,
  getCategoryIconBgColorClass,
  getCategoryIconColorClass,
} from '@/shared/lib/category-colors'

/**
 * 서비스 타입 아이콘 반환
 */
export function getServiceTypeIcon(type: ServiceType): LucideIcon {
  switch (type) {
    case 'infraeye1':
    case 'infraeye2':
      return Server
    case 'infra':
      return Database
    default:
      return Box
  }
}

/**
 * 서비스 타입 인덱스 매핑
 */
const SERVICE_TYPE_INDEX_MAP: Record<string, number> = {
  infraeye1: 0,
  infraeye2: 1,
  infra: 2,
}

/**
 * 서비스 타입 인덱스 계산
 */
function getServiceTypeIndex(type: ServiceType): number {
  if (type in SERVICE_TYPE_INDEX_MAP) {
    return SERVICE_TYPE_INDEX_MAP[type]
  }
  // 없으면 문자열 해시로 인덱스 생성
  let hash = 0
  for (let i = 0; i < type.length; i++) {
    hash = ((hash << 5) - hash) + type.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash) % 5
}

/**
 * 서비스 타입 컬러 클래스 반환
 * 공통 chart 색상 변수 활용 (테마마다 자동으로 다른 색상 적용)
 */
export function getServiceTypeColor(type: ServiceType): string {
  const index = getServiceTypeIndex(type)
  return getCategoryCardColorClass(index)
}

/**
 * 서비스 타입 아이콘 배경 색상 클래스 반환
 */
export function getServiceTypeIconBgClass(type: ServiceType): string {
  const index = getServiceTypeIndex(type)
  return getCategoryIconBgColorClass(index)
}

/**
 * 서비스 타입 아이콘 색상 클래스 반환
 */
export function getServiceTypeIconColorClass(type: ServiceType): string {
  const index = getServiceTypeIndex(type)
  return getCategoryIconColorClass(index)
}

/**
 * 컴포넌트 타입 아이콘 반환
 */
export function getComponentTypeIcon(type: ComponentType): LucideIcon {
  switch (type) {
    case 'WEB':
      return Globe
    case 'DATABASE':
      return Database
    case 'ENGINE':
      return Cog
    default:
      return Package
  }
}

/**
 * 컴포넌트 타입 폰트 색상 클래스 반환
 * 서비스 카드 내 컴포넌트 목록에서 사용
 * 다른 탭(링크, 파일, 퍼블리싱)과 동일하게 primary 색상 사용
 */
export function getComponentTypeTextColor(_type: ComponentType): string {
  return 'text-primary'
}

/**
 * 컴포넌트 타입 배경 색상 클래스 반환
 * 컴포넌트 관리 Sheet에서 사용
 */
export function getComponentTypeBackgroundColor(type: ComponentType): string {
  switch (type) {
    case 'WEB':
      return 'bg-[hsl(var(--chart-1)/0.1)] border-[hsl(var(--chart-1)/0.3)]'
    case 'DATABASE':
      return 'bg-[hsl(var(--chart-2)/0.1)] border-[hsl(var(--chart-2)/0.3)]'
    case 'ENGINE':
      return 'bg-[hsl(var(--chart-3)/0.1)] border-[hsl(var(--chart-3)/0.3)]'
    default:
      return 'bg-muted/30 border-border'
  }
}

/**
 * 컴포넌트 접속 정보 표시 문자열 반환
 */
export function getComponentDisplayInfo(component: ServiceComponent): string {
  // URL 우선 표시
  if (component.url) {
    return component.url
  }

  // Host:Port 표시
  if (component.host && component.port) {
    return `${component.host}:${component.port}`
  }

  // 설명 또는 기본값
  return component.description || '-'
}
