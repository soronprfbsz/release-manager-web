/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_API_TIMEOUT_DEFAULT?: string
  readonly VITE_API_TIMEOUT_FILE_OPERATION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
