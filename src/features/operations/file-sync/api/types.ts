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
    | 'VERSION'
    | 'PATCH'
    | 'RESOURCE'
    | 'BACKUP'
    | 'CUSTOM'
    | 'RELEASE_FILE'

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
