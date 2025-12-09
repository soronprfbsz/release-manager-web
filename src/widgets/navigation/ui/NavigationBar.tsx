import * as React from 'react'

import { LogOut, Package } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

import { useMenus } from '@/entities/menu'

import { ProjectSelector } from '@/widgets/project-selector'
import { ThemeToggle } from '@/widgets/theme-toggle/ui/ThemeToggle'

import { ROUTES } from '@/shared/config/constants'
import { convertMenuResponseToMenuItem } from '@/shared/lib/menu-mapper'
import { cn } from '@/shared/lib/utils'
import { useAuthStore } from '@/shared/store'
import { Button } from '@/shared/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/shared/ui/navigation-menu'

export function NavigationBar() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const location = useLocation()

  // 동적 메뉴 데이터 로드
  const { data: menusData, isLoading: isMenusLoading, error: menusError } = useMenus()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // 이미 홈이면 네비게이션 스킵, 아니면 홈으로 이동
    if (location.pathname !== ROUTES.HOME) {
      navigate(ROUTES.HOME)
    }
  }

  // 메뉴 데이터를 MenuItem 형식으로 변환
  const menuItems = React.useMemo(() => {
    if (!menusData) return []
    return menusData.map(convertMenuResponseToMenuItem)
  }, [menusData])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-16 items-center px-12">
        {/* 좌측: 로고 */}
        <div className="flex-1">
          <a
            href={ROUTES.HOME}
            onClick={handleLogoClick}
            className="flex items-center gap-2 w-fit group cursor-pointer"
          >
            <Package className="h-6 w-6 group-hover:animate-spin-slow" />
            <span className="font-bold text-lg">Release Manager</span>
          </a>
        </div>

        {/* 센터: 메뉴 */}
        {isMenusLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
          </div>
        ) : menusError ? (
          <div className="text-sm text-destructive">메뉴 로드 실패</div>
        ) : (
          <NavigationMenu>
            <NavigationMenuList>
              {menuItems.map((item) => (
                <NavigationMenuItem key={item.label}>
                  {item.children && item.children.length > 0 ? (
                    <>
                      <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[200px] gap-1 p-2">
                          {item.children.map((child) => (
                            <ListItem
                              key={child.label}
                              title={child.label}
                              href={child.path!}
                            />
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink asChild>
                      <Link to={item.path!} className={navigationMenuTriggerStyle()}>
                        {item.label}
                      </Link>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        )}

        {/* 우측: 프로젝트 선택 및 사용자 정보 */}
        <div className="flex-1 flex items-center justify-end gap-3">
          <ProjectSelector />
          <div className="h-4 w-px bg-border" />
          {user && (
            <span className="text-sm text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
              {user.accountName}
            </span>
          )}
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">로그아웃</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

interface ListItemProps {
  className?: string
  title: string
  href: string
}

const ListItem = React.forwardRef<HTMLAnchorElement, ListItemProps>(
  ({ className, title, href }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <Link
            ref={ref}
            to={href}
            className={cn(
              'block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
              className
            )}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
          </Link>
        </NavigationMenuLink>
      </li>
    )
  }
)
ListItem.displayName = 'ListItem'
