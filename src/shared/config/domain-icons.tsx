/**
 * Domain Icons Configuration
 * 도메인별 아이콘 설정 - 통일성 보장
 * 
 * 사용법:
 * - 생성/추가 폼: getDomainIcon('file') → FolderOpen
 * - 수정 폼: getFormIcon('edit') → Pencil
 * - 삭제 폼: getFormIcon('delete') → Trash2
 */

import {
  Building2,
  Database,
  FileArchive,
  Flame,
  FolderKanban,
  FolderOpen,
  GitBranch,
  Globe,
  Link as LinkIcon,
  Pencil,
  RotateCcw,
  Server,
  Tag,
  Terminal,
  Trash2,
  Users,
  type LucideIcon,
} from 'lucide-react'

/**
 * 도메인별 기본 아이콘 맵핑
 * 탭, 메뉴, 생성/추가 폼에서 사용
 */
export const DOMAIN_ICONS = {
  // 인프라 - 리소스 관리
  service: Server,
  link: LinkIcon,
  file: FolderOpen,
  publishing: Globe,
  
  // 운영 관리
  project: FolderKanban,
  customer: Building2,
  engineer: Users,
  account: Users,
  
  // 버전 관리
  version: Tag,
  hotfix: Flame,
  
  // 패치 관리
  patch: Tag,           // Standard 패치
  customPatch: GitBranch, // Custom 패치
  
  // 파일 동기화
  release: FileArchive,
  backup: Database,
  
  // 원격 작업
  terminal: Terminal,
  mariadbBackup: Database,
  mariadbRestore: RotateCcw,
} as const

export type DomainType = keyof typeof DOMAIN_ICONS

/**
 * 폼 모드별 아이콘
 */
export const FORM_MODE_ICONS = {
  edit: Pencil,
  delete: Trash2,
} as const

export type FormModeType = keyof typeof FORM_MODE_ICONS

/**
 * 도메인 아이콘 가져오기
 * @param domain 도메인 타입
 * @returns LucideIcon
 */
export function getDomainIcon(domain: DomainType): LucideIcon {
  return DOMAIN_ICONS[domain]
}

/**
 * 폼 모드에 따른 아이콘 가져오기
 * edit/delete 모드면 해당 아이콘, 그 외에는 도메인 아이콘
 * @param mode 폼 모드 ('create' | 'edit' | 'delete' | null)
 * @param domain 도메인 타입
 * @returns LucideIcon
 */
export function getFormIcon(
  mode: 'create' | 'edit' | 'delete' | null,
  domain: DomainType
): LucideIcon {
  if (mode === 'edit') return FORM_MODE_ICONS.edit
  if (mode === 'delete') return FORM_MODE_ICONS.delete
  return DOMAIN_ICONS[domain]
}

