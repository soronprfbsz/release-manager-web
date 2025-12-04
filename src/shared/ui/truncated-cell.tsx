import * as React from "react"
import { cn } from "@/shared/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./tooltip"

interface TruncatedCellProps {
  children: React.ReactNode
  className?: string
  /** 툴팁에 표시할 텍스트 (필수) */
  tooltipText: string
  /** 최대 줄 수 (기본: 1) */
  maxLines?: 1 | 2 | 3
}

/**
 * 테이블 셀 내용이 넘칠 때 말줄임표로 표시하고
 * hover 시 툴팁으로 전체 내용을 보여주는 컴포넌트
 */
export function TruncatedCell({
  children,
  className,
  tooltipText,
  maxLines = 1,
}: TruncatedCellProps) {
  const textRef = React.useRef<HTMLDivElement>(null)
  const [isTruncated, setIsTruncated] = React.useState(false)

  const lineClampClass = {
    1: "line-clamp-1",
    2: "line-clamp-2",
    3: "line-clamp-3",
  }[maxLines]

  // 텍스트가 잘렸는지 확인
  React.useEffect(() => {
    const checkTruncation = () => {
      const element = textRef.current
      if (element) {
        const isOverflowing =
          element.scrollWidth > element.clientWidth ||
          element.scrollHeight > element.clientHeight
        setIsTruncated(isOverflowing)
      }
    }

    checkTruncation()

    const element = textRef.current
    if (element) {
      const resizeObserver = new ResizeObserver(checkTruncation)
      resizeObserver.observe(element)
      return () => resizeObserver.disconnect()
    }
  }, [children])

  // 툴팁 텍스트가 없으면 툴팁 없이 렌더링
  if (!tooltipText) {
    return (
      <div
        ref={textRef}
        className={cn(
          "overflow-hidden text-ellipsis",
          lineClampClass,
          className
        )}
      >
        {children}
      </div>
    )
  }

  return (
    <Tooltip open={isTruncated ? undefined : false}>
      <TooltipTrigger asChild>
        <div
          ref={textRef}
          className={cn(
            "overflow-hidden text-ellipsis",
            lineClampClass,
            className
          )}
        >
          {children}
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm whitespace-pre-wrap break-words">
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  )
}
