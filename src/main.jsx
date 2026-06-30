import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { router } from '@/router'
import '@/index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <RouterProvider router={router} />
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
