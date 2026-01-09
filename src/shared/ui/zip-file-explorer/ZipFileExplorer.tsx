/**
 * ZIP File Explorer Component
 * ZIP 파일 탐색기 - FileExplorer를 사용하여 ZIP 파일 내용을 표시
 */

import { useState, useEffect, useCallback, useRef } from 'react'

import JSZip from 'jszip'
import { FolderOpen, type LucideIcon } from 'lucide-react'

import { FileExplorer, type FileTreeData, type FileNode, type FileContentData } from '@/widgets/common/file-explorer'

interface ZipFileExplorerProps {
  /** Sheet 열림 상태 */
  open: boolean
  /** Sheet 열림 상태 변경 콜백 */
  onOpenChange: (open: boolean) => void
  /** ZIP 파일 Blob */
  zipBlob: Blob | null
  /** 파일명 (Sheet 제목으로 사용) */
  fileName: string
  /** 헤더 아이콘 (기본값: FolderOpen) */
  icon?: LucideIcon
  /** 로딩 상태 */
  isLoading?: boolean
  /** 에러 */
  error?: Error | null
}

/**
 * JSZip 객체를 FileTreeData로 변환
 */
function zipToFileTree(zip: JSZip): FileTreeData {
  const nodeMap = new Map<string, FileNode>()
  const root: FileNode[] = []

  // 모든 파일/폴더를 순회하여 노드 생성
  zip.forEach((relativePath, zipEntry) => {
    const parts = relativePath.split('/').filter(Boolean)
    if (parts.length === 0) return

    let currentPath = ''
    let currentLevel = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1
      const isDirectory = isLast ? zipEntry.dir : true
      currentPath = currentPath ? `${currentPath}/${part}` : part

      let node = nodeMap.get(currentPath)
      if (!node) {
        // JSZip 내부 속성 접근
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const entryData = (zipEntry as any)._data

        node = {
          name: part,
          path: currentPath,
          type: isDirectory ? 'directory' : 'file',
          size: isLast && !isDirectory ? (entryData?.uncompressedSize || 0) : undefined,
          children: isDirectory ? [] : undefined,
        }
        nodeMap.set(currentPath, node)
        currentLevel.push(node)
      }

      if (node.children) {
        currentLevel = node.children
      }
    }
  })

  return {
    root: {
      children: root,
    },
  }
}

export function ZipFileExplorer({
  open,
  onOpenChange,
  zipBlob,
  fileName,
  icon = FolderOpen,
  isLoading = false,
  error = null,
}: ZipFileExplorerProps) {
  const [fileTree, setFileTree] = useState<FileTreeData | undefined>(undefined)
  const [parseError, setParseError] = useState<Error | null>(null)
  const [isParsing, setIsParsing] = useState(false)

  // ZIP 객체를 저장하여 파일 내용 조회에 사용
  const zipRef = useRef<JSZip | null>(null)

  // 파일 내용 캐시
  const contentCacheRef = useRef<Map<string, FileContentData>>(new Map())

  // ZIP 파일 파싱
  useEffect(() => {
    async function parseZip() {
      if (!zipBlob || !open) {
        return
      }

      setIsParsing(true)
      setParseError(null)
      contentCacheRef.current.clear()

      try {
        const zip = await JSZip.loadAsync(zipBlob)
        zipRef.current = zip
        const tree = zipToFileTree(zip)
        setFileTree(tree)
      } catch (err) {
        console.error('Failed to parse ZIP file:', err)
        setParseError(new Error('압축 파일을 읽는데 실패했습니다.'))
        setFileTree(undefined)
      } finally {
        setIsParsing(false)
      }
    }

    parseZip()
  }, [zipBlob, open])

  // 파일 내용 조회 훅 생성
  const useFileContent = useCallback((path: string, enabled: boolean) => {
    const [data, setData] = useState<FileContentData | undefined>(undefined)
    const [isLoadingContent, setIsLoadingContent] = useState(false)
    const [contentError, setContentError] = useState<Error | null>(null)

    useEffect(() => {
      async function loadContent() {
        if (!enabled || !path || !zipRef.current) {
          return
        }

        // 캐시 확인
        const cached = contentCacheRef.current.get(path)
        if (cached) {
          setData(cached)
          return
        }

        setIsLoadingContent(true)
        setContentError(null)

        try {
          const file = zipRef.current.file(path)
          if (!file) {
            throw new Error('파일을 찾을 수 없습니다.')
          }

          // 파일 확장자로 바이너리 여부 판단
          const ext = path.toLowerCase().split('.').pop() || ''
          const binaryExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'zip', 'jar', 'war', 'ear', 'exe', 'dll', 'so', 'class']
          const isBinary = binaryExtensions.includes(ext)

          let content: string
          let mimeType: string | undefined

          if (isBinary) {
            // 바이너리 파일은 base64로 인코딩
            const uint8Array = await file.async('uint8array')
            content = btoa(String.fromCharCode(...uint8Array))

            // MIME 타입 설정
            const mimeTypes: Record<string, string> = {
              pdf: 'application/pdf',
              png: 'image/png',
              jpg: 'image/jpeg',
              jpeg: 'image/jpeg',
              gif: 'image/gif',
              webp: 'image/webp',
              bmp: 'image/bmp',
              ico: 'image/x-icon',
            }
            mimeType = mimeTypes[ext] || 'application/octet-stream'
          } else {
            // 텍스트 파일
            content = await file.async('string')
          }

          const fileContentData: FileContentData = {
            content,
            mimeType,
            isBinary,
          }

          // 캐시에 저장
          contentCacheRef.current.set(path, fileContentData)
          setData(fileContentData)
        } catch (err) {
          console.error('Failed to load file content:', err)
          setContentError(err instanceof Error ? err : new Error('파일 내용을 불러오는데 실패했습니다.'))
        } finally {
          setIsLoadingContent(false)
        }
      }

      loadContent()
    }, [path, enabled])

    return { data, isLoading: isLoadingContent, error: contentError }
  }, [])

  return (
    <FileExplorer
      open={open}
      onOpenChange={onOpenChange}
      title={fileName}
      icon={icon}
      description="압축 파일 내용을 확인합니다."
      fileTree={fileTree}
      isLoading={isLoading || isParsing}
      error={error || parseError}
      useFileContent={useFileContent}
    />
  )
}
