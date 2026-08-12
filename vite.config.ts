import path from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        global: 'globalThis',
      },
    },
    define: {
      global: 'globalThis',
    },
    server: {
      port: parseInt(env.SERVER_PORT || '3000'),
      proxy: {
        '/api': {
          target: env.VITE_API_SERVER_URL || 'http://localhost:8081',
          changeOrigin: true,
        },
        '/ws': {
          target: env.VITE_API_SERVER_URL || 'http://localhost:8081',
          changeOrigin: true,
          ws: true,
        },
      },
    },
  }
})
