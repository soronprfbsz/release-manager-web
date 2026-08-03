/**
 * DesktopSidebar — 데스크탑 (md+) 에서만 렌더되는 사이드바 본체.
 *
 * 폭: desktopCollapsed ? 64px : 256px (transition 200ms).
 * collapsed 일 때 메뉴 트리는 1depth 만 아이콘으로 보이고 자식은 hover popout.
 */

import { useEffect, useMemo, useState } from 'react'

import { LogOut, User } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import { ProfileEditForm } from '@/widgets/_shared/profile-edit'

import { useMenus, type MenuItem } from '@/entities/_shared/menu'

import { ROUTES } from '@/shared/config/constants'
import { cn } from '@/shared/lib/utils'
import { useAuthStore, useSidebarStore } from '@/shared/store'
import { DiceBearAvatar, DEFAULT_AVATAR_STYLE, type AvatarStyleKey } from '@/shared/ui/dicebear-avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { TooltipProvider } from '@/shared/ui/tooltip'

import { SidebarMenuItem } from './SidebarMenuItem'
import { hasActiveDescendant } from '../lib/menu-active'


export function DesktopSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const collapsed = useSidebarStore((s) => s.desktopCollapsed)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { data: menus, isLoading, error } = useMenus()

  const [profileOpen, setProfileOpen] = useState(false)

  // 활성 메뉴 그룹은 항상 열린 상태로 초기화 (expanded 일 때만 의미 있음)
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
  useEffect(() => {
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
    <TooltipProvider delayDuration={500}>
      <aside
        className={cn(
          'flex flex-col flex-none border-r border-[hsl(var(--sidebar-border))] overflow-y-auto overflow-x-hidden transition-[width] duration-200 ease-out',
          // command slab — 탑바(MainLayout)와 같은 클래스. 배경색은 .slab 한 곳에서만 바꾼다
          'slab',
          collapsed ? 'w-16' : 'w-[256px]'
        )}
        aria-label="주 메뉴"
      >
        {/* 로고 영역 — topbar 와 동일한 h-16 */}
        <a
          href={ROUTES.HOME}
          onClick={handleLogoClick}
          className={cn(
            'flex items-center gap-2.5 h-16 border-b border-[hsl(var(--sidebar-border))] cursor-pointer hover:bg-muted/30 transition-colors flex-none',
            collapsed ? 'px-0 justify-center' : 'px-4'
          )}
          aria-label="홈으로"
        >
          <span
            className="inline-grid place-items-center w-[30px] h-[30px] rounded-md text-white text-[13px] font-extrabold tracking-[0.5px] shrink-0"
            style={{
              background: 'linear-gradient(180deg, hsl(170 80% 40%), hsl(173 76% 25%))',
              boxShadow: '0 1px 2px rgba(0,0,0,0.10), inset 0 -1px 0 rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.10)',
            }}
          >
            R
          </span>
          {!collapsed && (
            <div className="flex flex-col leading-none transition-opacity duration-150 ease-out opacity-100">
              <strong className="text-sm font-bold" style={{ color: 'hsl(var(--sidebar-fg))' }}>
                Release Manager
              </strong>
              <small className="mt-1 text-[11px] font-medium" style={{ color: 'hsl(var(--sidebar-fg-muted))' }}>
                Tscorp
              </small>
            </div>
          )}
        </a>

        {/* 메뉴 영역 */}
        <nav
          className={cn('flex flex-col flex-1 min-h-0', collapsed ? 'gap-1 px-1.5 py-3' : 'gap-0.5 px-2 py-3')}
        >
          {isLoading ? (
            <div className="px-3 py-2 text-xs" style={{ color: 'hsl(var(--sidebar-fg-muted))' }}>
              {collapsed ? '…' : '메뉴 로딩 중…'}
            </div>
          ) : error ? (
            <div className="px-3 py-2 text-xs text-destructive">{collapsed ? '!' : '메뉴 로드 실패'}</div>
          ) : (
            menus?.map((item) => (
              <SidebarMenuItem
                key={item.menuId}
                item={item}
                depth={0}
                currentPath={location.pathname}
                opens={opens}
                onToggle={toggle}
                variant={collapsed ? 'collapsed-popout' : 'inline'}
              />
            ))
          )}
        </nav>

        {/* 사용자 영역 */}
        {user && (
          <div className={cn('border-t border-[hsl(var(--sidebar-border))]', collapsed ? 'px-1 py-2' : 'px-2 py-2')}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-md hover:bg-muted/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    collapsed ? 'justify-center p-1' : 'px-2 py-2'
                  )}
                  style={{ color: 'hsl(var(--sidebar-fg))' }}
                  aria-label="사용자 메뉴"
                >
                  <DiceBearAvatar
                    seed={user.avatarSeed || user.email}
                    style={(user.avatarStyle as AvatarStyleKey) || DEFAULT_AVATAR_STYLE}
                    size={32}
                    name={user.accountName}
                  />
                  {!collapsed && (
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <span className="text-[13px] font-semibold truncate w-full text-left">
                        {user.accountName}
                      </span>
                      <span
                        className="text-[11px] truncate w-full text-left"
                        style={{ color: 'hsl(var(--sidebar-fg-muted))' }}
                      >
                        {user.role}
                      </span>
                    </div>
                  )}
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

      <ProfileEditForm open={profileOpen} onOpenChange={setProfileOpen} />
    </TooltipProvider>
  )
}
