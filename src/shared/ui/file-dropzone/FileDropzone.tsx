/**
 * File Dropzone Component
 * 드래그 앤 드롭 + 클릭 파일 업로드 공통 컴포넌트
 */

import { useRef, useState, useCallback, isValidElement, type ReactNode } from 'react'
import { Upload, FileArchive, File as FileIcon, X } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

/** 파일 크기 포맷팅 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export interface FileDropzoneProps {
  /** 선택된 파일 */
  file: File | null
  /** 파일 변경 핸들러 */
  onFileChange: (file: File | null) => void
  /** 허용 파일 확장자 (e.g. ['.zip', '.pdf']) - 없으면 모든 파일 허용 */
  accept?: string[]
  /** 최대 파일 크기 (bytes) */
  maxSize?: number
  /** 에러 메시지 핸들러 */
  onError?: (message: string) => void
  /** 비활성화 여부 */
  disabled?: boolean
  /** 드롭존 높이 클래스 */
  heightClass?: string
  /** 커스텀 아이콘 */
  icon?: ReactNode
  /** 드래그 중이 아닐 때 안내 문구 */
  placeholder?: string
  /** 드래그 중일 때 안내 문구 */
  dragPlaceholder?: string
  /** 추가 안내 문구 (파일 형식 등) */
  hint?: string
  /** 파일 선택 후 표시할 아이콘 */
  fileIcon?: ReactNode
}

export function FileDropzone({
  file,
  onFileChange,
  accept,
  maxSize,
  onError,
  disabled = false,
  heightClass = 'h-28',
  icon,
  placeholder = '클릭하거나 파일을 드래그하세요',
  dragPlaceholder = '여기에 파일을 놓으세요',
  hint,
  fileIcon,
}: FileDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  // 파일 유효성 검사
  const validateFile = useCallback((file: File): boolean => {
    // 확장자 검사
    if (accept && accept.length > 0) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      const isValidExtension = accept.some(ext => 
        ext.toLowerCase() === fileExtension || ext === '*'
      )
      if (!isValidExtension) {
        onError?.(`허용된 파일 형식: ${accept.join(', ')}`)
        return false
      }
    }

    // 크기 검사
    if (maxSize && file.size > maxSize) {
      onError?.(`파일 크기는 ${formatFileSize(maxSize)}를 초과할 수 없습니다.`)
      return false
    }

    return true
  }, [accept, maxSize, onError])

  // 파일 처리
  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      onFileChange(file)
    }
  }, [validateFile, onFileChange])

  // 파일 input 변경
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFile(selectedFile)
    }
    // input 초기화 (같은 파일 재선택 가능하도록)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 드래그 이벤트 핸들러
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [disabled, handleFile])

  // 클릭 핸들러
  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  // 파일 제거
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFileChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // accept 속성 문자열 생성
  const acceptString = accept?.join(',')

  // 기본 아이콘 결정
  const DefaultIcon = accept?.includes('.zip') ? FileArchive : Upload
  const SelectedFileIcon = fileIcon || (accept?.includes('.zip') ? FileArchive : FileIcon)

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptString}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {file ? (
        // 파일 선택됨
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
          <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
            {isValidElement(SelectedFileIcon) ? (
              SelectedFileIcon
            ) : typeof SelectedFileIcon === 'function' ? (
              <SelectedFileIcon className="h-6 w-6 text-primary" />
            ) : null}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        // 파일 미선택 - 드롭존
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors',
            heightClass,
            disabled && 'opacity-50 cursor-not-allowed',
            isDragOver
              ? 'border-primary bg-primary/10'
              : 'hover:border-primary/50 hover:bg-muted/50'
          )}
        >
          <div className={cn(
            'rounded-full p-3 mb-2 transition-colors',
            isDragOver ? 'bg-primary/10' : 'bg-muted'
          )}>
            {icon || (
              <DefaultIcon className={cn(
                'h-6 w-6 transition-colors',
                isDragOver ? 'text-primary' : 'text-muted-foreground'
              )} />
            )}
          </div>
          <p className={cn(
            'text-sm transition-colors',
            isDragOver ? 'text-primary font-medium' : 'text-muted-foreground'
          )}>
            {isDragOver ? dragPlaceholder : placeholder}
          </p>
          {hint && (
            <p className="text-xs text-muted-foreground mt-1">{hint}</p>
          )}
        </div>
      )}
    </>
  )
}

