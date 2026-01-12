/**
 * Department Detail Component
 * 선택된 부서 상세 정보 표시 컴포넌트
 */

import { Building2, Users, Layers, FolderTree } from 'lucide-react'

import type { DepartmentDetail as DepartmentDetailType } from '@/entities/_shared/department'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

interface DepartmentDetailProps {
  department: DepartmentDetailType | null
  isLoading: boolean
}

export function DepartmentDetail({ department, isLoading }: DepartmentDetailProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mb-4" />
          <p className="text-sm">로딩 중...</p>
        </CardContent>
      </Card>
    )
  }

  if (!department) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Building2 className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-sm">부서를 선택하세요</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-5 w-5" />
          {department.departmentName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 설명 */}
        {department.description && (
          <div>
            <p className="text-sm text-muted-foreground">{department.description}</p>
          </div>
        )}

        {/* 상위 부서 */}
        <div className="flex items-center gap-2 text-sm">
          <FolderTree className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">상위 부서:</span>
          <span>{department.parentDepartmentName || '없음 (루트)'}</span>
        </div>

        {/* 계층 깊이 */}
        <div className="flex items-center gap-2 text-sm">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">계층 깊이:</span>
          <span>{department.depth}</span>
        </div>

        {/* 하위 부서 수 */}
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">직계 하위 부서:</span>
          <span>{department.childCount}개</span>
        </div>

        {/* 소속 계정 수 */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">소속 계정:</span>
          <span>{department.accountCount}명</span>
        </div>
      </CardContent>
    </Card>
  )
}
