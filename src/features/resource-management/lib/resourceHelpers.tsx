/**
 * Resource Helpers
 * 리소스 아이콘 및 색상 관련 유틸리티 함수
 */

import { FileCode, FileText, FolderOpen, HardDrive, RotateCcw, Server, Cloud } from 'lucide-react'
import {
  SiMariadb,
  SiMysql,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiElasticsearch,
  SiCratedb,
  SiNotion,
  SiConfluence,
  SiJira,
  SiGithub,
  SiGitlab,
  SiBitbucket,
  SiDocker,
  SiKubernetes,
  SiJenkins,
  SiApache,
  SiNginx,
  SiLinux,
  SiAmazon,
  SiGooglecloud,
} from 'react-icons/si'

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

/** fileCategory별 카드 배경 색상 클래스 */
export function getCardColorClass(category: string) {
  const cat = category.toUpperCase()

  switch (cat) {
    case 'SCRIPT':
      return 'border-cyan-500/20 hover:border-cyan-500/40'
    case 'DOCUMENT':
      return 'border-red-500/20 hover:border-red-500/40'
    case 'SQL':
      return 'border-amber-500/20 hover:border-amber-500/40'
    default:
      return 'border-slate-500/20 hover:border-slate-500/40'
  }
}

/** fileCategory별 그룹 아이콘 */
export function getGroupIcon(category: string) {
  const cat = category.toUpperCase()

  switch (cat) {
    case 'SCRIPT':
      return <FileCode className="h-5 w-5 text-primary" />
    case 'DOCUMENT':
      return <FileText className="h-5 w-5 text-primary" />
    case 'SQL':
      return <HardDrive className="h-5 w-5 text-primary" />
    default:
      return <FolderOpen className="h-5 w-5 text-primary" />
  }
}

/** subCategory별 아이콘 매핑 */
export function getSubCategoryIcon(subCategory: string | null) {
  if (!subCategory) {
    return <FileCode className="h-8 w-8" />
  }

  const category = subCategory.toLowerCase()

  // 데이터베이스
  if (category.includes('mariadb')) return <SiMariadb className="h-8 w-8" />
  if (category.includes('mysql')) return <SiMysql className="h-8 w-8" />
  if (category.includes('postgresql') || category.includes('postgres'))
    return <SiPostgresql className="h-8 w-8" />
  if (category.includes('mongodb') || category.includes('mongo'))
    return <SiMongodb className="h-8 w-8" />
  if (category.includes('redis')) return <SiRedis className="h-8 w-8" />
  if (category.includes('elasticsearch') || category.includes('elastic'))
    return <SiElasticsearch className="h-8 w-8" />
  if (category.includes('cratedb') || category.includes('crate'))
    return <SiCratedb className="h-8 w-8" />

  // 협업 도구
  if (category.includes('notion')) return <SiNotion className="h-8 w-8" />
  if (category.includes('confluence')) return <SiConfluence className="h-8 w-8" />
  if (category.includes('jira')) return <SiJira className="h-8 w-8" />

  // 버전 관리
  if (category.includes('github')) return <SiGithub className="h-8 w-8" />
  if (category.includes('gitlab')) return <SiGitlab className="h-8 w-8" />
  if (category.includes('bitbucket')) return <SiBitbucket className="h-8 w-8" />

  // 인프라 & DevOps
  if (category.includes('docker')) return <SiDocker className="h-8 w-8" />
  if (category.includes('kubernetes') || category.includes('k8s'))
    return <SiKubernetes className="h-8 w-8" />
  if (category.includes('jenkins')) return <SiJenkins className="h-8 w-8" />

  // 웹 서버
  if (category.includes('apache')) return <SiApache className="h-8 w-8" />
  if (category.includes('nginx')) return <SiNginx className="h-8 w-8" />

  // OS
  if (category.includes('linux')) return <SiLinux className="h-8 w-8" />
  if (category.includes('windows')) return <Server className="h-8 w-8" />

  // 클라우드
  if (category.includes('aws') || category.includes('amazon'))
    return <SiAmazon className="h-8 w-8" />
  if (category.includes('azure')) return <Cloud className="h-8 w-8" />
  if (category.includes('gcp') || category.includes('google')) return <SiGooglecloud className="h-8 w-8" />

  // 기본 아이콘 (매칭되지 않은 경우)
  return <FileCode className="h-8 w-8" />
}

/** 파일 크기 포맷팅 */
export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
