/**
 * Patch File Explorer
 * 패치 파일 탐색기 - 공통 FileExplorer 래퍼
 */

import { Tag, type LucideIcon } from 'lucide-react'

import {
  usePatchFileStructure,
  usePatchFileContent,
} from '@/entities/patches/patch'

import { FileExplorer, type FileTreeData, type FileContentData } from '@/widgets/common/file-explorer'

interface PatchFileExplorerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patchId: number | null
  patchName: string
  /** 패치 타입에 따른 아이콘 (기본값: Tag) */
  icon?: LucideIcon
}

export function PatchFileExplorer({ open, onOpenChange, patchId, patchName, icon = Tag }: PatchFileExplorerProps) {
  const { data: fileStructure, isLoading, error } = usePatchFileStructure(
    patchId ?? 0,
    open && patchId !== null
  )

  // useFileContent 훅을 래핑하여 공통 인터페이스로 변환
  const useFileContent = (path: string, enabled: boolean) => {
    const result = usePatchFileContent(patchId ?? 0, path, enabled && patchId !== null)
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
      title={patchName}
      icon={icon}
      description="패치 파일 구조를 확인합니다."
      fileTree={fileStructure as FileTreeData | undefined}
      isLoading={isLoading}
      error={error as Error | null}
      useFileContent={useFileContent}
    />
  )
}
