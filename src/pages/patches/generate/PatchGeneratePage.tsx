/**
 * Patch Generate Page
 * 패치 생성 페이지 - Feature 컴포넌트를 조합하여 구성
 */

import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { usePageIcon } from '@/shared/lib/hooks'

import { useAuthStore, useProjectStore } from '@/shared/store'

import {
  PatchGenerateFormCard,
  PatchPreviewCard,
  type PatchCreateFormData,
  type ReleaseType,
  validatePatchForm,
} from '@/features/patches/patch-management'

import { customerApi } from '@/entities/operations'
import { engineerApi } from '@/entities/operations'
import { useGenerateStandardPatch, type CumulativePatchGenerateRequest } from '@/entities/patches/patch'
import { useStandardReleaseTree, type VersionNode } from '@/entities/releases/release'

import { useToast } from '@/shared/lib/hooks/use-toast'
import { PageLayout } from '@/shared/ui/page-layout'

const INITIAL_FORM_DATA: PatchCreateFormData = {
  fromVersion: '',
  toVersion: '',
  customerCode: '',
  engineerId: null,
  description: '',
  includeAllBuildVersions: false,
  patchName: '',
}

function getVersionsFromTree(
  data: { majorMinorGroups: { versions: VersionNode[] }[] } | undefined
): string[] {
  if (!data) return []

  const versions: string[] = []
  data.majorMinorGroups.forEach((group) => {
    group.versions.forEach((v) => {
      // 승인된 버전만 패치 생성 대상으로 포함
      if (v.isApproved) {
        versions.push(v.version)
      }
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
  const { icon: pageIcon } = usePageIcon()
  const { toast } = useToast()
  const user = useAuthStore((state) => state.user)
  const projectId = useProjectStore((state) => state.projectId)

  // Form state
  const [releaseType, setReleaseType] = useState<ReleaseType>('STANDARD')
  const [formData, setFormData] = useState<PatchCreateFormData>(INITIAL_FORM_DATA)

  // Queries
  const { data: treeData, isLoading: isTreeLoading } = useStandardReleaseTree(projectId, {
    enabled: releaseType === 'STANDARD',
  })

  const { data: customers } = useQuery({
    queryKey: ['customers-active'],
    queryFn: () => customerApi.getList({ isActive: true, size: 1000 }),
  })

  const { data: engineers } = useQuery({
    queryKey: ['engineers-all'],
    queryFn: () => engineerApi.getList({ size: 1000 }),
  })

  const versions = getVersionsFromTree(treeData)

  // Mutations
  const generateMutation = useGenerateStandardPatch()

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
      projectId,
      type: releaseType.toLowerCase() as 'standard' | 'custom',
      customerId: selectedCustomer?.customerId,
      fromVersion: formData.fromVersion,
      toVersion: formData.toVersion,
      createdByEmail: user?.email || '',
      engineerId: formData.engineerId || undefined,
      description: formData.description || undefined,
      includeAllBuildVersions: formData.includeAllBuildVersions || undefined,
      patchName: formData.patchName || undefined,
    }

    generateMutation.mutate(request, {
      onSuccess: (data) => {
        toast({
          title: '패치 생성 완료',
          description: `${data.patchName} 패치가 생성되었습니다.`,
        })
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
  }

  return (
    <PageLayout
      icon={pageIcon}
      title="패치 생성"
    >
      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6">
        <PatchGenerateFormCard
          releaseType={releaseType}
          formData={formData}
          versions={versions}
          customers={customers?.content || []}
          engineers={engineers?.content || []}
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
          engineers={engineers?.content || []}
          userEmail={user?.email}
        />
      </div>
    </PageLayout>
  )
}
