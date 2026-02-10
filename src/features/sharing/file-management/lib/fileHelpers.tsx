/**
 * File Helper Functions
 * 파일 리소스 관련 헬퍼 함수
 */

import {
  FileText,
  FolderOpen,
  LayoutDashboard,
  Table,
  Terminal,
  Database,
  Server,
  Code,
  Users,
  Shield,
  Box,
} from 'lucide-react'
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
} from "react-icons/bs"
import { FaDocker , FaRegFilePdf, FaRegFileArchive } from "react-icons/fa"
import { LuFileTerminal } from "react-icons/lu"
import { RiFileExcel2Line, RiNumber1, RiNumber2 } from "react-icons/ri"
import { VscFileMedia, VscFile } from "react-icons/vsc"

/**
 * 파일 타입별 아이콘 반환
 */
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

/**
 * 파일 서브카테고리 아이콘 반환
 */
export const getFileSubCategoryIcon = (subCategory: string | null) => {
  const upperSubCategory = subCategory?.toUpperCase()

  switch (upperSubCategory) {
    case 'BACKUP':
      return <Database className="w-5 h-5 text-primary" />
    case 'RESTORE':
      return <Database className="w-5 h-5 text-primary" />
    case 'INSTALL':
      return <Server className="w-5 h-5 text-primary" />
    case 'GUIDE':
      return <FileText className="w-5 h-5 text-primary" />
    default:
      return <FolderOpen className="w-5 h-5 text-primary" />
  }
}

/**
 * 파일 카테고리 그룹 아이콘 반환
 */
export const getFileGroupIcon = (category: string) => {
  const upperCategory = category?.toUpperCase()

  switch (upperCategory) {
    // Product categories
    case 'INFRAEYE1':
      return <RiNumber1 className="w-5 h-5" />
    case 'INFRAEYE2':
      return <RiNumber2 className="w-5 h-5" />
    // Team categories
    case 'TEAM_DEV2':
      return <Code className="w-5 h-5" />
    case 'TEAM_INFRA':
      return <Server className="w-5 h-5" />
    case 'TEAM_SERVICE':
      return <Users className="w-5 h-5" />
    case 'TEAM_SECURITY':
      return <Shield className="w-5 h-5" />
    // Legacy categories
    case 'SCRIPT':
      return <Terminal className="w-5 h-5" />
    case 'DOCUMENT':
      return <FileText className="w-5 h-5" />
    case 'DASHBOARD':
      return <LayoutDashboard className="w-5 h-5" />
    case 'SHEET':
      return <Table className="w-5 h-5" />
    case 'DOCKER':
      return <FaDocker className="w-5 h-5" />
    default:
      return <Box className="w-5 h-5" />
  }
}


/**
 * 파일 크기 포맷팅
 */
export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

