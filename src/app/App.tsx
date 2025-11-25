import { QueryProvider } from './providers/QueryProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { AuthProvider } from './providers/AuthProvider'
import { RouterProvider } from './providers/RouterProvider'
import { Toaster } from '@/shared/ui/toaster'
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
