/**
 * Publishing File Explorer
 * 퍼블리싱 파일 탐색기 - 공통 FileExplorer 래퍼
 */

import { Globe } from 'lucide-react'

import { FileExplorer, type FileTreeData, type FileContentData } from '@/widgets/common/file-explorer'

import {
  usePublishingFileTree,
  usePublishingFileContent,
} from '@/entities/infrastructure/publishing'


interface PublishingFileExplorerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  publishingId: number | null
  publishingName: string
}

export function PublishingFileExplorer({ open, onOpenChange, publishingId, publishingName }: PublishingFileExplorerProps) {
  const { data: fileTree, isLoading, error } = usePublishingFileTree(
    publishingId ?? 0,
    open && publishingId !== null
  )

  // useFileContent 훅을 래핑하여 공통 인터페이스로 변환
  const useFileContent = (filePath: string, enabled: boolean) => {
    const result = usePublishingFileContent(filePath, enabled)
    return {
      data: result.data as FileContentData | undefined,
      isLoading: result.isLoading,
      error: result.error as Error | null,
    }
  }

  return (
    <FileExplorer
      open={open}
      onOpenChange={onOpenChange}
      title={publishingName}
      icon={Globe}
      description="퍼블리싱 파일 구조를 확인합니다."
      fileTree={fileTree as FileTreeData | undefined}
      isLoading={isLoading}
      error={error as Error | null}
      useFileContent={useFileContent}
    />
  )
}
