export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
export const APP_TITLE = import.meta.env.VITE_APP_TITLE || 'Release Manager'

// API Timeout Configuration (milliseconds)
export const API_TIMEOUT = {
  DEFAULT: Number(import.meta.env.VITE_API_TIMEOUT_DEFAULT || 30000), // 30초
  FILE_OPERATION: Number(import.meta.env.VITE_API_TIMEOUT_FILE_OPERATION || 1800000), // 30분
} as const

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
    STANDARD: '/patches/standard',
    CUSTOM: '/patches/custom',
  },
  OPERATIONS: {
    CUSTOMERS: '/operations/customers',
    ENGINEERS: '/operations/engineers',
    ACCOUNTS: '/operations/accounts',
  },
  JOBS: {
    MARIADB: '/jobs/mariadb',
  },
  RESOURCES: {
    ROOT: '/resources',
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
