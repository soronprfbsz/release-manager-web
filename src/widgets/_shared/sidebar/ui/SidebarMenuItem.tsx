/**
 * SidebarMenuItem — 사이드바 메뉴 아이템 (재귀).
 *
 * variant:
 *   'inline'            : Desktop expanded / Mobile drawer 에서 사용. 자식 들이 indent 로 트리 표시.
 *   'collapsed-popout'  : Desktop collapsed 에서 1depth (depth=0) 만 호출. 자식이 있으면 Popover 로,
 *                         없으면 Tooltip 으로 표시.
 */

import { useRef, useState } from 'react'

import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { type MenuItem } from '@/entities/_shared/menu'

import { getMenuIcon } from '@/shared/config/menu-icons'
import { cn } from '@/shared/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

export function isPathActive(currentPath: string, targetPath?: string): boolean {
  if (!targetPath) return false
  if (targetPath === '/') return currentPath === '/'
  return currentPath === targetPath || currentPath.startsWith(targetPath + '/')
}

export function hasActiveDescendant(item: MenuItem, currentPath: string): boolean {
  if (isPathActive(currentPath, item.path)) return true
  if (item.children) {
    return item.children.some((c) => hasActiveDescendant(c, currentPath))
  }
  return false
}

export type SidebarMenuItemVariant = 'inline' | 'collapsed-popout'

interface SidebarMenuItemProps {
  item: MenuItem
  depth: number
  currentPath: string
  opens: Record<string, boolean>
  onToggle: (id: string) => void
  variant: SidebarMenuItemVariant
  /** 메뉴 클릭 후 호출 — 모바일 drawer close / popover close 등에 사용. 없으면 no-op. */
  onNavigate?: () => void
}

export function SidebarMenuItem(props: SidebarMenuItemProps) {
  const { variant } = props

  // collapsed-popout 은 depth 0 (1depth) 에서만 호출되어야 한다.
  if (variant === 'collapsed-popout' && props.depth === 0) {
    return <CollapsedPopoutItem {...props} />
  }

  return <InlineItem {...props} />
}

/* ─────────────────────────  inline (expanded / drawer)  ───────────────────────── */

