import { useQuery } from '@tanstack/react-query'
import {
  Download,
  RefreshCw,
  FileCode,
  RotateCcw,
  HardDrive,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { TypographyLarge, TypographyMuted } from '@/shared/ui/typography'
import { Button } from '@/shared/ui/button'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Link } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb'
import { scriptApi, type ScriptType } from '@/entities/script'

/** code 기반 아이콘 매핑 */
function getScriptIcon(code: string) {
  const lowerCode = code.toLowerCase()
  if (lowerCode.includes('backup')) {
    return <HardDrive className="h-8 w-8" />
  }
  if (lowerCode.includes('restore') || lowerCode.includes('recovery')) {
    return <RotateCcw className="h-8 w-8" />
  }
  return <FileCode className="h-8 w-8" />
}

/** code 기반 색상 클래스 */
function getScriptColorClass(code: string) {
  const lowerCode = code.toLowerCase()
  if (lowerCode.includes('backup')) {
    return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
  }
  if (lowerCode.includes('restore') || lowerCode.includes('recovery')) {
    return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
  }
  return 'text-slate-500 bg-slate-500/10 border-slate-500/20'
}

/** 파일 확장자 추출 */
function getFileExtension(fileName: string) {
  const ext = fileName.split('.').pop()
  return ext ? `.${ext}` : ''
}

export function ScriptDownloadPage() {
  const {
    data: scripts,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['script-types'],
    queryFn: scriptApi.getTypes,
  })

  const handleDownload = (script: ScriptType) => {
    scriptApi.download(script.code)
  }

  const scriptList = scripts || []

  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>리소스 관리</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">리소스 관리</h1>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
          <FileText className="h-16 w-16 mb-4 opacity-50" />
          <p className="text-lg mb-2">데이터를 불러오는 중 오류가 발생했습니다.</p>
          <p className="text-sm mb-4">{(error as Error).message}</p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            다시 시도
          </Button>
        </div>
      </div>
    )
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
            <BreadcrumbPage>리소스 관리</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <PageHeader
        icon={<Download className="h-5 w-5 text-primary" />}
        title="리소스 관리"
        description="데이터베이스 백업 및 복원에 필요한 스크립트를 다운로드할 수 있습니다."
        actions={
          <Button onClick={() => refetch()} variant="outline" size="icon" title="새로고침">
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <p className="text-sm text-muted-foreground">스크립트 목록을 불러오는 중...</p>
          </div>
        </div>
      ) : scriptList.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <FileCode className="h-16 w-16 mb-4 opacity-50" />
          <TypographyLarge>등록된 스크립트가 없습니다.</TypographyLarge>
          <TypographyMuted>관리자에게 문의하세요.</TypographyMuted>
        </div>
      ) : (
        /* Script Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scriptList.map((script) => {
            const colorClass = getScriptColorClass(script.code)

            return (
              <Card
                key={script.code}
                className="group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/30"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl border ${colorClass}`}>
                      {getScriptIcon(script.code)}
                    </div>
                    <Badge variant="outline" className="text-xs font-mono">
                      {getFileExtension(script.fileName)}
                    </Badge>
                  </div>
                  <CardTitle className="text-base mt-3">{script.description}</CardTitle>
                  <CardDescription className="text-xs font-mono text-muted-foreground">
                    {script.fileName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    className="w-full"
                    onClick={() => handleDownload(script)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    다운로드
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
