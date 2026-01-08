/**
 * Menu Icons Configuration
 * 메뉴 아이콘 중앙 집중 관리
 *
 * NavigationBar와 각 페이지 헤더에서 동일한 아이콘을 사용하도록 함
 * 
 * Lucide 아이콘: DB에 저장된 아이콘명으로 자동 매핑 (e.g. "rocket", "file-diff")
 * React-Icons: 명시적 매핑 필요 (e.g. "mariadb", "resources")
 */

import * as React from 'react'

import * as LucideIcons from 'lucide-react'
import { SiMariadb } from 'react-icons/si'

/**
 * kebab-case를 PascalCase로 변환
 * e.g. "file-diff" → "FileDiff", "rocket" → "Rocket"
 */
function toPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

/**
 * React-Icons 특수 아이콘 매핑 (Lucide에 없는 아이콘)
 */
const reactIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  mariadb: SiMariadb,
  'si-mariadb': SiMariadb,
}

/**
 * 아이콘명으로 아이콘 컴포넌트 가져오기
 * 
 * 1. React-Icons 먼저 확인 (특수 아이콘)
 * 2. Lucide 아이콘 동적 로딩 (아이콘명을 PascalCase로 변환하여 자동 매핑)
 * 
 * @param iconName API에서 받은 아이콘명 (e.g. "rocket", "file-diff", "mariadb")
 * @param className 아이콘에 적용할 CSS 클래스
 * @returns React 노드 또는 null
 * 
 * @example
 * getMenuIcon('rocket', 'h-5 w-5')     // → <Rocket className="h-5 w-5" />
 * getMenuIcon('file-diff', 'h-4 w-4') // → <FileDiff className="h-4 w-4" />
 * getMenuIcon('mariadb', 'h-4 w-4')   // → <SiMariadb className="h-4 w-4" />
 */
export function getMenuIcon(iconName: string | undefined, className: string = 'h-4 w-4'): React.ReactNode {
  if (!iconName) return null
  
  const lowerName = iconName.toLowerCase()
  
  // 1. React-Icons 확인 (특수 아이콘)
  const ReactIconComponent = reactIconMap[lowerName]
  if (ReactIconComponent) {
    return <ReactIconComponent className={className} />
  }
  
  // 2. Lucide 아이콘 동적 로딩
  const pascalCaseName = toPascalCase(iconName)
  const LucideIconComponent = (LucideIcons as Record<string, unknown>)[pascalCaseName]
  
  // Lucide 아이콘은 forwardRef로 래핑되어 있으므로 $$typeof로 React 컴포넌트인지 확인
  if (LucideIconComponent && typeof LucideIconComponent === 'object' && '$$typeof' in LucideIconComponent) {
    const IconComponent = LucideIconComponent as React.ComponentType<{ className?: string }>
    return <IconComponent className={className} />
  }
  
  // 아이콘을 찾지 못한 경우 null 반환
  return null
}

