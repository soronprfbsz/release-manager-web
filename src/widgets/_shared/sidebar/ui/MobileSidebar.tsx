/**
 * MobileSidebar — 모바일 (<768px) 에서만 렌더되는 Sheet drawer.
 *
 * mobileOpen 으로 open 상태 제어. 라우트 변경 감지 시 자동 close.
 */

import { useEffect, useMemo, useState } from 'react'

import { LogOut, User } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import { ProfileEditForm } from '@/widgets/_shared/profile-edit'

import { useMenus, type MenuItem } from '@/entities/_shared/menu'

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
import { Sheet, SheetContent, SheetTitle } from '@/shared/ui/sheet'

import { SidebarMenuItem } from './SidebarMenuItem'
import { hasActiveDescendant } from '../lib/menu-active'


export function MobileSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const open = useSidebarStore((s) => s.mobileOpen)
  const setMobile = useSidebarStore((s) => s.setMobile)
  const closeMobile = useSidebarStore((s) => s.closeMobile)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { data: menus, isLoading, error } = useMenus()

  const [profileOpen, setProfileOpen] = useState(false)

  // 라우트 변경 시 자동 close — 메뉴 클릭 후 페이지 이동되면 drawer 닫힘
  useEffect(() => {
    closeMobile()
  }, [location.pathname, closeMobile])

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

  const handleLogout = () => {
    logout()
    closeMobile()
    navigate('/login')
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setMobile}>
        <SheetContent
          side="left"
          className="w-72 p-0 flex flex-col slab"
        >
          <SheetTitle className="sr-only">주 메뉴</SheetTitle>

          {/* 로고 영역 */}
          <div className="flex items-center gap-2.5 h-16 px-4 border-b border-[hsl(var(--sidebar-border))] flex-none">
            <span
              className="inline-grid place-items-center w-[30px] h-[30px] rounded-md text-white text-[13px] font-extrabold tracking-[0.5px]"
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
                Tscorp
              </small>
            </div>
          </div>

          {/* 메뉴 영역 */}
          <nav className="flex flex-col gap-0.5 px-2 py-3 flex-1 min-h-0 overflow-y-auto">
            {isLoading ? (
              <div className="px-3 py-2 text-xs" style={{ color: 'hsl(var(--sidebar-fg-muted))' }}>
                메뉴 로딩 중…
              </div>
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
                  variant="inline"
                  onNavigate={closeMobile}
                />
              ))
            )}
          </nav>

          {/* 사용자 영역 */}
          {user && (
            <div className="border-t border-[hsl(var(--sidebar-border))] px-2 py-2">
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
        </SheetContent>
      </Sheet>

      <ProfileEditForm open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  )
}
