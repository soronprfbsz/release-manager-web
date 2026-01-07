import { LogOut, ChevronDown } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

import { useMenus, type MenuItem } from '@/entities/_shared/menu'

import { ProjectSelector } from '@/widgets/_shared/project-selector'
import { ThemeToggle } from '@/widgets/_shared/theme-toggle'

import { ROUTES } from '@/shared/config/constants'
import { getMenuIconById } from '@/shared/config/menu-icons'
import { cn } from '@/shared/lib/utils'
import { useAuthStore } from '@/shared/store'
import { Avatar } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
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

  // 메뉴 데이터 (이미 MenuItem[] 형식)
  const menuItems = menusData || []

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-16 items-center px-12">
        {/* 좌측: 로고 */}
        <div className="flex-1">
          <a
            href={ROUTES.HOME}
            onClick={handleLogoClick}
            className="flex items-center w-fit cursor-pointer"
          >
            <span className="font-bold text-lg hover:text-primary transition-colors">Release Manager</span>
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
                        {(() => {
                          // description이 표시되는 아이템이 있는지 확인 (2-depth, 3-depth 모두)
                          const hasVisibleDescription = item.children!.some((child) => {
                            if (child.isDescriptionVisible && child.description) return true
                            if (child.children && child.children.length > 0) {
                              return child.children.some(
                                (subChild) => subChild.isDescriptionVisible && subChild.description
                              )
                            }
                            return false
                          })

                          // 실제로 2 column이 필요한지 확인
                          // - hasVisibleDescription이 true인 그룹이 있거나
                          // - isLineBreak이 아닌 아이템이 2개 이상 같은 그룹에 있는 경우
                          const needsTwoColumns = item.children!.some((child) => {
                            if (child.children && child.children.length > 0) {
                              const filteredChildren = child.children.filter(subChild => subChild.path)
                              const hasAnyDesc = filteredChildren.some(c => c.isDescriptionVisible && c.description)
                              // description이 있으면 2 column 필요
                              if (hasAnyDesc) return true
                              // isLineBreak이 아닌 아이템이 2개 이상이면 2 column 필요
                              const nonLineBreakItems = filteredChildren.filter(c => !c.isLineBreak)
                              return nonLineBreakItems.length >= 2
                            }
                            // 2-depth 직접 아이템의 경우
                            if (!child.isLineBreak && child.isDescriptionVisible && child.description) return true
                            return false
                          })

                          const columnWidth = hasVisibleDescription ? 280 : 140
                          const minWidth = needsTwoColumns ? 2 * columnWidth : columnWidth

                          return (
                            <div className="p-3" style={{ minWidth: `${minWidth}px` }}>
                              <div className={cn('grid gap-3', needsTwoColumns ? 'grid-cols-2' : 'grid-cols-1')}>
                                {item.children!.map((child, childIndex) => {
                                  const hasChildren = child.children && child.children.length > 0

                                  if (hasChildren) {
                                    return (
                                      <div
                                        key={child.label}
                                        className={cn(
                                          'col-span-2',
                                          childIndex > 0 && 'pt-1.5'
                                        )}
                                      >
                                        {/* 섹션 헤더 */}
                                        <div className="mb-1.5 px-1">
                                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {child.label}
                                          </span>
                                        </div>
                                        {/* 3-depth 아이템들 */}
                                        {(() => {
                                          const filteredChildren = child.children!.filter(subChild => subChild.path)
                                          const hasAnyDesc = filteredChildren.some(c => c.isDescriptionVisible && c.description)
                                          return (
                                            <div className={cn('grid gap-1', hasAnyDesc ? 'grid-cols-2' : 'grid-cols-1')}>
                                              {filteredChildren.map((subChild) => {
                                                const hasDesc = subChild.isDescriptionVisible && subChild.description
                                                const icon = getMenuIconById(subChild.menuId)
                                                return (
                                                  <NavigationMenuLink key={subChild.label} asChild>
                                                    <Link
                                                      to={subChild.path!}
                                                      className={cn(
                                                        'group/item flex items-start gap-2 rounded-md transition-all duration-200',
                                                        hasDesc ? 'p-2' : 'px-2 py-1.5',
                                                        subChild.isLineBreak && 'col-span-2'
                                                      )}
                                                    >
                                                      {hasDesc && icon && (
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-colors duration-200">
                                                          {icon}
                                                        </div>
                                                      )}
                                                      <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium leading-tight group-hover/item:text-primary transition-colors">
                                                          {subChild.label}
                                                        </div>
                                                        {hasDesc && (
                                                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                            {subChild.description}
                                                          </p>
                                                        )}
                                                      </div>
                                                    </Link>
                                                  </NavigationMenuLink>
                                                )
                                              })}
                                            </div>
                                          )
                                        })()}
                                      </div>
                                    )
                                  } else {
                                    return <ModernListItem key={child.label} item={child} />
                                  }
                                })}
                              </div>
                            </div>
                          )
                        })()}
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
          <ThemeToggle />
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar name={user.accountName} size="sm" />
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-3">
                    <Avatar name={user.accountName} size="md" />
                    <div className="flex flex-col space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium leading-none">{user.accountName}</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-none">{user.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}

interface ModernListItemProps {
  item: MenuItem
}

function ModernListItem({ item }: ModernListItemProps) {
  if (!item.path) return null

  const hasDesc = item.isDescriptionVisible && item.description
  const icon = getMenuIconById(item.menuId)

  return (
    <div className={cn(item.isLineBreak && 'col-span-2')}>
      <NavigationMenuLink asChild>
        <Link
          to={item.path}
          className={cn(
            'group/item flex items-start gap-2 rounded-md transition-all duration-200',
            hasDesc ? 'p-2' : 'px-2 py-1.5'
          )}
        >
          {hasDesc && icon && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-colors duration-200">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium leading-tight group-hover/item:text-primary transition-colors">
              {item.label}
            </div>
            {hasDesc && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>
        </Link>
      </NavigationMenuLink>
    </div>
  )
}
