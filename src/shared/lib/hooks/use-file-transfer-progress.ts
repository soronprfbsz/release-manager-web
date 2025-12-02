import { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from '@/shared/lib/hooks/use-toast'

export interface FileTransferProgress {
  /** 진행률 (0-100) */
  progress: number
  /** 전송된 바이트 수 */
  loaded: number
  /** 전체 바이트 수 */
  total: number
  /** 전송 중 여부 */
  isTransferring: boolean
  /** 완료 여부 */
  isComplete: boolean
}

export interface UseFileTransferProgressReturn {
  /** 현재 진행 상태 */
  transferState: FileTransferProgress
  /** 진행률 업데이트 핸들러 (axios onProgress 콜백에 전달) */
  handleProgress: (progressEvent: { loaded: number; total?: number }) => void
  /** 전송 시작 */
  startTransfer: (fileName?: string, type?: 'upload' | 'download') => void
  /** 전송 완료 */
  completeTransfer: () => void
  /** 상태 초기화 */
  resetTransfer: () => void
}

const initialState: FileTransferProgress = {
  progress: 0,
  loaded: 0,
  total: 0,
  isTransferring: false,
  isComplete: false,
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 파일 업로드/다운로드 진행률을 추적하는 훅
 * axios의 onUploadProgress, onDownloadProgress와 함께 사용
 * Toast를 통해 진행 상황을 자동으로 표시
 */
export function useFileTransferProgress(): UseFileTransferProgressReturn {
  const [transferState, setTransferState] = useState<FileTransferProgress>(initialState)
  const toastRef = useRef<{ id: string; dismiss: () => void; update: (props: any) => void } | null>(null)
  const fileNameRef = useRef<string>('')
  const transferTypeRef = useRef<'upload' | 'download'>('download')

  const handleProgress = useCallback((progressEvent: { loaded: number; total?: number }) => {
    const { loaded, total = 0 } = progressEvent
    const progress = total > 0 ? Math.round((loaded / total) * 100) : 0

    setTransferState((prev) => ({
      ...prev,
      progress,
      loaded,
      total,
      isTransferring: true,
    }))

    // Toast 업데이트 (기존 toast의 내용만 변경)
    if (toastRef.current) {
      const fileName = fileNameRef.current ? ` - ${fileNameRef.current}` : ''
      const transferText = transferTypeRef.current === 'upload' ? '업로드' : '다운로드'
      toastRef.current.update({
        title: `${transferText} 중${fileName}`,
        description: `${progress}% (${formatFileSize(loaded)} / ${formatFileSize(total)})`,
        duration: Infinity,
      })
    }
  }, [])

  const startTransfer = useCallback((fileName?: string, type: 'upload' | 'download' = 'download') => {
    fileNameRef.current = fileName || ''
    transferTypeRef.current = type
    setTransferState((prev) => ({
      ...prev,
      isTransferring: true,
      isComplete: false,
    }))

    // 새로운 toast 생성
    const fileNameText = fileName ? ` - ${fileName}` : ''
    const transferText = type === 'upload' ? '업로드' : '다운로드'
    const preparingText = type === 'upload' ? '파일 업로드를 준비하고 있습니다...' : '파일 다운로드를 준비하고 있습니다...'
    toastRef.current = toast({
      title: `${transferText} 시작${fileNameText}`,
      description: preparingText,
      duration: Infinity,
    })
  }, [])

  const completeTransfer = useCallback(() => {
    setTransferState((prev) => ({
      ...prev,
      progress: 100,
      isTransferring: false,
      isComplete: true,
    }))

    // 기존 toast 닫고 완료 toast 표시
    if (toastRef.current) {
      toastRef.current.dismiss()
    }

    const fileName = fileNameRef.current ? ` - ${fileNameRef.current}` : ''
    const transferText = transferTypeRef.current === 'upload' ? '업로드' : '다운로드'
    const completeText = transferTypeRef.current === 'upload'
      ? '파일이 성공적으로 업로드되었습니다.'
      : '파일이 성공적으로 다운로드되었습니다.'
    toast({
      title: `${transferText} 완료${fileName}`,
      description: completeText,
    })

    toastRef.current = null
    fileNameRef.current = ''
    transferTypeRef.current = 'download'
  }, [])

  const resetTransfer = useCallback(() => {
    if (toastRef.current) {
      toastRef.current.dismiss()
      toastRef.current = null
    }
    fileNameRef.current = ''
    setTransferState(initialState)
  }, [])

  // 컴포넌트 언마운트 시 toast 정리
  useEffect(() => {
    return () => {
      if (toastRef.current) {
        toastRef.current.dismiss()
      }
    }
  }, [])

  return {
    transferState,
    handleProgress,
    startTransfer,
    completeTransfer,
    resetTransfer,
  }
}
