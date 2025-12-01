import { useState, useCallback } from 'react'

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
  startTransfer: () => void
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

/**
 * 파일 업로드/다운로드 진행률을 추적하는 훅
 * axios의 onUploadProgress, onDownloadProgress와 함께 사용
 */
export function useFileTransferProgress(): UseFileTransferProgressReturn {
  const [transferState, setTransferState] = useState<FileTransferProgress>(initialState)

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
  }, [])

  const startTransfer = useCallback(() => {
    setTransferState((prev) => ({
      ...prev,
      isTransferring: true,
      isComplete: false,
    }))
  }, [])

  const completeTransfer = useCallback(() => {
    setTransferState((prev) => ({
      ...prev,
      progress: 100,
      isTransferring: false,
      isComplete: true,
    }))
  }, [])

  const resetTransfer = useCallback(() => {
    setTransferState(initialState)
  }, [])

  return {
    transferState,
    handleProgress,
    startTransfer,
    completeTransfer,
    resetTransfer,
  }
}
