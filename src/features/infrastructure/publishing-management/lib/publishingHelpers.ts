/**
 * Publishing Helpers
 * 퍼블리싱 관련 유틸리티 함수들
 */

import { createElement } from 'react'
import {
  LayoutDashboard,
  FileText,
  Monitor,
  Component,
  Layout,
  Package,
  Layers,
  Globe,
} from 'lucide-react'

/** 서브카테고리별 아이콘 매핑 */
const SUB_CATEGORY_ICONS: Record<string, any> = {
  DASHBOARD: LayoutDashboard,
  REPORT: FileText,
  MONITORING: Monitor,
  COMPONENT: Component,
  LAYOUT: Layout,
  ETC: Layers,
}

/** 카테고리별 아이콘 매핑 */
const CATEGORY_ICONS: Record<string, any> = {
  INFRAEYE1: Package,
  INFRAEYE2: Layers,
  COMMON: Component,
  ETC: Globe,
}

/**
 * 서브카테고리에 따른 아이콘 반환
 */
export function getSubCategoryIcon(subCategory: string | null) {
  const IconComponent = SUB_CATEGORY_ICONS[subCategory?.toUpperCase() || ''] || Layers
  return createElement(IconComponent, { className: 'h-5 w-5 text-primary' })
}

/**
 * 카테고리(제품) 그룹 아이콘 반환
 */
export function getCategoryIcon(category: string) {
  const IconComponent = CATEGORY_ICONS[category?.toUpperCase()] || Globe
  return createElement(IconComponent, { className: 'h-5 w-5' })
}

/**
 * 카테고리 라벨 반환
 */
export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    INFRAEYE1: 'Infraeye 1',
    INFRAEYE2: 'Infraeye 2',
    COMMON: '공통',
    ETC: '기타',
  }
  return labels[category?.toUpperCase()] || category
}

/**
 * 서브카테고리 라벨 반환
 */
export function getSubCategoryLabel(subCategory: string | null): string {
  if (!subCategory) return '-'
  const labels: Record<string, string> = {
    DASHBOARD: '대시보드',
    REPORT: '보고서',
    MONITORING: '모니터링',
    COMPONENT: '컴포넌트',
    LAYOUT: '레이아웃',
    ETC: '기타',
  }
  return labels[subCategory?.toUpperCase()] || subCategory
}

/**
 * 파일 크기 포맷팅
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 카테고리별 서브카테고리 목록 반환
 */
export function getSubCategoriesByCategory(category: string): { value: string; label: string }[] {
  const subCategories: Record<string, { value: string; label: string }[]> = {
    INFRAEYE1: [
      { value: 'DASHBOARD', label: '대시보드' },
      { value: 'REPORT', label: '보고서' },
      { value: 'ETC', label: '기타' },
    ],
    INFRAEYE2: [
      { value: 'DASHBOARD', label: '대시보드' },
      { value: 'REPORT', label: '보고서' },
      { value: 'MONITORING', label: '모니터링' },
      { value: 'ETC', label: '기타' },
    ],
    COMMON: [
      { value: 'COMPONENT', label: '컴포넌트' },
      { value: 'LAYOUT', label: '레이아웃' },
      { value: 'ETC', label: '기타' },
    ],
    ETC: [
      { value: 'ETC', label: '기타' },
    ],
  }
  return subCategories[category?.toUpperCase()] || []
}

/**
 * 카테고리 목록
 */
export const PUBLISHING_CATEGORIES = [
  { value: 'INFRAEYE1', label: 'Infraeye 1' },
  { value: 'INFRAEYE2', label: 'Infraeye 2' },
  { value: 'COMMON', label: '공통' },
  { value: 'ETC', label: '기타' },
]
