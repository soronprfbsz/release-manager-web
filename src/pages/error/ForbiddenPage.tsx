/**
 * Forbidden Page (403)
 * 접근 권한이 없을 때 표시되는 에러 페이지
 * MainLayout 내부에서 렌더링됨
 */

import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, ShieldX } from 'lucide-react'

import { Button } from '@/shared/ui/button'

export function ForbiddenPage() {
  const navigate = useNavigate()

  return (
    <div className="bg-background flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 8rem)' }}>
      <div className="max-w-md w-full text-center">
        {/* 403 숫자 */}
        <div className="relative mb-8">
          <h1 className="text-[10rem] font-bold leading-none text-primary/10 select-none">
            403
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <ShieldX className="h-24 w-24 text-primary/40" />
          </div>
        </div>

        {/* 메시지 */}
        <div className="space-y-3 mb-8">
          <h2 className="text-2xl font-bold text-foreground">
            접근 권한이 없습니다
          </h2>
          <p className="text-muted-foreground">
            이 페이지에 접근할 수 있는 권한이 없습니다. 관리자에게 문의해주세요.
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            이전 페이지
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            홈으로 이동
          </Button>
        </div>

        {/* 추가 도움말 */}
        <p className="mt-8 text-xs text-muted-foreground">
          문제가 지속되면 관리자에게 문의해주세요.
        </p>
      </div>
    </div>
  )
}
