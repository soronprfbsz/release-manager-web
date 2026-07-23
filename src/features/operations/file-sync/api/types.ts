export type FileSyncActionType =
    | 'REGISTER'
    | 'UPDATE_METADATA'
    | 'DELETE_METADATA'
    | 'DELETE_FILE'
    | 'IGNORE'

export type FileSyncStatus =
    | 'UNREGISTERED'
    | 'SIZE_MISMATCH'
    | 'CHECKSUM_MISMATCH'
    | 'FILE_MISSING'
    | 'DB_MISSING'
    | 'METADATA_MISMATCH'

export type FileSyncTarget =
    | 'RELEASE_FILE'
    | 'RESOURCE_FILE'
    | 'BACKUP_FILE'
    | 'PATCH_FILE'

export interface FileInfo {
    size: number
    checksum: string
    lastModified: string
}

export interface DbInfo {
    id: number
    size: number
    checksum: string
    registeredAt: string
}

export interface FileSyncResult {
    id: string
    target: FileSyncTarget
    targetName: string
    filePath: string
    fileName: string
    status: FileSyncStatus
    message?: string
    fileInfo?: FileInfo
    dbInfo?: DbInfo
    availableActions?: FileSyncActionType[]
    suggestedAction?: FileSyncActionType
}

export interface FileSyncAnalyzeResponse {
    analyzedAt: string
    discrepancies: FileSyncResult[]
}

export interface FileSyncRequest {
    targetTypes?: string[]
}

export interface FileSyncAction {
    id: string
    action: FileSyncActionType
    metadata?: Record<string, unknown>
}

export interface FileSyncApplyRequest {
    actions: FileSyncAction[]
}

// 무시된 파일 관련 타입
export interface IgnoredFile {
    ignoreId: number
    filePath: string
    targetType: FileSyncTarget
    targetTypeName: string
    status: FileSyncStatus
    ignoredBy?: string
    createdAt: string
}

// ============================================================================
// 파일 등록 API 타입 (Target별 분리)
// ============================================================================

// 리소스 파일 등록
export interface ResourceRegisterItem {
    id: string                    // 필수: analyze 결과의 discrepancy ID
    resourceFileName?: string     // 선택: 리소스 관리용 이름
    fileCategory?: string         // 선택: 대분류 오버라이드
    subCategory?: string          // 선택: 소분류 오버라이드
    description?: string          // 선택: 설명
}

export interface ResourceRegisterRequest {
    items: ResourceRegisterItem[]
}

// 백업 파일 등록
export interface BackupRegisterItem {
    id: string                    // 필수
    fileCategory?: string         // 선택: 카테고리 오버라이드
    description?: string          // 선택
}

export interface BackupRegisterRequest {
    items: BackupRegisterItem[]
}

// 패치 파일 등록
export interface PatchRegisterItem {
    id: string                    // 필수
    assigneeId?: number           // 선택: 담당자 ID
    siteCode?: string         // 선택: 사이트 코드 (커스텀 패치)
    description?: string          // 선택
}

export interface PatchRegisterRequest {
    items: PatchRegisterItem[]
}

// 릴리즈 파일 등록
export interface ReleaseRegisterItem {
    id: string                    // 필수
    releaseVersionId?: number     // 선택: 버전 ID (자동 추론 가능)
    fileCategory?: string         // 선택: DATABASE/WEB/ENGINE/ETC
    subCategory?: string          // 선택
    executionOrder?: number       // 선택: 실행 순서 (기본값 99)
    description?: string          // 선택
}

export interface ReleaseRegisterRequest {
    items: ReleaseRegisterItem[]
}

// 등록 결과 (공통)
export interface RegisterResultItem {
    id: string
    filePath: string
    success: boolean
    message: string
    registeredId?: number         // 등록된 DB ID
}

export interface RegisterResponse {
    registeredAt: string
    results: RegisterResultItem[]
    summary: {
        total: number
        success: number
        failed: number
    }
}
