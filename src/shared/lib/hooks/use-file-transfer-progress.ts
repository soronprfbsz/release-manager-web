import { useSyncExternalStore } from 'react'
import { toast } from '@/shared/lib/hooks/use-toast'

// ============================================
// Types
// ============================================
export interface FileTransferProgress {
  progress: number
  loaded: number
  total: number
  isTransferring: boolean
  isComplete: boolean
  isApproximate: boolean
  isServerProcessing: boolean
}

export interface UseFileTransferProgressReturn {
  transferState: FileTransferProgress
  handleProgress: (progressEvent: { loaded: number; total?: number; isApproximate?: boolean }) => void
  startTransfer: (fileName?: string, type?: 'upload' | 'download') => void
  startServerProcessing: () => void
  completeTransfer: () => void
  resetTransfer: () => void
}

// ============================================
// Utils
// ============================================
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// ============================================
// FileTransferStore (전역 상태 관리)
// ============================================
class FileTransferStore {
  private state: FileTransferProgress = {
    progress: 0,
    loaded: 0,
    total: 0,
    isTransferring: false,
    isComplete: false,
    isApproximate: false,
    isServerProcessing: false,
  }

  private toastRef: { dismiss: () => void; update: (props: any) => void } | null = null
  private fileName = ''
  private transferType: 'upload' | 'download' = 'download'
  private listeners = new Set<() => void>()

  private notify() {
    this.listeners.forEach((l) => l())
  }

  getState = () => this.state

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  startTransfer = (fileName?: string, type: 'upload' | 'download' = 'download') => {
    this.fileName = fileName || ''
    this.transferType = type
    this.state = { ...this.state, isTransferring: true, isComplete: false, isServerProcessing: false }
    this.notify()

    const fileNameText = fileName ? ` - ${fileName}` : ''
    const transferText = type === 'upload' ? '업로드' : '다운로드'
    const preparingText = type === 'upload' ? '파일 업로드를 준비하고 있습니다...' : '파일 다운로드를 준비하고 있습니다...'

    this.toastRef = toast({
      title: `${transferText} 시작${fileNameText}`,
      description: preparingText,
      duration: Infinity,
    })
  }

  handleProgress = (progressEvent: { loaded: number; total?: number; isApproximate?: boolean }) => {
    const { loaded, total, isApproximate = false } = progressEvent
    const hasTotal = total !== undefined && total > 0
    const progress = hasTotal ? Math.round((loaded / total) * 100) : 0

    this.state = {
      ...this.state,
      progress,
      loaded,
      total: total || 0,
      isTransferring: true,
      isApproximate,
      isServerProcessing: false,
    }
    this.notify()

    if (this.toastRef) {
      const fileName = this.fileName ? ` - ${this.fileName}` : ''
      const transferText = this.transferType === 'upload' ? '업로드' : '다운로드'
      const progressPrefix = isApproximate ? '약 ' : ''
      const description = hasTotal
        ? `${progressPrefix}${progress}% (${formatFileSize(loaded)} / ${formatFileSize(total!)})`
        : `${formatFileSize(loaded)} 전송 중...`

      this.toastRef.update({
        title: `${transferText} 중${fileName}`,
        description,
        duration: Infinity,
      })
    }
  }

  startServerProcessing = () => {
    this.state = { ...this.state, progress: 100, isTransferring: true, isServerProcessing: true, isComplete: false }
    this.notify()

    if (this.toastRef) {
      const fileName = this.fileName ? ` - ${this.fileName}` : ''
      const transferText = this.transferType === 'upload' ? '업로드' : '다운로드'
      const processingText = this.transferType === 'upload'
        ? '서버에서 파일을 처리하고 있습니다...'
        : '서버에서 파일을 준비하고 있습니다...'

      this.toastRef.update({
        title: `${transferText} 처리 중${fileName}`,
        description: processingText,
        duration: Infinity,
      })
    }
  }

  completeTransfer = () => {
    this.state = { ...this.state, progress: 100, isTransferring: false, isComplete: true, isServerProcessing: false }
    this.notify()

    this.toastRef?.dismiss()

    const fileName = this.fileName ? ` - ${this.fileName}` : ''
    const transferText = this.transferType === 'upload' ? '업로드' : '다운로드'
    const completeText = this.transferType === 'upload'
      ? '파일이 성공적으로 업로드되었습니다.'
      : '파일이 성공적으로 다운로드되었습니다.'

    toast({ title: `${transferText} 완료${fileName}`, description: completeText })

    this.toastRef = null
    this.fileName = ''
    this.transferType = 'download'
  }

  resetTransfer = () => {
    this.toastRef?.dismiss()
    this.toastRef = null
    this.fileName = ''
    this.state = {
      progress: 0,
      loaded: 0,
      total: 0,
      isTransferring: false,
      isComplete: false,
      isApproximate: false,
      isServerProcessing: false,
    }
    this.notify()
  }
}

// 싱글톤 인스턴스
export const fileTransferStore = new FileTransferStore()

// ============================================
// Hook (상태 구독만 담당)
// ============================================
export function useFileTransferProgress(): UseFileTransferProgressReturn {
  const transferState = useSyncExternalStore(
    fileTransferStore.subscribe,
    fileTransferStore.getState,
    fileTransferStore.getState
  )

  return {
    transferState,
    handleProgress: fileTransferStore.handleProgress,
    startTransfer: fileTransferStore.startTransfer,
    startServerProcessing: fileTransferStore.startServerProcessing,
    completeTransfer: fileTransferStore.completeTransfer,
    resetTransfer: fileTransferStore.resetTransfer,
  }
}
