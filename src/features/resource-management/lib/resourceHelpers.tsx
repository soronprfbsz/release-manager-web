/**
 * Resource Helpers
 * 리소스 아이콘 및 색상 관련 유틸리티 함수
 */

import { FileCode, FileText, FolderOpen, HardDrive, RotateCcw } from 'lucide-react'

import type { ResourceFile } from '@/entities/resource'

/** fileType 및 description 기반 아이콘 매핑 */
export function getResourceIcon(resource: ResourceFile) {
  const desc = resource.description?.toLowerCase() || ''
  const fileType = resource.fileType?.toUpperCase()

  if (desc.includes('백업') || desc.includes('backup')) {
    return <HardDrive className="h-8 w-8" />
  }
  if (desc.includes('복원') || desc.includes('restore') || desc.includes('recovery')) {
    return <RotateCcw className="h-8 w-8" />
  }
  if (fileType === 'PDF') {
    return <FileText className="h-8 w-8" />
  }
  return <FileCode className="h-8 w-8" />
}

/** fileType 및 description 기반 색상 클래스 */
export function getResourceColorClass(resource: ResourceFile) {
  const desc = resource.description?.toLowerCase() || ''
  const fileType = resource.fileType?.toUpperCase()

  if (desc.includes('백업') || desc.includes('backup')) {
    return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
  }
  if (desc.includes('복원') || desc.includes('restore') || desc.includes('recovery')) {
    return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
  }
  if (fileType === 'PDF') {
    return 'text-red-500 bg-red-500/10 border-red-500/20'
  }
  return 'text-slate-500 bg-slate-500/10 border-slate-500/20'
}

/** fileCategory별 그룹 색상 클래스 */
export function getGroupColorClass(category: string) {
  const cat = category.toUpperCase()

  switch (cat) {
    case 'SCRIPT':
      return { icon: 'bg-cyan-500/10 text-cyan-500' }
    case 'DOCUMENT':
      return { icon: 'bg-red-500/10 text-red-500' }
    case 'SQL':
      return { icon: 'bg-amber-500/10 text-amber-500' }
    default:
      return { icon: 'bg-slate-500/10 text-slate-500' }
  }
}

/** fileCategory별 그룹 아이콘 */
export function getGroupIcon(category: string) {
  const cat = category.toUpperCase()

  switch (cat) {
    case 'SCRIPT':
      return <FileCode className="h-4 w-4" />
    case 'DOCUMENT':
      return <FileText className="h-4 w-4" />
    case 'SQL':
      return <HardDrive className="h-4 w-4" />
    default:
      return <FolderOpen className="h-4 w-4" />
  }
}

/** 파일 크기 포맷팅 */
export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
