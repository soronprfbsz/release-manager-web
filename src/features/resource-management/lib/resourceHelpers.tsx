/**
 * Resource Helper Functions
 */

import {
  FileText,
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
import { SiNotion, SiDocker } from "react-icons/si";
import { RiFileExcel2Line } from "react-icons/ri";
import { SlSocialDropbox } from "react-icons/sl";
import { VscFileMedia, VscFile } from "react-icons/vsc";
import { LuFileTerminal } from "react-icons/lu";
import { FaRegFilePdf, FaRegFileArchive } from "react-icons/fa";
import {
  BsFiletypeExe,
  BsFiletypeTxt,
  BsFiletypeSql,
  BsFiletypeJson,
  BsFiletypeJava,
  BsFiletypeMd,
  BsFiletypePng,
  BsFiletypeJpg,
  BsFiletypeGif,
  BsFiletypeSvg,
  BsFiletypeXml,
} from "react-icons/bs";

import {
  getCategoryCardColorClass,
  getCategoryIconBgColorClass,
  getCategoryIconColorClass,
} from '@/shared/lib/category-colors'

// ============================================================================
// File Resources
// ============================================================================

export const getFileTypeIcon = (fileType: string) => {
  switch (fileType?.toUpperCase()) {
    // Shell/Script
    case 'SH':
      return <LuFileTerminal className="w-5 h-5 text-primary" />

    // Documents
    case 'PDF':
      return <FaRegFilePdf className="w-5 h-5 text-primary" />
    case 'TXT':
      return <BsFiletypeTxt className="w-5 h-5 text-primary" />
    case 'MD':
      return <BsFiletypeMd className="w-5 h-5 text-primary" />
    case 'XML':
      return <BsFiletypeXml className="w-5 h-5 text-primary" />

    // Spreadsheets
    case 'XLS':
    case 'XLSX':
      return <RiFileExcel2Line className="w-5 h-5 text-primary" />

    // Archives
    case 'ZIP':
    case 'TAR':
    case 'GZ':
      return <FaRegFileArchive className="w-5 h-5 text-primary" />

    // Executables
    case 'EXE':
      return <BsFiletypeExe className="w-5 h-5 text-primary" />

    // Java
    case 'JAR':
    case 'WAR':
      return <BsFiletypeJava className="w-5 h-5 text-primary" />

    // Data files
    case 'SQL':
      return <BsFiletypeSql className="w-5 h-5 text-primary" />
    case 'JSON':
      return <BsFiletypeJson className="w-5 h-5 text-primary" />

    // Images
    case 'PNG':
      return <BsFiletypePng className="w-5 h-5 text-primary" />
    case 'JPG':
    case 'JPEG':
      return <BsFiletypeJpg className="w-5 h-5 text-primary" />
    case 'GIF':
      return <BsFiletypeGif className="w-5 h-5 text-primary" />
    case 'SVG':
      return <BsFiletypeSvg className="w-5 h-5 text-primary" />
    case 'BMP':
      return <VscFileMedia className="w-5 h-5 text-primary" />

    // Undefined / Default
    case 'UNDEFINED':
    default:
      return <VscFile className="w-5 h-5 text-primary" />
  }
}

export const getSubCategoryIcon = (subCategory: string | null) => {
  // Common icons for both File and Link resources
  // 모든 아이콘은 테마의 primary 색상을 사용
  const upperSubCategory = subCategory?.toUpperCase();

  switch (upperSubCategory) {
    // Files
    case 'BACKUP':
      return <Database className="w-5 h-5 text-primary" />
    case 'RESTORE':
      return <Database className="w-5 h-5 text-primary" />
    case 'INSTALL':
      return <Server className="w-5 h-5 text-primary" />
    case 'GUIDE':
      return <FileText className="w-5 h-5 text-primary" />

    // Links
    case 'NOTION':
      return <SiNotion className="w-5 h-5 text-primary" />
    case 'SHARED-EXCEL':
    case 'GOOGLE_SHEET':
      return <RiFileExcel2Line className="w-5 h-5 text-primary" />
    case 'JIRA':
      return <LayoutDashboard className="w-5 h-5 text-primary" />
    case 'CONFLUENCE':
      return <Globe className="w-5 h-5 text-primary" />
    case 'DROPBOX':
      return <SlSocialDropbox className="w-5 h-5 text-primary" />
    case 'DOCKER':
      return <SiDocker className="w-5 h-5 text-primary" />
    case 'ETC':
      return <FileText className="w-5 h-5 text-primary" />
    default:
      if (!subCategory) return <LinkIcon className="w-5 h-5 text-primary" />
      return <FileText className="w-5 h-5 text-primary" />
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
    case 'DOCKER':
      // 도커 아이콘
      return <SiDocker className="w-5 h-5" />

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
  DOCKER: 3,
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
