import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'
import { Button } from './button'

interface DataTablePaginationProps {
  pageIndex: number
  pageSize: number
  totalElements: number
  onPaginationChange: (updater: { pageIndex: number; pageSize: number }) => void
}

export function DataTablePagination({
  pageIndex,
  pageSize,
  totalElements,
  onPaginationChange,
}: DataTablePaginationProps) {
  const pageCount = Math.ceil(totalElements / pageSize)

  const handlePageSizeChange = (value: string) => {
    onPaginationChange({
      pageIndex: 0,
      pageSize: Number(value),
    })
  }

  const handleFirstPage = () => {
    onPaginationChange({ pageIndex: 0, pageSize })
  }

  const handlePreviousPage = () => {
    onPaginationChange({ pageIndex: Math.max(0, pageIndex - 1), pageSize })
  }

  const handleNextPage = () => {
    onPaginationChange({ pageIndex: Math.min(pageCount - 1, pageIndex + 1), pageSize })
  }

  const handleLastPage = () => {
    onPaginationChange({ pageIndex: pageCount - 1, pageSize })
  }

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        총 {totalElements}개
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">페이지 당 항목 수</p>
          <Select
            value={`${pageSize}`}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {pageIndex + 1} of {pageCount}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={handleFirstPage}
            disabled={pageIndex === 0}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={handlePreviousPage}
            disabled={pageIndex === 0}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={handleNextPage}
            disabled={pageIndex >= pageCount - 1}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={handleLastPage}
            disabled={pageIndex >= pageCount - 1}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
