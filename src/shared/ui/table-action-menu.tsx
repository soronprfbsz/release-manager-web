/**
 * Table Action Menu Component
 * 테이블 행 액션 메뉴 컴포넌트
 */

import { MoreHorizontal } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from './button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './dropdown-menu'

interface TableActionMenuProps {
  children: ReactNode
}

export function TableActionMenu({ children }: TableActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-xs">
          <MoreHorizontal />
          <span className="sr-only">메뉴 열기</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{children}</DropdownMenuContent>
    </DropdownMenu>
  )
}

// Re-export dropdown menu items for convenience
export {
  DropdownMenuItem as TableActionMenuItem,
  DropdownMenuSeparator as TableActionMenuSeparator,
} from './dropdown-menu'
