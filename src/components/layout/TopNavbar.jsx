"use client"
import { Search, Bell, UserCircle, Sun, Moon, Monitor, LogOut, Menu } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

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

export function TopNavbar({ onMenuClick }) {
  const router = useRouter()
  const [adminName, setAdminName] = useState('Admin User')
  const [adminRole, setAdminRole] = useState('Admin')

  const [notifications, setNotifications] = useState([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) return
      
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders`, {
        headers: { 'Authorization': `Bearer ${token}` },
        validateStatus: () => true
      })
      if (res.status === 200 || res.status === 201) {
        const data = res.data
        const newOrders = (data.data || []).filter(o => o.orderStatus === 'CONFIRMED')
        setNotifications(newOrders)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [])

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

  // Close dropdown when clicking outside could be added, but for simplicity we rely on clicks inside
  
  return (
    <header className="h-16 md:h-20 border border-[var(--border)]/50 glass-panel flex items-center justify-between px-4 md:px-8 sticky top-2 md:top-4 z-30 transition-all duration-300 rounded-2xl md:rounded-3xl premium-shadow">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden mr-2">
          <Menu className="w-6 h-6 text-[var(--foreground)]" />
        </Button>
      </div>
      <div className="flex items-center space-x-2 md:space-x-3">
        <ThemeToggle />
        
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative w-10 h-10 rounded-full hover:bg-[var(--active-menu)] hover:text-[var(--primary)] transition-all"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Bell className="w-5 h-5 text-[var(--muted-foreground)]" />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--card)] animate-pulse"></span>
            )}
          </Button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden z-50 premium-shadow">
              <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--sidebar)]">
                <h3 className="font-bold text-[var(--foreground)]">Notifications</h3>
                <span className="text-xs bg-[var(--primary)] text-white px-2 py-0.5 rounded-full">{notifications.length} New</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-[var(--muted-foreground)]">
                    <p className="text-sm font-medium">No new notifications</p>
                  </div>
                ) : (
                  notifications.map(order => (
                    <div 
                      key={order._id} 
                      className="p-4 border-b border-[var(--border)] hover:bg-[var(--active-menu)] cursor-pointer transition-colors"
                      onClick={() => {
                        setIsDropdownOpen(false)
                        router.push('/orders')
                      }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-sm text-[var(--foreground)]">Order: #{order.orderNumber}</span>
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Amount: ₹{order.totalAmount}
                      </p>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div 
                  className="p-3 text-center border-t border-[var(--border)] bg-[var(--sidebar)] hover:bg-[var(--active-menu)] cursor-pointer transition-colors"
                  onClick={() => {
                    setIsDropdownOpen(false)
                    router.push('/orders')
                  }}
                >
                  <span className="text-sm font-bold text-[var(--primary)]">View All Orders</span>
                </div>
              )}
            </div>
          )}
        </div>
        
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
