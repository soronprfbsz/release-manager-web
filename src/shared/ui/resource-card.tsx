/**
 * Resource Card Base Component
 * 리소스 카드 공통 베이스 컴포넌트
 * - 링크, 파일, 퍼블리싱 등 리소스 카드에서 공통 사용
 * - 높이 통일, 툴팁 처리, 드래그 핸들 등 공통 기능 제공
 */

import { useRef, useState, useEffect, type ReactNode } from 'react'

import { GripVertical, Trash2 } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

interface ResourceCardProps {
  /** 카드 제목 */
  title: string
  /** 카드 부제목 (파일명, URL, 기능명 등) */
  subtitle: ReactNode
  /** 부제목에 font-mono 스타일 적용 여부 (파일/링크용) */
  subtitleMono?: boolean
  /** 설명 (선택, 2줄 제한 및 툴팁 처리) */
  description?: string | null
  /** 아이콘 (ReactNode) */
  icon: ReactNode
  /** 드래그 핸들 props */
  dragHandleProps?: any
  /** 메인 액션 버튼 (다운로드, 열기 등) */
  actionButton: ReactNode
  /** 헤더 액션 버튼들 (수정 등, 삭제 버튼 앞에 배치) */
  headerActions?: ReactNode
  /** 추가 뱃지 영역 (설명 위에 배치) */
  badge?: ReactNode
  /** 삭제 핸들러 (기본 삭제 버튼 사용 시) */
  onDelete?: () => void
}

export function ResourceCard({
  title,
  subtitle,
  subtitleMono = false,
  description,
  icon,
  dragHandleProps,
  actionButton,
  headerActions,
  badge,
  onDelete,
}: ResourceCardProps) {
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  // 텍스트가 잘렸는지 확인
  useEffect(() => {
    const checkTruncation = () => {
      const element = descriptionRef.current
      if (element) {
        setIsTruncated(element.scrollHeight > element.clientHeight)
      }
    }
    checkTruncation()
    // ResizeObserver로 크기 변화 감지
    const element = descriptionRef.current
    if (element) {
      const observer = new ResizeObserver(checkTruncation)
      observer.observe(element)
      return () => observer.disconnect()
    }
  }, [description])

  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-md h-full flex flex-col bg-accent/40 border-border hover:border-primary/50">
      <CardHeader className="pb-3 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* 드래그 핸들 */}
            {dragHandleProps && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-grab active:cursor-grabbing flex-shrink-0"
                {...dragHandleProps}
              >
                <GripVertical className="h-4 w-4" />
              </Button>
            )}

            {/* 아이콘 */}
            <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
              {icon}
            </div>

            {/* 제목 및 부제목 */}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate">
                {title}
              </CardTitle>
              <CardDescription className={cn(
                "text-xs text-muted-foreground truncate",
                subtitleMono && "font-mono"
              )}>
                {subtitle}
              </CardDescription>
            </div>
          </div>

          {/* 헤더 액션 버튼 */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {headerActions}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 mt-auto">
        {/* 뱃지 영역 */}
        {badge && (
          <div className="mb-3">
            {badge}
          </div>
        )}

        {/* 설명 영역 (최소 높이 확보) */}
        <div className="min-h-[2.75rem] mb-3">
          {description ? (
            isTruncated ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <p ref={descriptionRef} className="text-sm text-muted-foreground line-clamp-2 cursor-default">
                    {description}
                  </p>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs whitespace-pre-wrap">
                  {description}
                </TooltipContent>
              </Tooltip>
            ) : (
              <p ref={descriptionRef} className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            )
          ) : null}
        </div>

        {/* 메인 액션 버튼 */}
        {actionButton}
      </CardContent>
    </Card>
  )
}

