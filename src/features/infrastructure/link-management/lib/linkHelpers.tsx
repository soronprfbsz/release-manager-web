/**
 * Link Helper Functions
 * 링크 리소스 관련 헬퍼 함수
 */

import { Link as LinkIcon } from 'lucide-react'
import {
  FaFileExcel,
  FaFileWord,
  FaFilePowerpoint,
  FaMicrosoft,
} from 'react-icons/fa'
import {
  SiNotion,
  SiGoogledrive,
  SiGooglesheets,
  SiGoogledocs,
  SiSlack,
  SiJira,
  SiConfluence,
  SiGithub,
  SiGitlab,
  SiFigma,
  SiTrello,
  SiAsana,
  SiDropbox,
  SiAirtable,
  SiMiro,
  SiLinear,
} from 'react-icons/si'

/**
 * subCategory별 아이콘 매핑
 */
const SUBCATEGORY_ICONS: Record<string, React.ReactNode> = {
  // Notion
  'NOTION': <SiNotion className="w-5 h-5 text-primary" />,

  // Microsoft Office (FontAwesome icons)
  'SHARED-EXCEL': <FaFileExcel className="w-5 h-5 text-[#217346]" />,
  'EXCEL': <FaFileExcel className="w-5 h-5 text-[#217346]" />,
  'WORD': <FaFileWord className="w-5 h-5 text-[#2B579A]" />,
  'POWERPOINT': <FaFilePowerpoint className="w-5 h-5 text-[#D24726]" />,
  'ONEDRIVE': <FaMicrosoft className="w-5 h-5 text-[#0078D4]" />,
  'SHAREPOINT': <FaMicrosoft className="w-5 h-5 text-[#038387]" />,
  'TEAMS': <FaMicrosoft className="w-5 h-5 text-[#6264A7]" />,

  // Google
  'GOOGLE-DRIVE': <SiGoogledrive className="w-5 h-5 text-[#4285F4]" />,
  'GOOGLE-SHEETS': <SiGooglesheets className="w-5 h-5 text-[#0F9D58]" />,
  'GOOGLE-DOCS': <SiGoogledocs className="w-5 h-5 text-[#4285F4]" />,

  // Collaboration
  'SLACK': <SiSlack className="w-5 h-5 text-[#4A154B]" />,
  'JIRA': <SiJira className="w-5 h-5 text-[#0052CC]" />,
  'CONFLUENCE': <SiConfluence className="w-5 h-5 text-[#172B4D]" />,
  'TRELLO': <SiTrello className="w-5 h-5 text-[#0052CC]" />,
  'ASANA': <SiAsana className="w-5 h-5 text-[#F06A6A]" />,
  'LINEAR': <SiLinear className="w-5 h-5 text-[#5E6AD2]" />,

  // Development
  'GITHUB': <SiGithub className="w-5 h-5 text-primary" />,
  'GITLAB': <SiGitlab className="w-5 h-5 text-[#FC6D26]" />,

  // Design
  'FIGMA': <SiFigma className="w-5 h-5 text-[#F24E1E]" />,
  'MIRO': <SiMiro className="w-5 h-5 text-[#FFD02F]" />,

  // Storage
  'DROPBOX': <SiDropbox className="w-5 h-5 text-[#0061FF]" />,
  'AIRTABLE': <SiAirtable className="w-5 h-5 text-[#18BFFF]" />,
}

/**
 * 링크 서브카테고리 아이콘 반환
 * subCategory에 따라 적절한 아이콘 반환, 없으면 기본 Link 아이콘
 */
export const getLinkIcon = (subCategory: string | null) => {
  if (subCategory && SUBCATEGORY_ICONS[subCategory.toUpperCase()]) {
    return SUBCATEGORY_ICONS[subCategory.toUpperCase()]
  }
  return <LinkIcon className="w-5 h-5 text-primary" />
}

/**
 * 링크 그룹 아이콘 반환
 * 모든 링크 카테고리는 탭 아이콘과 동일한 Link 아이콘 사용
 */
export const getLinkGroupIcon = (_category: string) => {
  return <LinkIcon className="w-5 h-5" />
}

