import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Layers, ArrowRight, Loader2, Package, GitBranch } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Breadcrumb } from '@/shared/ui/breadcrumb'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { useToast } from '@/shared/lib/hooks/use-toast'
import { useAuth } from '@/app/providers/AuthProvider'
import { releaseApi, type VersionNode } from '@/entities/release'
import { patchApi, type CumulativePatchGenerateRequest } from '@/entities/patch'
import { customerApi } from '@/entities/customer'

type ReleaseType = 'STANDARD' | 'CUSTOM'

function getVersionsFromTree(data: { majorMinorGroups: { versions: VersionNode[] }[] } | undefined): string[] {
  if (!data) return []

  const versions: string[] = []
  data.majorMinorGroups.forEach(group => {
    group.versions.forEach(v => {
      versions.push(v.version)
    })
  })

  return versions.sort((a, b) => {
    const aParts = a.split('.').map(Number)
    const bParts = b.split('.').map(Number)
    for (let i = 0; i < 3; i++) {
      if (aParts[i] !== bParts[i]) return aParts[i] - bParts[i]
    }
    return 0
  })
}

export function PatchGeneratePage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [releaseType, setReleaseType] = useState<ReleaseType>('STANDARD')
  const [fromVersion, setFromVersion] = useState('')
  const [toVersion, setToVersion] = useState('')
  const [customerCode, setCustomerCode] = useState('')
  const [assignedEngineer, setAssignedEngineer] = useState('')
  const [description, setDescription] = useState('')

  const { data: treeData, isLoading: isTreeLoading } = useQuery({
    queryKey: ['standard-release-tree'],
    queryFn: releaseApi.getStandardTree,
    enabled: releaseType === 'STANDARD',
  })

  const { data: customers } = useQuery({
    queryKey: ['customers-active'],
    queryFn: () => customerApi.getList(true),
  })

  const versions = getVersionsFromTree(treeData)

  const generateMutation = useMutation({
    mutationFn: (request: CumulativePatchGenerateRequest) => patchApi.generate(request),
    onSuccess: (data) => {
      toast({
        title: '패치 생성 완료',
        description: `${data.patchName} 패치가 생성되었습니다.`,
      })
      queryClient.invalidateQueries({ queryKey: ['cumulative-patches'] })
      setFromVersion('')
      setToVersion('')
      setCustomerCode('')
      setAssignedEngineer('')
      setDescription('')
    },
    onError: (error: Error) => {
      toast({
        title: '패치 생성 실패',
        description: error.message || '패치 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    },
  })

  const handleGenerate = () => {
    if (!fromVersion || !toVersion) {
      toast({
        title: '입력 오류',
        description: '시작 버전과 종료 버전을 선택해주세요.',
        variant: 'destructive',
      })
      return
    }

    if (fromVersion >= toVersion) {
      toast({
        title: '입력 오류',
        description: '종료 버전은 시작 버전보다 높아야 합니다.',
        variant: 'destructive',
      })
      return
    }

    const request: CumulativePatchGenerateRequest = {
      type: releaseType,
      customerCode: customerCode || undefined,
      fromVersion,
      toVersion,
      generatedBy: user?.email || '',
      assignedEngineer: assignedEngineer || undefined,
      description: description || undefined,
    }

    generateMutation.mutate(request)
  }

  const handleFromVersionChange = (value: string) => {
    setFromVersion(value)
    if (toVersion && value >= toVersion) {
      setToVersion('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between h-9">
        <Breadcrumb
          items={[
            { label: '패치본 관리' },
            { label: '누적 패치 생성' },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 패치 생성 폼 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              누적 패치 생성
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* 릴리즈 타입 */}
            <div className="space-y-2">
              <Label>릴리즈 타입 *</Label>
              <div className="flex gap-2">
                <Button
                  variant={releaseType === 'STANDARD' ? 'default' : 'outline'}
                  onClick={() => {
                    setReleaseType('STANDARD')
                    setFromVersion('')
                    setToVersion('')
                  }}
                  className="flex-1"
                >
                  <Package className="h-4 w-4 mr-2" />
                  표준 릴리즈
                </Button>
                <Button
                  variant={releaseType === 'CUSTOM' ? 'default' : 'outline'}
                  onClick={() => {
                    setReleaseType('CUSTOM')
                    setFromVersion('')
                    setToVersion('')
                  }}
                  className="flex-1"
                  disabled
                  title="추후 지원 예정"
                >
                  <GitBranch className="h-4 w-4 mr-2" />
                  커스텀 릴리즈
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                * 커스텀 릴리즈는 추후 지원 예정입니다.
              </p>
            </div>

            {/* 버전 선택 */}
            <div className="space-y-2">
              <Label>버전 범위 *</Label>
              <div className="flex items-center gap-3">
                <Select
                  value={fromVersion}
                  onValueChange={handleFromVersionChange}
                  disabled={isTreeLoading || versions.length === 0}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="시작 버전 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <Select
                  value={toVersion}
                  onValueChange={setToVersion}
                  disabled={isTreeLoading || versions.length === 0 || !fromVersion}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="종료 버전 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.filter(v => fromVersion && v > fromVersion).map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {isTreeLoading && (
                <p className="text-sm text-muted-foreground">버전 목록을 불러오는 중...</p>
              )}
              {!isTreeLoading && versions.length === 0 && (
                <p className="text-sm text-muted-foreground">등록된 버전이 없습니다.</p>
              )}
            </div>

            {/* 고객사 */}
            <div className="space-y-2">
              <Label>고객사</Label>
              <Select
                value={customerCode || '__none__'}
                onValueChange={(value) => setCustomerCode(value === '__none__' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="선택 안함" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">선택 안함</SelectItem>
                  {customers?.map((c) => (
                    <SelectItem key={c.customerId} value={c.customerCode}>
                      {c.customerName} ({c.customerCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 담당 엔지니어 */}
            <div className="space-y-2">
              <Label>담당 엔지니어</Label>
              <Input
                value={assignedEngineer}
                onChange={(e) => setAssignedEngineer(e.target.value)}
                placeholder="패치 담당 엔지니어 이름을 입력하세요"
              />
            </div>

            {/* 설명 */}
            <div className="space-y-2">
              <Label>설명</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="패치에 대한 설명을 입력하세요 (예: 특정 버그 수정, 기능 추가 등)"
                className="min-h-[80px]"
              />
            </div>

            {/* 안내 문구 */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                선택한 버전 범위 내의 모든 변경사항(MariaDB, CrateDB)이 하나의 패치 파일로 생성됩니다.
              </p>
            </div>

            {/* 생성 버튼 */}
            <Button
              onClick={handleGenerate}
              disabled={!fromVersion || !toVersion || generateMutation.isPending}
              className="w-full"
              size="lg"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Layers className="h-4 w-4 mr-2" />
                  누적 패치 생성
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 생성 정보 미리보기 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">생성 정보</CardTitle>
          </CardHeader>
          <CardContent>
            {fromVersion && toVersion ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">릴리즈 타입</span>
                    <span className="text-sm font-medium">
                      {releaseType === 'STANDARD' ? '표준' : '커스텀'}
                    </span>
                  </div>
                  {customerCode && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">고객사</span>
                      <span className="text-sm font-medium">
                        {customers?.find(c => c.customerCode === customerCode)?.customerName || customerCode}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">시작 버전</span>
                    <span className="text-sm font-mono font-medium">{fromVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">종료 버전</span>
                    <span className="text-sm font-mono font-medium">{toVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">생성자</span>
                    <span className="text-sm font-medium">{user?.email}</span>
                  </div>
                  {assignedEngineer && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">담당 엔지니어</span>
                      <span className="text-sm font-medium">{assignedEngineer}</span>
                    </div>
                  )}
                  {description && (
                    <div className="pt-2 border-t">
                      <span className="text-sm text-muted-foreground block mb-1">설명</span>
                      <span className="text-sm">{description}</span>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-blue-500/10 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    <strong>{fromVersion}</strong> 초과 ~ <strong>{toVersion}</strong> 이하 버전의
                    모든 DB 변경사항이 포함된 패치가 생성됩니다.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <Layers className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm">시작 버전과 종료 버전을 선택하면</p>
                <p className="text-sm">생성 정보가 표시됩니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
