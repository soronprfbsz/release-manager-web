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
  /** 진행률이 대략적인지 여부 (압축 전 크기 기준) */
  isApproximate: boolean
  /** 서버 처리 중 여부 (업로드 100% 후 압축 등의 서버 작업) */
  isServerProcessing: boolean
}

export interface UseFileTransferProgressReturn {
  /** 현재 진행 상태 */
  transferState: FileTransferProgress
  /** 진행률 업데이트 핸들러 (axios onProgress 콜백에 전달) */
  handleProgress: (progressEvent: { loaded: number; total?: number }) => void
  /** 전송 시작 */
  startTransfer: (fileName?: string, type?: 'upload' | 'download') => void
  /** 서버 처리 단계로 전환 (100% 이후 압축 등의 작업) */
  startServerProcessing: () => void
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
  isApproximate: false,
  isServerProcessing: false,
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

  const handleProgress = useCallback((progressEvent: { loaded: number; total?: number; isApproximate?: boolean }) => {
    const { loaded, total, isApproximate = false } = progressEvent
    const hasTotal = total !== undefined && total > 0
    const progress = hasTotal ? Math.round((loaded / total) * 100) : 0

    setTransferState((prev) => ({
      ...prev,
      progress,
      loaded,
      total: total || 0,
      isTransferring: true,
      isApproximate,
      isServerProcessing: false, // 진행 중일 때는 서버 처리 단계 아님
    }))

    // Toast 업데이트 (기존 toast의 내용만 변경)
    if (toastRef.current) {
      const fileName = fileNameRef.current ? ` - ${fileNameRef.current}` : ''
      const transferText = transferTypeRef.current === 'upload' ? '업로드' : '다운로드'

      // total이 있으면 백분율 표시, 없으면 다운로드된 크기만 표시 (스트리밍 방식)
      let description: string
      if (hasTotal) {
        // 대략적인 진행률인 경우 "약" 표시
        const progressPrefix = isApproximate ? '약 ' : ''
        description = `${progressPrefix}${progress}% (${formatFileSize(loaded)} / ${formatFileSize(total)})`
      } else {
        description = `${formatFileSize(loaded)} 전송 중...`
      }

      toastRef.current.update({
        title: `${transferText} 중${fileName}`,
        description,
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
      isServerProcessing: false,
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

  const startServerProcessing = useCallback(() => {
    setTransferState((prev) => ({
      ...prev,
      progress: 100,
      isTransferring: true,
      isServerProcessing: true,
      isComplete: false,
    }))

    // Toast 업데이트 - 서버 처리 단계 표시
    if (toastRef.current) {
      const fileName = fileNameRef.current ? ` - ${fileNameRef.current}` : ''
      const transferText = transferTypeRef.current === 'upload' ? '업로드' : '다운로드'
      const processingText = transferTypeRef.current === 'upload'
        ? '서버에서 파일을 처리하고 있습니다...'
        : '서버에서 파일을 준비하고 있습니다...'

      toastRef.current.update({
        title: `${transferText} 처리 중${fileName}`,
        description: processingText,
        duration: Infinity,
      })
    }
  }, [])

  const completeTransfer = useCallback(() => {
    setTransferState((prev) => ({
      ...prev,
      progress: 100,
      isTransferring: false,
      isComplete: true,
      isServerProcessing: false,
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
    startServerProcessing,
    completeTransfer,
    resetTransfer,
  }
}
