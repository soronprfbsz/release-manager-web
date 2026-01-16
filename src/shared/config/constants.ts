// 프론트엔드는 항상 상대 경로 사용 → Nginx 프록시가 백엔드로 라우팅
export const API_BASE_URL = ''
export const APP_TITLE = import.meta.env.VITE_APP_TITLE || 'Release Manager'

// API Timeout Configuration (milliseconds)
export const API_TIMEOUT = {
  DEFAULT: Number(import.meta.env.VITE_API_TIMEOUT_DEFAULT || 30000), // 30초
  FILE_OPERATION: Number(import.meta.env.VITE_API_TIMEOUT_FILE_OPERATION || 7200000), // 2시간
} as const

export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/login',
    SIGNUP: '/signup',
  },
  RELEASES: '/releases',
  PATCHES: '/patches',
  OPERATIONS: {
    CUSTOMERS: '/operations/customers',
    DEPARTMENTS: '/operations/departments',
    ACCOUNTS: '/operations/accounts',
    PROJECTS: '/operations/projects',
    FILE_SYNC: '/operations/file-sync',
  },
  SUPPORT: {
    REMOTE_JOBS: {
      MARIADB: '/support/remote-jobs/mariadb',
      TERMINAL: '/support/remote-jobs/terminal',
    },
    INFRASTRUCTURE: {
      RESOURCES: '/support/infrastructure/resources',
      SERVICES: '/support/infrastructure/services',
    },
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
