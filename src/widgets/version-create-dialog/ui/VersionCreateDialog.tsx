import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Upload } from 'lucide-react'
import { releaseApi } from '@/entities/release'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { useToast } from '@/shared/lib/hooks/use-toast'

interface VersionCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function VersionCreateDialog({ open, onOpenChange, onSuccess }: VersionCreateDialogProps) {
  const [version, setVersion] = useState('')
  const [comment, setComment] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const { toast } = useToast()

  const createMutation = useMutation({
    mutationFn: () => releaseApi.createVersion(version, comment, file!),
    onSuccess: () => {
      toast({
        title: '버전 생성 완료',
        description: `버전 ${version}이(가) 성공적으로 생성되었습니다.`,
      })
      handleClose()
      onSuccess()
    },
    onError: (error) => {
      toast({
        title: '버전 생성 실패',
        description: error instanceof Error ? error.message : '버전 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    },
  })

  const handleClose = () => {
    setVersion('')
    setComment('')
    setFile(null)
    onOpenChange(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!version.trim()) {
      toast({
        title: '입력 오류',
        description: '버전을 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    if (!file) {
      toast({
        title: '입력 오류',
        description: '패치 파일을 선택해주세요.',
        variant: 'destructive',
      })
      return
    }

    if (!file.name.toLowerCase().endsWith('.zip')) {
      toast({
        title: '파일 형식 오류',
        description: 'ZIP 파일만 업로드 가능합니다.',
        variant: 'destructive',
      })
      return
    }

    createMutation.mutate()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>버전 생성</DialogTitle>
            <DialogDescription>
              새로운 릴리즈 버전을 생성합니다. ZIP 파일에는 mariadb, cratedb 폴더가 포함되어야 합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="version">
                버전 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="version"
                placeholder="예: 1.1.3"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="comment">코멘트</Label>
              <Textarea
                id="comment"
                placeholder="버전에 대한 설명을 입력하세요"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="patchFiles">
                패치 파일 <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="patchFiles"
                  type="file"
                  accept=".zip"
                  onChange={handleFileChange}
                  required
                />
              </div>
              {file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Upload className="h-4 w-4" />
                  <span>{file.name}</span>
                  <span>({(file.size / 1024).toFixed(2)} KB)</span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={createMutation.isPending}>
              취소
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? '생성 중...' : '생성'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