function InlineItem({ item, depth, currentPath, opens, onToggle, onNavigate }: SidebarMenuItemProps) {
  const hasChildren = !!(item.children && item.children.length > 0)
  const isOpen = !!opens[item.menuId]
  const isOn = isPathActive(currentPath, item.path)
  const parentOn = hasChildren && hasActiveDescendant(item, currentPath)

  if (hasChildren) {
    return (
      <>
        <button
          onClick={() => onToggle(item.menuId)}
          className={cn(
            'group/sb flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-[13px] font-medium text-left transition-colors',
            'hover:bg-muted/40'
          )}
          style={{ color: parentOn ? 'hsl(var(--sidebar-fg))' : 'hsl(var(--sidebar-fg-muted))' }}
        >
          {item.isIconVisible !== false && depth === 0 && (
            <span className="shrink-0 inline-grid place-items-center w-4 h-4 [&_svg]:w-4 [&_svg]:h-4">
              {getMenuIcon(item.icon)}
            </span>
          )}
          <span className="flex-1 truncate">{item.label}</span>
          <ChevronRight
            className={cn(
              'shrink-0 h-3 w-3 transition-transform duration-150',
              isOpen && 'rotate-90'
            )}
            style={{ color: 'hsl(var(--sidebar-fg-muted))' }}
          />
        </button>
        {isOpen && (
          <div
            className="flex flex-col gap-0.5 ml-3 mt-0.5 pl-3 border-l"
            style={{ borderColor: 'hsl(var(--sidebar-border))' }}
          >
            {item.children!.map((child) => (
              <SidebarMenuItem
                key={child.menuId}
                item={child}
                depth={depth + 1}
                currentPath={currentPath}
                opens={opens}
                onToggle={onToggle}
                variant="inline"
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </>
    )
  }

  if (!item.path || item.isLineBreak) {
    return null
  }

  return (
    <Link
      to={item.path}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[12.5px] font-medium transition-colors',
        'hover:bg-muted/40'
      )}
      style={
        isOn
          ? {
              background: 'hsl(var(--sidebar-active-bg))',
              color: 'hsl(var(--sidebar-active-fg))',
              boxShadow: 'inset 0 0 0 1px hsl(var(--sidebar-active-border))',
            }
          : { color: 'hsl(var(--sidebar-fg-muted))' }
      }
    >
      {depth === 0 && item.isIconVisible !== false && (
        <span className="shrink-0 inline-grid place-items-center w-4 h-4 [&_svg]:w-4 [&_svg]:h-4">
          {getMenuIcon(item.icon)}
        </span>
      )}
      {depth > 0 && (
        <span
          className="shrink-0 w-[5px] h-[5px] rounded-full"
          style={{ background: 'currentColor', opacity: 0.55 }}
        />
      )}
      <span className="flex-1 truncate">{item.label}</span>
    </Link>
  )
}

/* ─────────────────────────  collapsed-popout (depth=0 only)  ───────────────────────── */

function CollapsedPopoutItem(props: SidebarMenuItemProps) {
  const { item, currentPath, onNavigate } = props
  const hasChildren = !!(item.children && item.children.length > 0)
  const isOnAny = hasActiveDescendant(item, currentPath)

  const iconButtonClass = cn(
    'flex items-center justify-center w-10 h-10 mx-auto rounded-md transition-colors',
    'hover:bg-muted/40 [&_svg]:w-4 [&_svg]:h-4'
  )

  const iconStyle = isOnAny
    ? {
        background: 'hsl(var(--sidebar-active-bg))',
        color: 'hsl(var(--sidebar-active-fg))',
        boxShadow: 'inset 0 0 0 1px hsl(var(--sidebar-active-border))',
      }
    : { color: 'hsl(var(--sidebar-fg-muted))' }

  // 자식 없는 leaf — 단순 Link + Tooltip
  if (!hasChildren) {
    if (!item.path || item.isLineBreak) return null
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to={item.path}
            onClick={onNavigate}
            className={iconButtonClass}
            style={iconStyle}
            aria-label={item.label}
          >
            {item.isIconVisible !== false && (
              <span className="inline-grid place-items-center">{getMenuIcon(item.icon)}</span>
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    )
  }

  // 자식 있음 — Popover 로 자식 트리 표시. 호버 enter/leave 로 open 제어.
  return (
    <HoverPopover
      label={item.label}
      iconButtonClass={iconButtonClass}
      iconStyle={iconStyle}
      iconNode={
        item.isIconVisible !== false ? (
          <span className="inline-grid place-items-center">{getMenuIcon(item.icon)}</span>
        ) : null
      }
    >
      <PopoutChildren
        item={item}
        currentPath={currentPath}
        onNavigate={onNavigate}
      />
    </HoverPopover>
  )
}

/* hover 진입/이탈 delay 가 있는 Popover wrapper */
interface HoverPopoverProps {
  label: string
  iconButtonClass: string
  iconStyle: React.CSSProperties
  iconNode: React.ReactNode
  children: React.ReactNode
}

function HoverPopover({ label, iconButtonClass, iconStyle, iconNode, children }: HoverPopoverProps) {
  const [open, setOpen] = useState(false)
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelTimers = () => {
    if (enterTimer.current) clearTimeout(enterTimer.current)
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    enterTimer.current = null
    leaveTimer.current = null
  }

  const handleEnter = () => {
    cancelTimers()
    enterTimer.current = setTimeout(() => setOpen(true), 100)
  }
  const handleLeave = () => {
    cancelTimers()
    leaveTimer.current = setTimeout(() => setOpen(false), 150)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={iconButtonClass}
          style={iconStyle}
          aria-label={label}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        >
          {iconNode}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-64 p-2"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="px-2 pb-2 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
          {label}
        </div>
        {children}
      </PopoverContent>
    </Popover>
  )
}

interface PopoutChildrenProps {
  item: MenuItem
  currentPath: string
  onNavigate?: () => void
}

function PopoutChildren({ item, currentPath, onNavigate }: PopoutChildrenProps) {
  // popout 안에서는 모든 분기를 expanded 로 보여준다.
  // toggle 동작은 popout 안에서 비활성 — 매번 다 열린 상태로 표시한다.
  const allOpen: Record<string, boolean> = {}
  const visit = (m: MenuItem) => {
    if (m.children && m.children.length > 0) {
      allOpen[m.menuId] = true
      m.children.forEach(visit)
    }
  }
  visit(item)

  return (
    <div className="flex flex-col gap-0.5">
      {item.children!.map((child) => (
        <SidebarMenuItem
          key={child.menuId}
          item={child}
          depth={1}
          currentPath={currentPath}
          opens={allOpen}
          onToggle={() => { /* popout 안에서는 toggle 비활성 — 항상 열린 상태 */ }}
          variant="inline"
          onNavigate={onNavigate}
        />
      ))}
    </div>
  )
}
