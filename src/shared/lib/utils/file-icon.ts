/**
 * File Icon Utility
 * 파일 확장자에 따른 아이콘 및 색상 반환 유틸리티
 */

import {
  File,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileArchive,
  FileCode,
  Database,
  Terminal,
  FileJson,
  type LucideIcon,
} from 'lucide-react'

export interface FileIconResult {
  icon: LucideIcon
  color: string
}

/**
 * 파일명에서 확장자를 기반으로 적절한 아이콘과 색상을 반환
 * @param fileName - 파일명 (확장자 포함)
 * @returns 아이콘 컴포넌트와 Tailwind 색상 클래스
 */
export function getFileIcon(fileName: string): FileIconResult {
  const ext = fileName.toLowerCase().split('.').pop() || ''

  // 스프레드시트
  if (['xlsx', 'xls', 'csv'].includes(ext)) {
    return { icon: FileSpreadsheet, color: 'text-green-600' }
  }
  // 문서
  if (['doc', 'docx', 'rtf', 'odt'].includes(ext)) {
    return { icon: FileText, color: 'text-blue-600' }
  }
  // PDF
  if (ext === 'pdf') {
    return { icon: FileText, color: 'text-red-500' }
  }
  // 이미지
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'svg'].includes(ext)) {
    return { icon: FileImage, color: 'text-purple-500' }
  }
  // 압축 파일
  if (['zip', 'rar', '7z', 'tar', 'gz', 'jar', 'war', 'ear'].includes(ext)) {
    return { icon: FileArchive, color: 'text-yellow-600' }
  }
  // 코드 파일
  if (['js', 'ts', 'tsx', 'jsx', 'py', 'java', 'c', 'cpp', 'h', 'cs', 'go', 'rs', 'rb', 'php', 'html', 'css', 'scss'].includes(ext)) {
    return { icon: FileCode, color: 'text-orange-500' }
  }
  // SQL
  if (ext === 'sql') {
    return { icon: Database, color: 'text-cyan-600' }
  }
  // 쉘/스크립트
  if (['sh', 'bash', 'bat', 'ps1', 'cmd'].includes(ext)) {
    return { icon: Terminal, color: 'text-gray-600' }
  }
  // JSON/설정 파일
  if (['json', 'yml', 'yaml', 'xml', 'ini', 'conf', 'properties', 'env', 'toml'].includes(ext)) {
    return { icon: FileJson, color: 'text-amber-500' }
  }
  // 텍스트/마크다운
  if (['txt', 'md', 'log', 'readme'].includes(ext)) {
    return { icon: FileText, color: 'text-gray-500' }
  }
  // 기본
  return { icon: File, color: 'text-muted-foreground' }
}

/** 조회 가능한 파일 확장자 목록
 *
 *  압축 파일(.zip / .jar / .war / .ear / .tar / .tar.gz / .gz / .7z / .rar)은
 *  뷰어에서 펼쳐 보여줄 의미가 없고 다운로드 외 동작이 없으므로 의도적으로 제외한다.
 *  아이콘 표시(getFileIcon) 의 'archive' 분류는 그대로 유지된다.
 */
export const VIEWABLE_EXTENSIONS = [
  // 텍스트/코드
  '.sql', '.sh', '.md', '.txt', '.log', '.json', '.xml',
  '.yml', '.yaml', '.ini', '.conf', '.properties', '.bat', '.ps1', '.env',
  '.css', '.scss', '.less', '.js', '.jsx', '.ts', '.tsx', '.html', '.htm',
  // 이미지
  '.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.ico', '.svg',
  // 스프레드시트
  '.xlsx', '.xls', '.csv',
  // Word 문서
  '.docx',
]

/**
 * 파일이 조회 가능한지 확인
 * @param fileName - 파일명
 * @returns 조회 가능 여부
 */
export function isViewableFile(fileName: string): boolean {
  const lowerName = fileName.toLowerCase()
  return VIEWABLE_EXTENSIONS.some(ext => lowerName.endsWith(ext))
}
