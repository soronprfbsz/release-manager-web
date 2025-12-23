/**
 * Resource Card Base Component
 * 리소스 카드 공통 베이스 컴포넌트
 * - 파일 리소스와 링크 리소스 모두에서 사용
 * - 높이 통일, 툴팁 처리, 색상 처리 등 공통 기능 제공
 */

import { useRef, useState, useEffect, type ReactNode } from 'react'
import { GripVertical, Trash2 } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

interface ResourceCardBaseProps {
  /** 카드 제목 */
  title: string
  /** 카드 부제목 (파일명, URL 등) */
  subtitle: string
  /** 설명 (선택, 2줄 제한 및 툴팁 처리) */
  description?: string | null
  /** 아이콘 (ReactNode) */
  icon: ReactNode
  /** 카테고리 인덱스 (색상 결정) */
  categoryIndex?: number
  /** 드래그 핸들 props */
  dragHandleProps?: any
  /** 메인 액션 버튼 (다운로드, 열기 등) */
  actionButton: ReactNode
  /** 헤더 액션 버튼들 (수정, 삭제 등) */
  headerActions?: ReactNode
  /** 삭제 핸들러 (기본 삭제 버튼 사용 시) */
  onDelete?: () => void
}

export function ResourceCardBase({
  title,
  subtitle,
  description,
  icon,
  dragHandleProps,
  actionButton,
  headerActions,
  onDelete,
}: ResourceCardBaseProps) {
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
    <Card className={`group relative overflow-hidden transition-all duration-200 hover:shadow-md h-full flex flex-col bg-card border-border hover:border-primary/50`}>
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
              <CardDescription className="text-xs font-mono text-muted-foreground truncate">
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
