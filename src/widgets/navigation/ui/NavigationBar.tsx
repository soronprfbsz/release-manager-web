import * as React from 'react'

import { LogOut, Rocket } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

import { useMenus, type MenuItem } from '@/entities/menu'

import { ProjectSelector } from '@/widgets/project-selector'
import { ThemeToggle } from '@/widgets/theme-toggle/ui/ThemeToggle'

import { ROUTES } from '@/shared/config/constants'
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
            className="flex items-center gap-2 w-fit cursor-pointer"
          >
            <Rocket className="h-6 w-6" />
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
                        {(() => {
                          // description이 표시되는 아이템이 있는지 확인 (2-depth, 3-depth 모두)
                          const hasVisibleDescription = item.children!.some((child) => {
                            // 2-depth 자체에 description이 있는 경우
                            if (child.isDescriptionVisible && child.description) return true
                            // 3-depth 아이템 중에 description이 있는 경우
                            if (child.children && child.children.length > 0) {
                              return child.children.some(
                                (subChild) => subChild.isDescriptionVisible && subChild.description
                              )
                            }
                            return false
                          })

                          // 그리드는 항상 2열 고정
                          const gridColsClass = 'grid-cols-2'
                          const colSpanClass = 'col-span-2'

                          // 너비 계산: description이 있으면 더 넓게, 없으면 컴팩트하게 (2열 기준)
                          const columnWidth = hasVisibleDescription ? 280 : 100
                          const minWidth = 2 * columnWidth
                          // 패딩과 갭: description이 없으면 더 작게
                          const paddingClass = hasVisibleDescription ? 'p-3' : 'p-2'
                          const gapClass = hasVisibleDescription ? 'gap-2' : 'gap-1'

                          return (
                            <ul className={cn('grid w-auto', gridColsClass, paddingClass, gapClass)} style={{ minWidth: `${minWidth}px` }}>
                              {item.children!.map((child) => {
                                const hasChildren = child.children && child.children.length > 0

                                if (hasChildren) {
                                  // 3-depth가 있는 경우: 섹션 헤더 + 3-depth 아이템들을 하나로 묶음
                                  return (
                                    <li
                                      key={child.label}
                                      className={cn(
                                        colSpanClass,
                                        child.isLineBreak && 'col-start-1'
                                      )}
                                    >
                                      <div className="rounded-lg border bg-muted/50 p-2 mb-2">
                                        {/* 섹션 헤더 */}
                                        <div className="px-1 py-1 text-sm font-semibold mb-1">
                                          {child.label}
                                          {child.isDescriptionVisible && child.description && (
                                            <p className="text-xs font-normal mt-1 opacity-70">
                                              {child.description}
                                            </p>
                                          )}
                                        </div>
                                        {/* 3-depth 아이템들을 그리드로 배치 */}
                                        <div className={cn('grid grid-cols-2', hasVisibleDescription ? 'gap-2' : 'gap-1')}>
                                          {child.children!.filter(subChild => subChild.path).map((subChild) => {
                                            const hasDesc = subChild.isDescriptionVisible && subChild.description
                                            const itemPadding = hasDesc ? 'p-2' : 'py-1.5 px-2'
                                            return (
                                              <div
                                                key={subChild.label}
                                                className={cn(subChild.isLineBreak && 'col-start-1 col-span-2')}
                                              >
                                                <NavigationMenuLink asChild>
                                                  <Link
                                                    to={subChild.path!}
                                                    className={cn(
                                                      'group block select-none rounded-md leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground border border-transparent hover:border-border',
                                                      itemPadding
                                                    )}
                                                  >
                                                    <div className={cn('text-sm leading-tight', hasDesc && 'font-semibold mb-1')}>
                                                      {subChild.label}
                                                    </div>
                                                    {hasDesc && (
                                                      <p className="line-clamp-2 text-xs leading-snug opacity-70">
                                                        {subChild.description}
                                                      </p>
                                                    )}
                                                  </Link>
                                                </NavigationMenuLink>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    </li>
                                  )
                                } else {
                                  // 3-depth가 없는 일반 2-depth 아이템
                                  return <NestedListItem key={child.label} item={child} />
                                }
                              })}
                            </ul>
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

interface NestedListItemProps {
  item: MenuItem
}

function NestedListItem({ item }: NestedListItemProps) {
  // 일반 2depth 아이템 (path가 있어야 함)
  if (!item.path) return null

  const hasDesc = item.isDescriptionVisible && item.description
  const itemPadding = hasDesc ? 'p-2' : 'py-1.5 px-2'

  return (
    <li className={cn(item.isLineBreak && 'col-start-1 col-span-2')}>
      <NavigationMenuLink asChild>
        <Link
          to={item.path}
          className={cn(
            'group block select-none rounded-md leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground border border-transparent hover:border-border',
            itemPadding
          )}
        >
          <div className={cn('text-sm leading-tight', hasDesc && 'font-semibold mb-1')}>{item.label}</div>
          {hasDesc && (
            <p className="line-clamp-2 text-xs leading-snug opacity-70">
              {item.description}
            </p>
          )}
        </Link>
      </NavigationMenuLink>
    </li>
  )
}
