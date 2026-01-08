import { useState, useMemo } from 'react'

import { useMutation } from '@tanstack/react-query'
import { Info, Tag, type LucideIcon } from 'lucide-react'

import { useCustomers, type Customer } from '@/entities/operations/customer'
import { useProjectStore } from '@/shared/store'
import { releaseApi, useStandardVersionList, useAllCustomReleaseTree } from '@/entities/releases/release'

import { useFileTransferProgress } from '@/shared/lib/hooks/use-file-transfer-progress'
import { findLatestVersionString } from '@/shared/lib/utils/version'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { Combobox } from '@/shared/ui/combobox'
import { FileDropzone } from '@/shared/ui/file-dropzone'
import { FormSheet } from '@/shared/ui/form-sheet'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
import { Switch } from '@/shared/ui/switch'
import { Textarea } from '@/shared/ui/textarea'
import { TypographyMuted } from '@/shared/ui/typography'

interface CustomVersionCreateFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  /** 페이지 헤더와 동일한 아이콘 */
  icon?: LucideIcon
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024 // 10GB

export function CustomVersionCreateForm({ open, onOpenChange, onSuccess, icon: PageIcon = Tag }: CustomVersionCreateFormProps) {
  const projectId = useProjectStore((state) => state.projectId)
  const [customerId, setCustomerId] = useState<number | null>(null)
  const [customBaseVersionId, setCustomBaseVersionId] = useState<number | null>(null)
  const [customVersion, setCustomVersion] = useState('')
  const [comment, setComment] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isApproved, setIsApproved] = useState(false)
  const { toast } = useToast()
  const { handleProgress, startTransfer, startServerProcessing, completeTransfer, resetTransfer } = useFileTransferProgress()
  const [uploadCompleted, setUploadCompleted] = useState(false)

  // 고객사 목록 조회 (활성화된 고객사만)
  const { data: customersData } = useCustomers({ isActive: true, size: 1000 })
  const customers = customersData?.content || []

  // 표준본 버전 목록 조회 (baseVersion 선택용)
  const { data: standardVersions = [] } = useStandardVersionList(projectId)

  // 커스텀 릴리즈 트리 조회 (고객사별 버전 존재 여부 확인용)
  const { data: customTreeData } = useAllCustomReleaseTree(projectId)

  // 선택된 고객사 정보
  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.customerId === customerId)
  }, [customers, customerId])

  // 선택된 고객사의 최초 버전 생성 여부 확인
  const isFirstVersionForCustomer = useMemo(() => {
    if (!selectedCustomer || !customTreeData?.customers) return false
    const customerNode = customTreeData.customers.find(c => c.customerCode === selectedCustomer.customerCode)
    // 고객사 노드가 없거나 버전 그룹이 없으면 최초 버전
    return !customerNode || customerNode.majorMinorGroups.length === 0
  }, [selectedCustomer, customTreeData])

  // 선택된 고객사의 최신 버전 문자열
  const latestVersionForCustomer = useMemo(() => {
    if (!selectedCustomer || !customTreeData?.customers) return null
    const customerNode = customTreeData.customers.find(c => c.customerCode === selectedCustomer.customerCode)
    if (!customerNode) return null
    return findLatestVersionString(customerNode.majorMinorGroups)
  }, [selectedCustomer, customTreeData])

  const createMutation = useMutation({
    mutationFn: async () => {
      setUploadCompleted(false)
      startTransfer(file?.name, 'upload')

      const progressHandler = (progressEvent: { loaded: number; total?: number }) => {
        handleProgress(progressEvent)

        if (progressEvent.total && progressEvent.loaded >= progressEvent.total && !uploadCompleted) {
          setUploadCompleted(true)
          setTimeout(() => {
            startServerProcessing()
          }, 100)
        }
      }

      await releaseApi.createCustomVersion(
        projectId,
        customerId!,
        customVersion,
        comment,
        file!,
        isApproved,
        isFirstVersionForCustomer && customBaseVersionId ? customBaseVersionId : undefined,
        progressHandler
      )
      completeTransfer()
    },
    onSuccess: () => {
      toast({
        title: '커스텀 버전 생성 완료',
        description: `버전 ${customVersion}이(가) 성공적으로 생성되었습니다.`,
      })
      handleClose()
      onSuccess()
    },
    onError: (error) => {
      resetTransfer()
      toast({
        title: '커스텀 버전 생성 실패',
        description: error instanceof Error ? error.message : '버전 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    },
  })

  const handleClose = () => {
    setCustomerId(null)
    setCustomBaseVersionId(null)
    setCustomVersion('')
    setComment('')
    setFile(null)
    setIsApproved(false)
    setUploadCompleted(false)
    resetTransfer()
    onOpenChange(false)
  }

  const handleSubmit = () => {
    if (!customerId) {
      toast({
        title: '입력 오류',
        description: '고객사를 선택해주세요.',
        variant: 'destructive',
      })
      return
    }

    if (isFirstVersionForCustomer && !customBaseVersionId) {
      toast({
        title: '입력 오류',
        description: '최초 버전 생성 시 표준본 버전(Base Version)을 선택해주세요.',
        variant: 'destructive',
      })
      return
    }

    if (!customVersion.trim()) {
      toast({
        title: '입력 오류',
        description: '버전을 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    if (!comment.trim()) {
      toast({
        title: '입력 오류',
        description: '코멘트를 입력해주세요.',
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

    createMutation.mutate()
  }

  const handleFileError = (message: string) => {
    toast({
      title: '파일 오류',
      description: message,
      variant: 'destructive',
    })
  }

  // 파일 구조 안내 배너
  const headerContent = (
    <div className="flex items-center gap-2 mb-5">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Info className="h-4 w-4" />
            <span className="underline decoration-dotted">버전 파일 생성 방법</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[440px]" align="start">
          <div className="space-y-3 text-sm">
            <p className="font-medium text-foreground">
              버전 파일 생성 방법
            </p>
            <div className="text-muted-foreground space-y-2">
              <div className="space-y-1">
                <p className="font-medium text-foreground text-xs">1단계: 파일 준비</p>
                <p className="text-xs">아래와 같은 폴더 구조로 파일을 준비하세요:</p>
                <div className="font-mono text-xs bg-muted rounded border p-2">
                  <div>📁 database/</div>
                  <div className="ml-4">📁 MARIADB/</div>
                  <div className="ml-8">📄 1.patch_mariadb_테스트1.sql</div>
                  <div className="ml-8">📄 2.patch_mariadb_테스트2.sql</div>
                  <div className="ml-8">📄 ...</div>
                  <div className="ml-4">📁 CRATEDB/</div>
                  <div className="ml-8">📄 ...</div>
                  <div>📁 web/</div>
                  <div className="ml-4">📄 nms_solution-2.0.0.240102-1-STD.war</div>
                  <div className="ml-4">📄 nms_solution-2.0.0.240102-1-STD.tar</div>
                  <div>📁 engine/</div>
                  <div className="ml-4">📁 NC_SMS/</div>
                  <div className="ml-8">📄 ...</div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-medium text-foreground text-xs">2단계: ZIP 압축</p>
                <p className="text-xs">
                  위 구조로 구성된 <strong>폴더들을 선택</strong>하여 ZIP으로 압축
                </p>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2 text-xs space-y-2">
                  <span className="text-yellow-600 dark:text-yellow-500">⚠️폴더 구조 규칙</span>
                  <p className="font-mono bg-muted px-2 py-1 rounded">
                    {'{카테고리}'}/{'{하위카테고리}'}/{'{파일}'}
                  </p>
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground">
                      • 카테고리: database, web, engine
                    </p>
                    <p className="text-muted-foreground">
                      • 하위카테고리: MARIADB, CRATEDB, NC_SMS 등
                    </p>
                    <p className="text-muted-foreground">
                      • database 및 engine 이름은 반드시 대문자로 작성
                    </p>
                    <p className="text-muted-foreground ml-4">
                      mariadb<span className="text-red-500">(✗)</span> MARIADB<span className="text-green-500">(✓)</span> / Nc_Sms<span className="text-red-500">(✗)</span> NC_SMS<span className="text-green-500">(✓)</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )

  return (
    <FormSheet
      open={open}
      icon={PageIcon}
      title="커스텀 버전 생성"
      description="고객사별 커스텀 릴리즈 버전을 생성합니다."
      submitLabel="생성"
      submitIcon={Tag}
      isSubmitting={createMutation.isPending}
      onSubmit={handleSubmit}
      onClose={handleClose}
      width="w-[500px] sm:max-w-[500px]"
      scrollHeight="h-[calc(100vh-120px)]"
      headerContent={headerContent}
    >
      {/* 고객사 선택 */}
      <div className="space-y-2">
        <Label htmlFor="customerId" required>
          고객사
        </Label>
        <Combobox
          options={customers.map((customer: Customer) => ({
            value: String(customer.customerId),
            label: `${customer.customerName} (${customer.customerCode})`,
          }))}
          value={customerId ? String(customerId) : ''}
          onValueChange={(value) => {
            setCustomerId(value ? Number(value) : null)
            setCustomBaseVersionId(null) // 고객사 변경 시 customBaseVersionId 초기화
          }}
          placeholder="고객사를 선택하세요"
          searchPlaceholder="고객사 검색..."
        />
      </div>

      {/* 표준본 버전 선택 (최초 버전 생성 시에만 표시) */}
      {customerId && isFirstVersionForCustomer && (
        <div className="space-y-2">
          <Label htmlFor="customBaseVersionId" required>
            표준본 버전 (Base Version)
          </Label>
          <Combobox
            options={standardVersions.map((sv) => ({
              value: String(sv.versionId),
              label: `${sv.version}${!sv.isApproved ? ' (승인되지 않음)' : ''}`,
            }))}
            value={customBaseVersionId ? String(customBaseVersionId) : ''}
            onValueChange={(value) => setCustomBaseVersionId(value ? Number(value) : null)}
            placeholder="기준이 될 표준본 버전을 선택하세요"
            searchPlaceholder="표준본 버전 검색..."
          />
          <TypographyMuted className="text-xs">
            고객사별 최초 커스텀 버전 생성 시 기준이 될 표준본 버전을 선택해야 합니다.
          </TypographyMuted>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="customVersion" required>
          버전
        </Label>
        <Input
          id="customVersion"
          placeholder={latestVersionForCustomer ? `마지막 버전: ${latestVersionForCustomer}` : '예: 1.0.0'}
          value={customVersion}
          onChange={(e) => setCustomVersion(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment" required>
          코멘트
        </Label>
        <Textarea
          id="comment"
          placeholder="버전에 대한 설명을 입력하세요"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label required>버전 파일</Label>
        <FileDropzone
          file={file}
          onFileChange={setFile}
          accept={['.zip']}
          maxSize={MAX_FILE_SIZE}
          onError={handleFileError}
          disabled={createMutation.isPending}
          heightClass="h-32"
          hint="최대 파일 크기: 10GB"
        />
      </div>

      {/* 승인된 버전으로 생성 */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-1">
          <Label htmlFor="isApproved" className="cursor-pointer font-medium">
            승인된 버전으로 생성
          </Label>
          <TypographyMuted className="text-xs">
            활성화 시 승인된 상태로 버전이 생성됩니다.
          </TypographyMuted>
        </div>
        <Switch
          id="isApproved"
          checked={isApproved}
          onCheckedChange={setIsApproved}
        />
      </div>
    </FormSheet>
  )
}
