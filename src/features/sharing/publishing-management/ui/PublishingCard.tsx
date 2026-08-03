/**
 * Publishing Card
 * 퍼블리싱 카드 컴포넌트 (ServiceCard 패턴 적용)
 */

import { ChevronDown, Download, ExternalLink, FileText, FolderSearch, GripVertical, Pencil, Trash2 } from 'lucide-react'

import type { PublishingListItem } from '@/entities/infrastructure/publishing'
import { publishingApi } from '@/entities/infrastructure/publishing'

import { resolveGlyph, getGlyphFontSizeClass } from '@/shared/lib/glyph'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

import { getSubCategoryLabel } from '../lib/publishingHelpers'

interface PublishingCardProps {
  publishing: PublishingListItem
  onDelete?: (publishing: PublishingListItem) => void
  onEdit?: (publishing: PublishingListItem) => void
  onViewFiles?: (publishing: PublishingListItem) => void
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
}

export function PublishingCard({
  publishing,
  onDelete,
  onEdit,
  onViewFiles,
  dragHandleProps,
}: PublishingCardProps) {
  const { text: glyphText, glyphClass } = resolveGlyph({
    name: publishing.publishingName,
    glyphText: publishing.glyphText,
    glyphBackgroundColor: publishing.glyphBackgroundColor,
  })
  const fontSizeClass = getGlyphFontSizeClass(glyphText)

  const htmlFiles = publishing.htmlFiles || []

  const handleOpenHtmlFile = (serveUrl: string) => {
    const fullUrl = `${import.meta.env.VITE_API_BASE_URL || ''}${serveUrl}`
    window.open(fullUrl, '_blank')
  }

  const handleDownload = () => {
    publishingApi.download(publishing.publishingId)
  }

  const subCategoryLabel = publishing.subCategory
    ? getSubCategoryLabel(publishing.subCategory)
    : null

  return (
    <div className="group relative h-full">
      {/* 드래그 핸들 */}
      {dragHandleProps && (
        <button
          type="button"
          className={cn(
            'absolute -left-4 -top-2 z-10',
            'flex items-center justify-center w-5 h-16',
            'cursor-grab active:cursor-grabbing',
            'text-muted-foreground hover:text-foreground',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-150'
          )}
          aria-label="카드 이동"
          {...dragHandleProps}
        >
          <GripVertical className="h-5 w-5" />
        </button>
      )}

      <Card
        className={cn(
          'overflow-hidden transition-all duration-200',
          'h-full flex flex-col',
          'bg-card border hover:border-foreground/20'
        )}
      >
        <CardHeader className="pb-3 pt-4 px-4">
          {/* 상단 행: 글리프 + 퍼블리싱명 + 호버 액션 */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* 글리프 배지 */}
              <div
                className={cn(
                  'flex-shrink-0 h-10 w-10 rounded-md flex items-center justify-center',
                  'font-mono font-semibold select-none',
                  fontSizeClass,
                  glyphClass
                )}
              >
                {glyphText}
              </div>

              {/* 퍼블리싱명 + 서브카테고리 */}
              <div className="flex-1 min-w-0 pt-0.5">
                <h3 className="font-semibold text-base leading-tight truncate">
                  {publishing.publishingName}
                </h3>
                {(subCategoryLabel || publishing.description) && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {subCategoryLabel || publishing.description}
                  </p>
                )}
              </div>
            </div>

            {/* 우상단 액션 버튼 — 호버 시만 표시 */}
            <div
              className={cn(
                'flex items-center gap-0.5 flex-shrink-0',
                'opacity-0 group-hover:opacity-100 transition-opacity duration-150'
              )}
            >
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(publishing)}
                  className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/20"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
              {onViewFiles && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewFiles(publishing)}
                  className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/20"
                >
                  <FolderSearch className="h-3.5 w-3.5" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(publishing)}
                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* 점선 구분선 */}
        <div className="mx-4 border-t border-dashed border-border" />

        <CardContent className="pt-3 px-4 pb-4 flex-1 min-h-[100px] flex flex-col justify-between">
          {/* 메타 정보 */}
          <div className="flex-1">
            {publishing.siteName && (
              <p className="text-xs text-muted-foreground mb-1">
                {publishing.siteName}
              </p>
            )}
            {publishing.description && subCategoryLabel && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {publishing.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              파일 {publishing.fileCount}개
            </p>
          </div>

          {/* 하단 액션 버튼 */}
          <div className="flex gap-2 mt-3">
            {/* 열기 버튼 */}
            {htmlFiles.length === 0 ? (
              <Button variant="outline" className="flex-1" disabled>
                <ExternalLink className="h-4 w-4 mr-2" />
                열기
              </Button>
            ) : htmlFiles.length === 1 ? (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleOpenHtmlFile(htmlFiles[0].serveUrl)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                열기
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    열기
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {htmlFiles.map((htmlFile) => (
                    <DropdownMenuItem
                      key={htmlFile.fileName}
                      onClick={() => handleOpenHtmlFile(htmlFile.serveUrl)}
                      className="cursor-pointer"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {htmlFile.fileName}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* 다운로드 버튼 */}
            <Button variant="outline" className="flex-1" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              다운로드
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
