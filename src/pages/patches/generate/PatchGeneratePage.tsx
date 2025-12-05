/**
 * Patch Generate Page
 * 패치 생성 페이지 - Feature 컴포넌트를 조합하여 구성
 */

import { useState } from 'react'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Layers } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useAuth } from '@/app/providers/AuthProvider'

import {
  PatchGenerateFormCard,
  PatchPreviewCard,
  type PatchCreateFormData,
  type ReleaseType,
  validatePatchForm,
} from '@/features/patch-management'

import { customerApi } from '@/entities/customer'
import { patchApi, type CumulativePatchGenerateRequest } from '@/entities/patch'
import { releaseApi, type VersionNode } from '@/entities/release'

import { useToast } from '@/shared/lib/hooks/use-toast'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'
import { PageHeader } from '@/shared/ui/page-header'

const INITIAL_FORM_DATA: PatchCreateFormData = {
  fromVersion: '',
  toVersion: '',
  customerCode: '',
  assignedEngineer: '',
  description: '',
}

function getVersionsFromTree(
  data: { majorMinorGroups: { versions: VersionNode[] }[] } | undefined
): string[] {
  if (!data) return []

  const versions: string[] = []
  data.majorMinorGroups.forEach((group) => {
    group.versions.forEach((v) => {
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

  // Form state
  const [releaseType, setReleaseType] = useState<ReleaseType>('STANDARD')
  const [formData, setFormData] = useState<PatchCreateFormData>(INITIAL_FORM_DATA)

  // Queries
  const { data: treeData, isLoading: isTreeLoading } = useQuery({
    queryKey: ['standard-release-tree'],
    queryFn: releaseApi.getStandardTree,
    enabled: releaseType === 'STANDARD',
  })

  const { data: customers } = useQuery({
    queryKey: ['customers-active'],
    queryFn: () => customerApi.getList({ isActive: true, size: 1000 }),
  })

  const versions = getVersionsFromTree(treeData)

  // Mutations
  const generateMutation = useMutation({
    mutationFn: (request: CumulativePatchGenerateRequest) => patchApi.generate(request),
    onSuccess: (data) => {
      toast({
        title: '패치 생성 완료',
        description: `${data.patchName} 패치가 생성되었습니다.`,
      })
      queryClient.invalidateQueries({ queryKey: ['cumulative-patches'] })
      setFormData(INITIAL_FORM_DATA)
    },
    onError: (error: Error) => {
      toast({
        title: '패치 생성 실패',
        description: error.message || '패치 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    },
  })

  // Handlers
  const handleSubmit = () => {
    const validation = validatePatchForm(formData)
    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors).join(' ')
      toast({ title: '입력 오류', description: errorMessage, variant: 'destructive' })
      return
    }

    const selectedCustomer = customers?.content.find(
      (c) => c.customerCode === formData.customerCode
    )

    const request: CumulativePatchGenerateRequest = {
      type: releaseType.toLowerCase() as 'standard' | 'custom',
      customerId: selectedCustomer?.customerId,
      fromVersion: formData.fromVersion,
      toVersion: formData.toVersion,
      createdBy: user?.email || '',
      patchedBy: formData.assignedEngineer || undefined,
      description: formData.description || undefined,
    }

    generateMutation.mutate(request)
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span>패치 관리</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>패치 생성</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <PageHeader
        icon={<Layers className="h-5 w-5 text-primary" />}
        title="패치 생성"
        description="버전 범위를 선택하여 누적 패치 파일을 생성합니다."
      />

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6">
        <PatchGenerateFormCard
          releaseType={releaseType}
          formData={formData}
          versions={versions}
          customers={customers?.content || []}
          isVersionsLoading={isTreeLoading}
          isSubmitting={generateMutation.isPending}
          onReleaseTypeChange={setReleaseType}
          onFormDataChange={setFormData}
          onSubmit={handleSubmit}
        />

        <PatchPreviewCard
          releaseType={releaseType}
          formData={formData}
          customers={customers?.content || []}
          userEmail={user?.email}
        />
      </div>
    </div>
  )
}
