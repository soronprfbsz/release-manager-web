import { Toaster } from '@/shared/ui/toaster'

import { AuthProvider } from './providers/AuthProvider'
import { QueryProvider } from './providers/QueryProvider'
import { RouterProvider } from './providers/RouterProvider'
import { ThemeProvider } from './providers/ThemeProvider'

import './styles/globals.css'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="release-manager-theme">
      <QueryProvider>
        <AuthProvider>
          <RouterProvider />
          <Toaster />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}

export default App
