/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_SERVER_URL?: string  // 로컬 개발 전용 (Vite dev server proxy)
  readonly VITE_APP_TITLE: string
  readonly VITE_API_TIMEOUT_DEFAULT?: string
  readonly VITE_API_TIMEOUT_FILE_OPERATION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
