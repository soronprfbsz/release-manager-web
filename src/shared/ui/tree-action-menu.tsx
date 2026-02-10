/**
 * Tree Action Menu Component
 * 트리 노드 및 리스트 항목 액션 메뉴 컴포넌트
 * - 호버 시 표시되는 액션 메뉴
 * - 트리/리스트 항목의 컨텍스트 액션 처리
 */

import type { ReactNode } from 'react'

import { MoreHorizontal } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

import { Button } from './button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'

interface TreeActionMenuProps {
  children: ReactNode
  /** 추가 className */
  className?: string
  /** 버튼 크기 (default: 'md') */
  size?: 'sm' | 'md'
}

/**
 * 트리/리스트 항목용 액션 메뉴
 * - 부모 요소에 `group` 클래스가 있어야 호버 시 표시됨
 * - 기본적으로 hover 시에만 표시되며, 메뉴가 열리면 유지됨
 */
export function TreeActionMenu({ children, className, size = 'md' }: TreeActionMenuProps) {
  const buttonSize = size === 'sm' ? 'h-5 w-5' : 'h-6 w-6'
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            buttonSize,
            'opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity flex-shrink-0',
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className={iconSize} />
          <span className="sr-only">메뉴 열기</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{children}</DropdownMenuContent>
    </DropdownMenu>
  )
}

interface TreeActionMenuItemProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  /** 삭제 등 위험한 액션 여부 */
  destructive?: boolean
  className?: string
}

/**
 * 트리 액션 메뉴 아이템
 * - destructive prop으로 삭제 등 위험한 액션 스타일링
 */
export function TreeActionMenuItem({
  children,
  onClick,
  disabled,
  destructive,
  className,
}: TreeActionMenuItemProps) {
  return (
    <DropdownMenuItem
      onClick={onClick}
      disabled={disabled}
      className={cn(
        destructive && 'text-destructive focus:text-destructive',
        className
      )}
    >
      {children}
    </DropdownMenuItem>
  )
}

// Re-export separator for convenience
export { DropdownMenuSeparator as TreeActionMenuSeparator }
