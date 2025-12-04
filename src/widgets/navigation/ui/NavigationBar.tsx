import * as React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { LogOut, Package } from 'lucide-react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/shared/ui/navigation-menu'
import { Button } from '@/shared/ui/button'
import { ThemeToggle } from '@/widgets/theme-toggle/ui/ThemeToggle'
import { useAuth } from '@/app/providers/AuthProvider'
import { menuItems } from '../model/menuItems'
import { ROUTES } from '@/shared/config/constants'
import { cn } from '@/shared/lib/utils'

export function NavigationBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // 대시보드 데이터 새로고침
    queryClient.invalidateQueries({ queryKey: ['dashboard-recent'] })
    // 이미 홈이면 네비게이션 스킵, 아니면 홈으로 이동
    if (location.pathname !== ROUTES.HOME) {
      navigate(ROUTES.HOME)
    }
  }

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
        <NavigationMenu>
          <NavigationMenuList>
            {menuItems.map((item) => (
              <NavigationMenuItem key={item.label}>
                {item.children ? (
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
                  <Link to={item.path!}>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      {item.label}
                    </NavigationMenuLink>
                  </Link>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* 우측: 사용자 정보 */}
        <div className="flex-1 flex items-center justify-end gap-2">
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
