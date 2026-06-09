"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Sidebar } from "./Sidebar"
import { TopNavbar } from "./TopNavbar"

export function ClientLayoutWrapper({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const noLayoutPaths = ['/login', '/delivery-login', '/delivery-dashboard']
  const isAuthPage = noLayoutPaths.includes(pathname)

  useEffect(() => {
    if (isAuthPage) {
      setAuthChecked(true)
      return
    }

    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/login')
    } else {
      setAuthChecked(true)
    }

    // Global fetch interceptor for 401 Unauthorized
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        try {
          const response = await originalFetch(...args);
          if (response.status === 401) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            // Force reload to login to clear any state
            window.location.href = '/login';
          }
          return response;
        } catch (error) {
          throw error;
        }
      };
    }
  }, [pathname, isAuthPage, router])

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--muted-foreground)]">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (isAuthPage) {
    return (
      <main className="min-h-screen bg-[var(--background)] w-full">
        {children}
      </main>
    )
  }

  return (
    <div className="layout-bg flex min-h-screen p-2 md:p-4 gap-2 md:gap-4 relative">
      <Sidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
      
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div className="flex-1 md:ml-[280px] flex flex-col min-h-[calc(100vh-16px)] md:min-h-[calc(100vh-32px)] relative z-10 gap-2 md:gap-4 w-full">
        <TopNavbar onMenuClick={() => setIsMobileOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto rounded-2xl md:rounded-3xl pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}
