/**
 * Sidebar — Backstage redesign
 * 좌측 다크 사이드바. 브랜드 마크 + 메뉴 (useMenus API) + 사용자 영역.
 */

import { useMemo, useState } from 'react'

import { ChevronRight, LogOut, User } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { ProfileEditForm } from '@/widgets/_shared/profile-edit'

import { useMenus, type MenuItem } from '@/entities/_shared/menu'

import { ROUTES } from '@/shared/config/constants'
import { getMenuIcon } from '@/shared/config/menu-icons'
import { cn } from '@/shared/lib/utils'
import { useAuthStore } from '@/shared/store'
import { DiceBearAvatar, DEFAULT_AVATAR_STYLE, type AvatarStyleKey } from '@/shared/ui/dicebear-avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

/** 어떤 경로가 주어진 path 의 활성 상태에 해당하는지 */
function isPathActive(currentPath: string, targetPath?: string): boolean {
  if (!targetPath) return false
  if (targetPath === '/') return currentPath === '/'
  return currentPath === targetPath || currentPath.startsWith(targetPath + '/')
}

/** 메뉴 트리 깊은 비교로 자손 중 활성 path 가 있는지 */
function hasActiveDescendant(item: MenuItem, currentPath: string): boolean {
  if (isPathActive(currentPath, item.path)) return true
  if (item.children) {
    return item.children.some((c) => hasActiveDescendant(c, currentPath))
  }
  return false
}

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const { data: menus, isLoading, error } = useMenus()

  const [profileOpen, setProfileOpen] = useState(false)

  // 활성 메뉴 그룹은 항상 열린 상태로 초기화
  const initialOpens = useMemo(() => {
    const opens: Record<string, boolean> = {}
    const visit = (item: MenuItem) => {
      if (item.children && item.children.length > 0) {
        if (hasActiveDescendant(item, location.pathname)) {
          opens[item.menuId] = true
        }
      }
      item.children?.forEach(visit)
    }
    menus?.forEach(visit)
    return opens
  }, [menus, location.pathname])

  const [opens, setOpens] = useState<Record<string, boolean>>(initialOpens)

  // 새 라우트로 이동 시 그 분기는 자동 열기 (사용자가 닫은 분기는 유지)
  useMemo(() => {
    setOpens((s) => ({ ...s, ...initialOpens }))
  }, [initialOpens])

  const toggle = (id: string) =>
    setOpens((s) => ({ ...s, [id]: !s[id] }))

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (location.pathname !== ROUTES.HOME) navigate(ROUTES.HOME)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <aside
        className="flex flex-col w-[256px] flex-none bg-card border-r border-border overflow-y-auto"
        style={{ backgroundColor: 'hsl(var(--sidebar-bg))' }}
      >
        {/* 브랜드 영역 */}
        <a
          href={ROUTES.HOME}
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 px-4 py-4 border-b border-border cursor-pointer hover:bg-muted/30 transition-colors"
        >
          <span className="inline-grid place-items-center w-[30px] h-[30px] rounded-md text-white text-[13px] font-extrabold tracking-[0.5px]"
            style={{
              background: 'linear-gradient(180deg, hsl(170 80% 40%), hsl(173 76% 25%))',
              boxShadow: '0 1px 2px rgba(0,0,0,0.10), inset 0 -1px 0 rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.10)',
            }}
          >
            R
          </span>
          <div className="flex flex-col leading-none">
            <strong className="text-sm font-bold" style={{ color: 'hsl(var(--sidebar-fg))' }}>
              Release Manager
            </strong>
            <small className="mt-1 text-[11px] font-medium" style={{ color: 'hsl(var(--sidebar-fg-muted))' }}>
              Backstage
            </small>
          </div>
        </a>

        {/* 메뉴 영역 */}
        <nav className="flex flex-col gap-0.5 px-2 py-3 flex-1 min-h-0">
          {isLoading ? (
            <div className="px-3 py-2 text-xs" style={{ color: 'hsl(var(--sidebar-fg-muted))' }}>메뉴 로딩 중…</div>
          ) : error ? (
            <div className="px-3 py-2 text-xs text-destructive">메뉴 로드 실패</div>
          ) : (
            menus?.map((item) => (
              <SidebarMenuItem
                key={item.menuId}
                item={item}
                depth={0}
                currentPath={location.pathname}
                opens={opens}
                onToggle={toggle}
              />
            ))
          )}
        </nav>

        {/* 사용자 영역 */}
        {user && (
          <div className="border-t border-border px-2 py-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex w-full items-center gap-2.5 px-2 py-2 rounded-md hover:bg-muted/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ color: 'hsl(var(--sidebar-fg))' }}
                >
                  <DiceBearAvatar
                    seed={user.avatarSeed || user.email}
                    style={(user.avatarStyle as AvatarStyleKey) || DEFAULT_AVATAR_STYLE}
                    size={32}
                    name={user.accountName}
                  />
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="text-[13px] font-semibold truncate w-full text-left">
                      {user.accountName}
                    </span>
                    <span className="text-[11px] truncate w-full text-left" style={{ color: 'hsl(var(--sidebar-fg-muted))' }}>
                      {user.role}
                    </span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{user.accountName}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                  <User className="mr-2 h-4 w-4" />
                  내 정보 수정
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </aside>

      {/* Profile Edit Dialog */}
      <ProfileEditForm open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  )
}

interface SidebarMenuItemProps {
  item: MenuItem
  depth: number
  currentPath: string
  opens: Record<string, boolean>
  onToggle: (id: string) => void
}

function SidebarMenuItem({ item, depth, currentPath, opens, onToggle }: SidebarMenuItemProps) {
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
            'hover:bg-muted/40',
            parentOn ? 'text-foreground' : ''
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
              />
            ))}
          </div>
        )}
      </>
    )
  }

  // 잎(Leaf) 노드 — Link 로 렌더 (path 가 없으면 disabled-look)
  if (!item.path || item.isLineBreak) {
    return null
  }

  return (
    <Link
      to={item.path}
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
