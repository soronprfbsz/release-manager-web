/**
 * Publishing Card Component
 * 퍼블리싱 카드 컴포넌트
 */

import { ChevronDown, Download, Pencil, ExternalLink, FileText, FolderSearch } from 'lucide-react'

import { publishingApi, type PublishingListItem } from '@/entities/infrastructure/publishing'
import { useFileTransferProgress } from '@/shared/lib/hooks/use-file-transfer-progress'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { ResourceCard } from '@/shared/ui/resource-card'

import { getSubCategoryIcon, getSubCategoryLabel } from '../lib/publishingHelpers'

interface PublishingCardProps {
  publishing: PublishingListItem
  onDelete?: (publishing: PublishingListItem) => void
  onEdit?: (publishing: PublishingListItem) => void
  onViewFiles?: (publishing: PublishingListItem) => void
  dragHandleProps?: any
}

export function PublishingCard({
  publishing,
  onDelete,
  onEdit,
  onViewFiles,
  dragHandleProps,
}: PublishingCardProps) {
  const { toast } = useToast()
  const { startTransfer, handleProgress, completeTransfer, resetTransfer, transferState } = useFileTransferProgress()
  const icon = getSubCategoryIcon(publishing.subCategory)
  const htmlFiles = publishing.htmlFiles || []

  const handleOpenHtmlFile = (serveUrl: string) => {
    // API Base URL 추가
    const fullUrl = `${import.meta.env.VITE_API_BASE_URL || ''}${serveUrl}`
    window.open(fullUrl, '_blank')
  }

  const handleDownload = async () => {
    if (transferState.isTransferring) return
    const fileName = `${publishing.publishingName}.zip`

    const controller = startTransfer(fileName, 'download')
    try {
      await publishingApi.download(publishing.publishingId, fileName, handleProgress, controller.signal)
      completeTransfer()
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      resetTransfer()
      toast({
        title: '다운로드 실패',
        description: error instanceof Error ? error.message : '파일 다운로드 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  // 열기 버튼 렌더링
  const renderOpenButton = () => {
    if (htmlFiles.length === 0) {
      // HTML 파일이 없으면 비활성화 버튼
      return (
        <Button
          variant="outline"
          className="flex-1"
          disabled
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          열기
        </Button>
      )
    }

    if (htmlFiles.length === 1) {
      // HTML 파일이 1개면 직접 열기
      return (
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => handleOpenHtmlFile(htmlFiles[0].serveUrl)}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          열기
        </Button>
      )
    }

    // HTML 파일이 여러 개면 드롭다운
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex-1"
          >
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
    )
  }

  // 다운로드 버튼 렌더링
  const renderDownloadButton = () => {
    return (
      <Button
        variant="outline"
        className="flex-1"
        onClick={handleDownload}
        disabled={transferState.isTransferring}
      >
        <Download className="h-4 w-4 mr-2" />
        다운로드
      </Button>
    )
  }

  // 액션 버튼 영역 (열기 + 다운로드)
  const renderActionButtons = () => {
    return (
      <div className="flex gap-2">
        {renderOpenButton()}
        {renderDownloadButton()}
      </div>
    )
  }

  return (
    <ResourceCard
      title={publishing.publishingName}
      subtitle={getSubCategoryLabel(publishing.subCategory)}
      description={publishing.description}
      icon={icon}
      dragHandleProps={dragHandleProps}
      onDelete={onDelete ? () => onDelete(publishing) : undefined}
      headerActions={
        <div className="flex items-center gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(publishing)}
              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 flex-shrink-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onViewFiles && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewFiles(publishing)}
              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 flex-shrink-0"
            >
              <FolderSearch className="h-4 w-4" />
            </Button>
          )}
        </div>
      }
      actionButton={renderActionButtons()}
    />
  )
}
