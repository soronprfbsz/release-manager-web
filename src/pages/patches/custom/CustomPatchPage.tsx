import { GitBranch, Construction } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Breadcrumb } from '@/shared/ui/breadcrumb'

export function CustomPatchPage() {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between h-9">
        <Breadcrumb
          items={[
            { label: '패치 관리' },
            { label: '커스텀 패치본' },
          ]}
        />
      </div>

      {/* 준비 중 안내 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            커스텀 패치본
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Construction className="h-16 w-16 mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">준비 중입니다</h3>
            <p className="text-sm text-center max-w-md">
              커스텀 릴리즈 기반 패치 생성 기능은 현재 개발 중입니다.
              <br />
              고객사별 맞춤 패치 생성이 곧 지원될 예정입니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

