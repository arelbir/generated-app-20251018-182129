import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Toaster } from '@/components/ui/sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
const queryClient = new QueryClient()
export function HomePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen w-full bg-muted/40">
        <Sidebar />
        <div className="flex flex-col w-full">
          <Header />
          <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:gap-12 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <Toaster richColors closeButton />
    </QueryClientProvider>
  )
}