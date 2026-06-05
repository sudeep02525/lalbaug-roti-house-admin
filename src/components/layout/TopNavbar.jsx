"use client"
import { Search, Bell, UserCircle, Sun, Moon, Monitor, LogOut } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <Button variant="ghost" size="icon" className="w-9 h-9"></Button>

  const cycleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="w-9 h-9"
      onClick={cycleTheme}
      title={`Current theme: ${theme}. Click to change.`}
    >
      {theme === 'light' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-blue-400" />}
    </Button>
  )
}

export function TopNavbar() {
  const router = useRouter()
  const [adminName, setAdminName] = useState('Admin User')
  const [adminRole, setAdminRole] = useState('Super Admin')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('admin_user')
      if (stored) {
        const user = JSON.parse(stored)
        if (user.name) setAdminName(user.name)
        if (user.role) setAdminRole(user.role)
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  return (
    <header className="h-20 border border-[var(--border)]/50 glass-panel flex items-center justify-end px-6 md:px-8 sticky top-4 z-30 transition-all duration-300 rounded-3xl premium-shadow">
      <div className="flex items-center space-x-3">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="relative w-10 h-10 rounded-full hover:bg-[var(--active-menu)] hover:text-[var(--primary)] transition-all">
          <Bell className="w-5 h-5 text-[var(--muted-foreground)]" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--card)] animate-pulse"></span>
        </Button>
        
        <div className="flex items-center space-x-4 border-l border-[var(--border)]/50 pl-5 ml-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--primary)] to-[var(--primary-hover)] p-0.5 shadow-md">
              <div className="w-full h-full rounded-full bg-[var(--card)] flex items-center justify-center">
                <UserCircle className="w-7 h-7 text-[var(--muted-foreground)]" />
              </div>
            </div>
            <div className="flex-col items-start hidden sm:flex pr-2">
              <span className="text-sm font-bold text-[var(--foreground)] leading-none mb-1">{adminName}</span>
              <span className="text-[11px] font-bold tracking-wider text-[var(--primary)] uppercase bg-[var(--active-menu)] px-2 py-0.5 rounded-full">{adminRole}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
