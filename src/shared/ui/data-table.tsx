import * as React from "react"
import { cn } from "@/shared/lib/utils"
import { ScrollArea } from "./scroll-area"

/**
 * 데이터 테이블 래퍼 컴포넌트
 * - shadcn ScrollArea 기반으로 테마에 맞는 스크롤바 스타일 제공
 * - 테이블 영역의 고정 높이를 설정하고, 내용이 넘치면 스크롤 표시
 *
 * 사용 예:
 * <DataTable visibleRows={10}>
 *   <Table>...</Table>
 * </DataTable>
 */
interface DataTableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  /** 테이블 영역에 표시할 row 수 기준 (기본: 10) - 이 값으로 영역 높이 계산 */
  visibleRows?: number
  /** row 높이 (기본: 41px - border 포함) */
  rowHeight?: number
  /** 헤더 높이 (기본: 36px - border 포함) */
  headerHeight?: number
  /** 스크롤 없이 전체 표시 (높이 제한 없음) */
  autoHeight?: boolean
}

export function DataTable({
  children,
  className,
  visibleRows = 10,
  rowHeight = 41,
  headerHeight = 41,
  autoHeight = false,
}: DataTableProps) {
  if (autoHeight) {
    return (
      <div className={cn("w-full rounded-md border", className)}>
        {children}
      </div>
    )
  }

  // 테이블 영역 높이 계산: 헤더 + (row 높이 * visibleRows)
  const tableHeight = headerHeight + (rowHeight * visibleRows)

  return (
    <ScrollArea
      className={cn("rounded-md border", className)}
      style={{ height: tableHeight }}
    >
      {children}
    </ScrollArea>
  )
}
