/**
 * File Transfer Progress Hook
 * 파일 전송 진행률 관리
 */

import * as React from 'react'
import { useSyncExternalStore } from 'react'

import { toast } from '@/shared/lib/hooks/use-toast'
import { ToastAction, type ToastActionElement } from '@/shared/ui/toast'

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
  isCancelled: boolean
}

export interface UseFileTransferProgressReturn {
  transferState: FileTransferProgress
  startTransfer: (fileName?: string, type?: 'upload' | 'download') => AbortController
  updateProgress: (loaded: number, total?: number, isApproximate?: boolean) => void
  handleProgress: (event: { loaded: number; total?: number; isApproximate?: boolean }) => void
  startServerProcessing: () => void
  completeTransfer: () => void
  resetTransfer: () => void
}

// ============================================
// Constants
// ============================================
const INITIAL_STATE: FileTransferProgress = {
  progress: 0,
  loaded: 0,
  total: 0,
  isTransferring: false,
  isComplete: false,
  isApproximate: false,
  isCancelled: false,
}

const PROGRESS_THROTTLE_MS = 150

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
// Store
// ============================================
class FileTransferStore {
  private state: FileTransferProgress = { ...INITIAL_STATE }
  private listeners = new Set<() => void>()
  private toastRef: ReturnType<typeof toast> | null = null
  private currentController: AbortController | null = null
  private fileName = ''
  private transferType: 'upload' | 'download' = 'download'
  private lastUpdateTime = 0

  private emit() {
    this.listeners.forEach((fn) => fn())
  }

  getState = () => this.state

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  startTransfer = (fileName?: string, type: 'upload' | 'download' = 'download'): AbortController => {
    // 기존 전송 정리
    this.dismissToast()
    this.currentController?.abort()

    // 새 컨트롤러 생성
    const controller = new AbortController()
    this.currentController = controller
    this.fileName = fileName || ''
    this.transferType = type
    this.lastUpdateTime = 0

    // 상태 업데이트
    this.state = {
      progress: 0,
      loaded: 0,
      total: 0,
      isTransferring: true,
      isComplete: false,
      isApproximate: false,
      isCancelled: false,
    }
    this.emit()

    // 토스트 생성 - controller를 직접 캡처
    const typeText = type === 'upload' ? '업로드' : '다운로드'
    const fileText = fileName ? ` - ${fileName}` : ''

    this.toastRef = toast({
      title: `${typeText} 시작${fileText}`,
      description: `파일 ${typeText}를 준비하고 있습니다...`,
      duration: Infinity,
      action: this.createCancelAction(controller),
    })

    return controller
  }

  private createCancelAction(controller: AbortController): ToastActionElement {
    return React.createElement(
      ToastAction,
      {
        altText: '취소',
        onClick: () => this.doCancel(controller),
      },
      '취소'
    ) as unknown as ToastActionElement
  }

  private doCancel = (controller: AbortController) => {
    // 이미 취소됐거나 전송 중이 아니면 무시
    if (this.state.isCancelled || !this.state.isTransferring) {
      return
    }

    const typeText = this.transferType === 'upload' ? '업로드' : '다운로드'
    const fileText = this.fileName ? ` - ${this.fileName}` : ''

    // abort 호출
    controller.abort()

    // 토스트 닫기
    this.dismissToast()

    // 취소 토스트
    toast({
      title: `${typeText} 취소${fileText}`,
      description: `${typeText}가 취소되었습니다.`,
    })

    // 상태 업데이트
    this.currentController = null
    this.fileName = ''
    this.state = { ...INITIAL_STATE, isCancelled: true }
    this.emit()
  }

  private dismissToast() {
    if (this.toastRef) {
      this.toastRef.dismiss()
      this.toastRef = null
    }
  }

  updateProgress = (loaded: number, total?: number, isApproximate?: boolean) => {
    if (!this.state.isTransferring || this.state.isCancelled) return

    const hasTotal = total !== undefined && total > 0
    const progress = hasTotal ? Math.round((loaded / total) * 100) : 0

    this.state = {
      ...this.state,
      progress,
      loaded,
      total: total || 0,
      isApproximate: isApproximate || false,
    }

    // UI throttle
    const now = Date.now()
    if (now - this.lastUpdateTime < PROGRESS_THROTTLE_MS) return
    this.lastUpdateTime = now

    this.emit()

    if (this.toastRef && this.currentController) {
      const typeText = this.transferType === 'upload' ? '업로드' : '다운로드'
      const fileText = this.fileName ? ` - ${this.fileName}` : ''
      const prefix = isApproximate ? '약 ' : ''
      const desc = hasTotal
        ? `${prefix}${progress}% (${formatFileSize(loaded)} / ${formatFileSize(total!)})`
        : `${formatFileSize(loaded)} 전송 중...`

      this.toastRef.update({
        title: `${typeText} 중${fileText}`,
        description: desc,
        duration: Infinity,
        action: this.createCancelAction(this.currentController),
      })
    }
  }

  handleProgress = (event: { loaded: number; total?: number; isApproximate?: boolean }) => {
    this.updateProgress(event.loaded, event.total, event.isApproximate)
  }

  startServerProcessing = () => {
    if (!this.state.isTransferring || this.state.isCancelled) return

    this.state = { ...this.state, progress: 100 }
    this.emit()

    if (this.toastRef) {
      const typeText = this.transferType === 'upload' ? '업로드' : '다운로드'
      const fileText = this.fileName ? ` - ${this.fileName}` : ''
      const desc = this.transferType === 'upload'
        ? '서버에서 파일을 처리하고 있습니다...'
        : '서버에서 파일을 준비하고 있습니다...'

      this.toastRef.update({
        title: `${typeText} 처리 중${fileText}`,
        description: desc,
        duration: Infinity,
      })
    }
  }

  completeTransfer = () => {
    if (this.state.isCancelled) return

    const typeText = this.transferType === 'upload' ? '업로드' : '다운로드'
    const fileText = this.fileName ? ` - ${this.fileName}` : ''

    this.dismissToast()

    toast({
      title: `${typeText} 완료${fileText}`,
      description: `파일이 성공적으로 ${typeText}되었습니다.`,
    })

    this.currentController = null
    this.fileName = ''
    this.state = { ...INITIAL_STATE, isComplete: true }
    this.emit()
  }

  resetTransfer = () => {
    this.dismissToast()
    this.currentController?.abort()
    this.currentController = null
    this.fileName = ''
    this.state = { ...INITIAL_STATE }
    this.emit()
  }
}

// 싱글톤
const store = new FileTransferStore()

// ============================================
// Hook
// ============================================
export function useFileTransferProgress(): UseFileTransferProgressReturn {
  const transferState = useSyncExternalStore(store.subscribe, store.getState, store.getState)

  return {
    transferState,
    startTransfer: store.startTransfer,
    updateProgress: store.updateProgress,
    handleProgress: store.handleProgress,
    startServerProcessing: store.startServerProcessing,
    completeTransfer: store.completeTransfer,
    resetTransfer: store.resetTransfer,
  }
}
