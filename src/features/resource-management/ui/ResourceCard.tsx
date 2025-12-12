/**
 * Resource Card Component
 * 리소스 카드 컴포넌트
 */

import { Download, Trash2 } from 'lucide-react'

import type { ResourceFile } from '@/entities/resource'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

import { getCardColorClass, getSubCategoryIcon } from '../lib/resourceHelpers'

interface ResourceCardProps {
  resource: ResourceFile
  onDownload: (resource: ResourceFile) => void
  onDelete: (resource: ResourceFile) => void
}

export function ResourceCard({ resource, onDownload, onDelete }: ResourceCardProps) {
  const colorClass = getCardColorClass(resource.fileCategory)
  const icon = getSubCategoryIcon(resource.subCategory)

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-200 hover:shadow-md ${colorClass}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-muted/50 flex-shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate">
                {resource.description || resource.fileName}
              </CardTitle>
              <CardDescription className="text-xs font-mono text-muted-foreground truncate">
                {resource.fileName}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(resource)}
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
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
