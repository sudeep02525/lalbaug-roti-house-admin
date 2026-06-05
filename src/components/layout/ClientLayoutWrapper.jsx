"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Sidebar } from "./Sidebar"
import { TopNavbar } from "./TopNavbar"

export function ClientLayoutWrapper({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)

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
    <div className="layout-bg flex min-h-screen p-4 gap-4">
      <Sidebar />
      <div className="flex-1 md:ml-[280px] flex flex-col min-h-[calc(100vh-32px)] relative z-10 gap-4">
        <TopNavbar />
        <main className="flex-1 overflow-auto rounded-3xl pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}
