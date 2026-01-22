/**
 * Excel Viewer Component
 * Excel/CSV 파일을 표시하는 뷰어 컴포넌트
 */

import { useState, useCallback, useMemo, useEffect } from 'react'

import * as XLSX from 'xlsx'
import { Loader2, Info } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { ScrollArea, ScrollBar } from '@/shared/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { TypographyMuted } from '@/shared/ui/typography'

// 미리보기 제한 설정
const PREVIEW_ROWS_LIMIT = 1000 // 미리보기 최대 행 수

/** 파일 크기 제한 에러인지 확인 */
function isFileSizeLimitError(error: Error | null | undefined): boolean {
  if (!error) return false
  const message = error.message || ''
  return message.includes('파일 크기가 너무 큽니다') || message.includes('최대 10MB')
}

/** 파일 크기 포맷팅 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/** 에러 메시지에서 파일 크기 정보 추출 */
function parseFileSizeFromError(error: Error | null | undefined): { currentSize: string; maxSize: string } | null {
  if (!error) return null
  const message = error.message || ''

  // "(최대 10MB): 485622000 bytes" 형식에서 추출
  const maxMatch = message.match(/최대\s*(\d+(?:\.\d+)?)\s*(MB|KB|GB)/i)
  const bytesMatch = message.match(/:\s*(\d+)\s*bytes/i)

  if (!maxMatch || !bytesMatch) return null

  const maxSize = `${maxMatch[1]}${maxMatch[2]}`
  const currentBytes = parseInt(bytesMatch[1], 10)
  const currentSize = formatFileSize(currentBytes)

  return { currentSize, maxSize }
}

interface ExcelViewerProps {
  /** Excel 파일 Blob 데이터 */
  file: Blob | null
  /** 로딩 상태 */
  isLoading?: boolean
  /** 에러 */
  error?: Error | null
}

interface SheetData {
  name: string
  headers: string[]
  rows: (string | number | boolean | null)[][]
  totalRows: number
  isTruncated: boolean
}

export function ExcelViewer({ file, isLoading = false, error = null }: ExcelViewerProps) {
  const [sheets, setSheets] = useState<SheetData[]>([])
  const [activeSheet, setActiveSheet] = useState(0)
  const [parseError, setParseError] = useState<Error | null>(null)
  const [isParsing, setIsParsing] = useState(false)

  // Excel 파일 파싱
  useEffect(() => {
    if (!file) {
      setSheets([])
      setActiveSheet(0)
      return
    }

    const parseExcel = async () => {
      setIsParsing(true)
      setParseError(null)

      try {
        const arrayBuffer = await file.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })

        const parsedSheets: SheetData[] = workbook.SheetNames.map((sheetName) => {
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(
            worksheet,
            { header: 1, defval: null }
          )

          // 빈 행 제거
          const nonEmptyRows = jsonData.filter((row) =>
            row.some((cell) => cell !== null && cell !== '')
          )

          // 첫 행을 헤더로 사용
          const headers = nonEmptyRows.length > 0
            ? (nonEmptyRows[0] as (string | number | boolean | null)[]).map((h, i) =>
                h !== null && h !== '' ? String(h) : `Column ${i + 1}`
              )
            : []

          // 데이터 행 (헤더 제외)
          const dataRows = nonEmptyRows.slice(1)
          const totalRows = dataRows.length
          const isTruncated = totalRows > PREVIEW_ROWS_LIMIT
          const displayRows = isTruncated ? dataRows.slice(0, PREVIEW_ROWS_LIMIT) : dataRows

          return {
            name: sheetName,
            headers,
            rows: displayRows,
            totalRows,
            isTruncated,
          }
        })

        setSheets(parsedSheets)
        setActiveSheet(0)
      } catch (err) {
        setParseError(err instanceof Error ? err : new Error('Excel 파일 파싱 실패'))
      } finally {
        setIsParsing(false)
      }
    }

    parseExcel()
  }, [file])

  const currentSheet = useMemo(() => sheets[activeSheet] || null, [sheets, activeSheet])

  const handleSheetChange = useCallback((index: number) => {
    setActiveSheet(index)
  }, [])

  // 셀 값 포맷팅
  const formatCellValue = useCallback((value: string | number | boolean | null): string => {
    if (value === null || value === undefined) return ''
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
    return String(value)
  }, [])

  if (isLoading || isParsing) {
    return (
      <div className="flex items-center justify-center p-8 gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-muted-foreground">Excel 파일 로딩 중...</span>
      </div>
    )
  }

  if (error || parseError) {
    const displayError = error || parseError
    const sizeInfo = parseFileSizeFromError(displayError)
    return (
      <div className="flex items-center justify-center p-8">
        {isFileSizeLimitError(displayError) ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-3 rounded-full bg-muted">
              <Info className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                파일 크기가 커서 미리보기가 제한됩니다
              </p>
              {sizeInfo && (
                <p className="text-sm text-muted-foreground mt-1">
                  현재 파일: {sizeInfo.currentSize} / 최대: {sizeInfo.maxSize}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                파일을 다운로드하여 내용을 확인해주세요.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-destructive text-center">
            <div>Excel 파일을 불러오는데 실패했습니다.</div>
            {displayError?.message && (
              <div className="text-sm mt-2 text-muted-foreground">{displayError.message}</div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (!file || sheets.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <TypographyMuted>Excel 파일이 없거나 데이터가 비어있습니다.</TypographyMuted>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* 시트 탭 (여러 시트가 있을 때만 표시) */}
      {sheets.length > 1 && (
        <div className="flex items-center gap-1 p-2 border-b bg-muted/30 overflow-x-auto">
          {sheets.map((sheet, index) => (
            <button
              key={sheet.name}
              onClick={() => handleSheetChange(index)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap',
                index === activeSheet
                  ? 'bg-background text-foreground shadow-sm border'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {sheet.name}
            </button>
          ))}
        </div>
      )}

      {/* 행 수 정보 및 truncation 경고 */}
      {currentSheet && (
        <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/20 text-sm text-muted-foreground">
          <span>
            {currentSheet.isTruncated
              ? `${PREVIEW_ROWS_LIMIT.toLocaleString()} / ${currentSheet.totalRows.toLocaleString()} 행 표시 (미리보기 제한)`
              : `${currentSheet.totalRows.toLocaleString()} 행`}
          </span>
          <span>{currentSheet.headers.length} 열</span>
        </div>
      )}

      {/* 테이블 데이터 */}
      {currentSheet && (
        <ScrollArea className="flex-1">
          <div className="min-w-max">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-center sticky left-0 bg-muted z-10">#</TableHead>
                  {currentSheet.headers.map((header, index) => (
                    <TableHead
                      key={index}
                      className="min-w-[100px] max-w-[300px] truncate"
                      title={header}
                    >
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentSheet.rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={currentSheet.headers.length + 1}
                      className="text-center text-muted-foreground py-8"
                    >
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentSheet.rows.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      <TableCell className="text-center text-muted-foreground sticky left-0 bg-background z-10 border-r">
                        {rowIndex + 1}
                      </TableCell>
                      {currentSheet.headers.map((_, colIndex) => (
                        <TableCell
                          key={colIndex}
                          className="min-w-[100px] max-w-[300px] truncate"
                          title={formatCellValue(row[colIndex])}
                        >
                          {formatCellValue(row[colIndex])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  )
}
