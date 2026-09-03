import * as React from "react"
import { useRef, useState, useEffect } from "react"

import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react"

import { cn } from "@/shared/lib/utils"

import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <table
    ref={ref}
    // 테이블은 자기 면을 갖는다 — bg-card(= 크롬과 같은 값). 헤더 띠(bg-muted)가
    // 이 면 위에서 한 단계 진하게 읽힌다. 카드 안에 놓이면 같은 색이라 겹쳐 보이지 않는다.
    className={cn("w-full caption-bottom text-sm bg-card", className)}
    {...props}
  />
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      // 헤더 띠는 --muted. 예전엔 bg-background 였는데 콘텐츠 면이 단색이 되면서
      // 같은 색이 되어 띠가 사라졌다. sticky 라 반드시 불투명색이어야 한다.
      "[&_tr]:border-0 sticky top-0 z-10 bg-muted [&_tr]:border-b [&_tr]:border-border",
      className
    )}
    {...props}
  />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:hover]:bg-foreground/[0.045]", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-border transition-colors data-[state=selected]:bg-accent",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-9 px-3 text-left align-middle text-xs font-semibold text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-3 py-1.5 align-middle text-sm [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

/**
 * TruncatedText - 텍스트 축약 및 툴팁 컴포넌트
 * 내용이 잘렸을 때만 마우스 오버 시 툴팁 표시
 */
interface TruncatedTextProps {
  children: React.ReactNode
  className?: string
  /** 최대 줄 수 (기본: 1) */
  maxLines?: 1 | 2 | 3
}

function TruncatedText({ children, className, maxLines = 1 }: TruncatedTextProps) {
  const textRef = useRef<HTMLSpanElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  useEffect(() => {
    const checkTruncation = () => {
      const element = textRef.current
      if (element) {
        // scrollWidth > clientWidth (가로 축약) 또는 scrollHeight > clientHeight (세로 축약)
        setIsTruncated(
          element.scrollWidth > element.clientWidth ||
          element.scrollHeight > element.clientHeight
        )
      }
    }

    checkTruncation()

    // ResizeObserver로 크기 변화 감지
    const element = textRef.current
    if (element) {
      const observer = new ResizeObserver(checkTruncation)
      observer.observe(element)
      return () => observer.disconnect()
    }
  }, [children])

  const lineClampClass = maxLines === 1 ? 'truncate' : maxLines === 2 ? 'line-clamp-2' : 'line-clamp-3'

  const content = (
    <span
      ref={textRef}
      className={cn(lineClampClass, 'block', className)}
    >
      {children}
    </span>
  )

  if (!isTruncated) {
    return content
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {content}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-md whitespace-pre-wrap break-all">
        {children}
      </TooltipContent>
    </Tooltip>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  SortableTableHead,
  TruncatedText,
}

interface SortableTableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  id: string
  currentSort: { key: string; direction: 'asc' | 'desc' } | null
  onSort: (key: string) => void
  children: React.ReactNode
}

const SortableTableHead = React.forwardRef<HTMLTableCellElement, SortableTableHeadProps>(
  ({ className, id, currentSort, onSort, children, ...props }, ref) => {
    const isSorted = currentSort?.key === id
    const direction = isSorted ? currentSort.direction : null

    // text-center 또는 text-right 클래스가 있으면 flex 정렬에 반영
    const isCenter = className?.includes('text-center')
    const isRight = className?.includes('text-right')

    return (
      <TableHead
        ref={ref}
        className={cn('cursor-pointer select-none hover:bg-foreground/[0.09] transition-colors', className)}
        onClick={() => onSort(id)}
        {...props}
      >
        <div className={cn(
          "flex items-center gap-1",
          isCenter && "justify-center",
          isRight && "justify-end"
        )}>
          {children}
          {direction === 'asc' ? (
            <ArrowUp className="h-3 w-3" />
          ) : direction === 'desc' ? (
            <ArrowDown className="h-3 w-3" />
          ) : (
            <ChevronsUpDown className="h-3 w-3 opacity-50" />
          )}
        </div>
      </TableHead>
    )
  }
)
SortableTableHead.displayName = 'SortableTableHead'
