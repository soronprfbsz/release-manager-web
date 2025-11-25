export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
export const APP_TITLE = import.meta.env.VITE_APP_TITLE || 'Release Manager'

export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/login',
    SIGNUP: '/signup',
  },
  RELEASES: {
    STANDARD: '/releases/standard',
    CUSTOM: '/releases/custom',
  },
  PATCHES: {
    GENERATE: '/patches/generate',
    HISTORY: '/patches/history',
    DOWNLOAD: '/patches/download',
  },
  SCRIPTS: {
    BACKUP: '/scripts/backup',
    RESTORE: '/scripts/restore',
  },
  CUSTOMERS: {
    LIST: '/customers',
  },
} as const

export const RELEASE_TYPE = {
  STANDARD: 'standard',
  CUSTOM: 'custom',
} as const

export const DATABASE_TYPE = {
  MARIADB: 'MARIADB',
  CRATEDB: 'CRATEDB',
} as const

export const PATCH_STATUS = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  PENDING: 'PENDING',
} as const
