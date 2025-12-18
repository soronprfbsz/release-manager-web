import { Link } from 'react-router-dom'

import { useMenuPath } from '@/shared/lib/hooks/use-menu-path'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'

import { ROUTES } from '@/shared/config/constants'

/**
 * 메뉴 데이터를 기반으로 자동으로 Breadcrumb을 생성하는 컴포넌트
 */
export function DynamicBreadcrumb() {
  const menuPath = useMenuPath()

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* 홈 링크 */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to={ROUTES.HOME}>홈</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {menuPath.map((item, index) => {
          const isLast = index === menuPath.length - 1

          return (
            <div key={`${item.label}-${index}`} className="flex items-center gap-2">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast || !item.path ? (
                  // 마지막 아이템이거나 path가 없으면 현재 페이지로 표시
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  // 중간 아이템은 링크로 표시
                  <BreadcrumbLink asChild>
                    <Link to={item.path}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
