import { Toaster } from '@/shared/ui/toaster'

import { QueryProvider } from './providers/QueryProvider'
import { RouterProvider } from './providers/RouterProvider'
import { StoreInitializer } from './providers/StoreInitializer'

import './styles/globals.css'

function App() {
  return (
    <QueryProvider>
      <StoreInitializer>
        <RouterProvider />
        <Toaster />
      </StoreInitializer>
    </QueryProvider>
  )
}

export default App
