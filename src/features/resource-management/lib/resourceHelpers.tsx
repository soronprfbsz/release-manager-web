/**
 * Resource Helper Functions
 */

import {
  FileText,
  FileCode,
  FileArchive,
  FileImage,
  FolderOpen,
  LayoutDashboard,
  Table,
  Link as LinkIcon,
  Globe,
  Database,
  Server,
  Terminal,
  Layers,
  BookOpen,
  Cloud,
  Users,
  MoreHorizontal,
} from 'lucide-react'

// React Icons
import { SiNotion } from "react-icons/si";
import { RiFileExcel2Line } from "react-icons/ri";
import { SlSocialDropbox } from "react-icons/sl";

import {
  getCategoryCardColorClass,
  getCategoryIconBgColorClass,
  getCategoryIconColorClass,
} from '@/shared/lib/category-colors'

// ============================================================================
// File Resources
// ============================================================================

export const getResourceIcon = (fileType: string) => {
  switch (fileType?.toLowerCase()) {
    case 'sh':
    case 'bash':
      return <Terminal className="w-5 h-5 text-slate-600" />
    case 'pdf':
      return <FileText className="w-5 h-5 text-red-500" />
    case 'doc':
    case 'docx':
      return <FileText className="w-5 h-5 text-blue-500" />
    case 'xls':
    case 'xlsx':
      return <Table className="w-5 h-5 text-green-500" />
    case 'zip':
    case 'tar':
    case 'gz':
      return <FileArchive className="w-5 h-5 text-yellow-500" />
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return <FileImage className="w-5 h-5 text-purple-500" />
    default:
      return <FileCode className="w-5 h-5 text-gray-400" />
  }
}

export const getSubCategoryIcon = (subCategory: string | null) => {
  // Common icons for both File and Link resources
  const upperSubCategory = subCategory?.toUpperCase();

  switch (upperSubCategory) {
    // Files
    case 'BACKUP':
      return <Database className="w-5 h-5 text-blue-500" />
    case 'RESTORE':
      return <Database className="w-5 h-5 text-green-500" />
    case 'INSTALL':
      return <Server className="w-5 h-5 text-purple-500" />
    case 'GUIDE':
      return <FileText className="w-5 h-5 text-orange-500" />

    // Links
    case 'NOTION':
      return <SiNotion className="w-5 h-5 text-black dark:text-white" />
    case 'SHARED-EXCEL': // Updated to match user request "SHARED-EXCEL" and "엑셀아이콘"
    case 'GOOGLE_SHEET':
      return <RiFileExcel2Line className="w-5 h-5 text-green-600" />
    case 'JIRA':
      return <LayoutDashboard className="w-5 h-5 text-blue-600" />
    case 'CONFLUENCE':
      return <Globe className="w-5 h-5 text-blue-500" />
    case 'DROPBOX':
      return <SlSocialDropbox className="w-5 h-5 text-blue-500" />
    case 'ETC':
      return <FileText className="w-5 h-5 text-gray-500" />
    default:
      // Default to document icon for ETC or unknown, per requirement "ETC면 일반문서 아이콘" if it falls through,
      // but explicitly handling ETC above.
      // If null or unknown, generic link or file text
      if (!subCategory) return <LinkIcon className="w-5 h-5 text-gray-400" />
      return <FileText className="w-5 h-5 text-gray-400" />
  }
}

export const getResourceColorClass = (category: string) => {
  const index = getCategoryIndex(category)
  return getCategoryCardColorClass(index)
}

export const getGroupIcon = (category: string) => {
  const upperCategory = category?.toUpperCase()

  switch (upperCategory) {
    // File categories
    case 'SCRIPT':
      return <Terminal className="w-5 h-5" />
    case 'DOCUMENT':
      return <FileText className="w-5 h-5" />
    case 'DASHBOARD':
      return <LayoutDashboard className="w-5 h-5" />
    case 'SHEET':
      return <Table className="w-5 h-5" />

    // Link categories
    case 'INFRAEYE1':
    case 'INFRAEYE2':
      // 프로젝트 느낌의 아이콘
      return <Layers className="w-5 h-5" />
    case 'INFRAEYE':
      // 솔루션 공통 지식 아이콘
      return <BookOpen className="w-5 h-5" />
    case 'INFRA':
      // 개발 인프라 아이콘
      return <Cloud className="w-5 h-5" />
    case 'TEAM':
    case 'TEAM_MANAGEMENT':
      // 팀 관련 아이콘
      return <Users className="w-5 h-5" />

    case 'ETC':
      // 기타 아이콘
      return <MoreHorizontal className="w-5 h-5" />

    default:
      return <FolderOpen className="w-5 h-5" />
  }
}

/**
 * 카테고리 인덱스 매핑
 * 파일/링크 카테고리에 따라 chart 색상 인덱스 반환
 */
const CATEGORY_INDEX_MAP: Record<string, number> = {
  // File categories
  SCRIPT: 0,
  DOCUMENT: 1,

  // Link categories
  INFRAEYE1: 0,
  INFRAEYE2: 1,
  INFRAEYE: 2,
  INFRA: 3,
  TEAM: 4,
  TEAM_MANAGEMENT: 4,
  ETC: 4,
}

/**
 * 카테고리 인덱스 계산
 * 매핑에 없는 카테고리는 이름 기반 해시로 인덱스 생성
 */
function getCategoryIndex(category: string): number {
  const upperCategory = category?.toUpperCase()

  // 매핑에 있으면 해당 인덱스 반환
  if (upperCategory in CATEGORY_INDEX_MAP) {
    return CATEGORY_INDEX_MAP[upperCategory]
  }

  // 없으면 문자열 해시로 인덱스 생성 (일관성 보장)
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = ((hash << 5) - hash) + category.charCodeAt(i)
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash) % 5 // chart-1 ~ chart-5 순환
}

export const getCardColorClass = (category: string) => {
  const index = getCategoryIndex(category)
  return getCategoryCardColorClass(index)
}

export const getGroupColorClass = (category: string) => {
  const index = getCategoryIndex(category)
  return getCategoryCardColorClass(index)
}

/**
 * 그룹 헤더 아이콘 배경 색상 클래스 반환 (chart 변수 기반)
 */
export const getGroupIconBgClass = (category: string) => {
  const index = getCategoryIndex(category)
  return getCategoryIconBgColorClass(index)
}

/**
 * 그룹 헤더 아이콘 색상 클래스 반환 (chart 변수 기반)
 */
export const getGroupIconColorClass = (category: string) => {
  const index = getCategoryIndex(category)
  return getCategoryIconColorClass(index)
}

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
