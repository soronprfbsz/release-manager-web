export type FileSyncActionType =
    | 'REGISTER'
    | 'UPDATE_METADATA'
    | 'DELETE_METADATA'
    | 'DELETE_FILE'
    | 'IGNORE'

export type FileSyncStatus =
    | 'UNREGISTERED'
    | 'CHECKSUM_MISMATCH'
    | 'FILE_MISSING'
    | 'DB_MISSING'
    | 'METADATA_MISMATCH'

export type FileSyncTarget =
    | 'VERSION'
    | 'PATCH'
    | 'RESOURCE'
    | 'BACKUP'
    | 'CUSTOM'
    | 'RELEASE_FILE'

export interface FileSyncResult {
    id: string
    target: FileSyncTarget
    filePath: string
    status: FileSyncStatus
    message?: string
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
    status: FileSyncStatus
    ignoredBy?: string
    createdAt: string
}
