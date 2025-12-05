/**
 * Resource Card Component
 * 리소스 카드 컴포넌트
 */

import { Download, Trash2 } from 'lucide-react'

import type { ResourceFile } from '@/entities/resource'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

import { getResourceColorClass, getResourceIcon } from '../lib/resourceHelpers'

interface ResourceCardProps {
  resource: ResourceFile
  onDownload: (resource: ResourceFile) => void
  onDelete: (resource: ResourceFile) => void
}

export function ResourceCard({ resource, onDownload, onDelete }: ResourceCardProps) {
  const colorClass = getResourceColorClass(resource)

  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-xl border ${colorClass}`}>
            {getResourceIcon(resource)}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(resource)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle className="text-base mt-3">
          {resource.description || resource.fileName}
        </CardTitle>
        <CardDescription className="text-xs font-mono text-muted-foreground">
          {resource.fileName}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button className="w-full" onClick={() => onDownload(resource)}>
          <Download className="h-4 w-4 mr-2" />
          다운로드
        </Button>
      </CardContent>
    </Card>
  )
}
