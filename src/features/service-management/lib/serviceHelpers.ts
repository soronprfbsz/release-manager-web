/**
 * Service Management Helpers
 * 서비스 관리 헬퍼 함수
 */

import { Server, Globe, Database, Cog, Package, Box, type LucideIcon } from 'lucide-react'
import type { ServiceType, ComponentType, ServiceComponent } from '@/entities/service'

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
 * 서비스 타입 컬러 클래스 반환
 * 테마별 chart 색상 변수 활용 (테마마다 자동으로 다른 색상 적용)
 * infraeye1 → chart-1, infraeye2 → chart-2, infra → chart-3
 */
export function getServiceTypeColor(type: ServiceType): string {
  switch (type) {
    case 'infraeye1':
      return 'border-[hsl(var(--chart-1)/0.3)] bg-[hsl(var(--chart-1)/0.1)] text-[hsl(var(--chart-1))] hover:border-[hsl(var(--chart-1)/0.5)]'
    case 'infraeye2':
      return 'border-[hsl(var(--chart-2)/0.3)] bg-[hsl(var(--chart-2)/0.1)] text-[hsl(var(--chart-2))] hover:border-[hsl(var(--chart-2)/0.5)]'
    case 'infra':
      return 'border-[hsl(var(--chart-3)/0.3)] bg-[hsl(var(--chart-3)/0.1)] text-[hsl(var(--chart-3))] hover:border-[hsl(var(--chart-3)/0.5)]'
    default:
      return 'border-border bg-muted/50 text-muted-foreground hover:border-border'
  }
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

/**
 * 비밀번호 마스킹
 */
export function maskPassword(password: string | null | undefined): string {
  if (!password) return '-'
  return '••••••••'
}
