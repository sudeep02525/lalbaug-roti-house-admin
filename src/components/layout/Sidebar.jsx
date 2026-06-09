"use client"
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Tags, 
  Bike, 
  Users, 
  Settings, 
  User,
  Video,
  LogOut,
  UtensilsCrossed,
  X
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Orders', href: '/orders', icon: ShoppingBag },
  { name: 'Videos', href: '/media', icon: Video },
  { name: 'Delivery Boys', href: '/delivery-boys', icon: Bike },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Menu', href: '/menu', icon: UtensilsCrossed },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Profile', href: '/profile', icon: User },
]

export function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    router.push('/login')
  }

  return (
    <aside className={`w-[260px] border border-[var(--border)]/50 glass-panel h-[calc(100vh-16px)] md:h-[calc(100vh-32px)] fixed top-2 md:top-4 z-40 rounded-2xl md:rounded-3xl premium-shadow overflow-hidden transition-all duration-300 ${isOpen ? 'left-2 translate-x-0' : '-translate-x-[150%] md:translate-x-0 left-2 md:left-4'}`}>
      <div className="flex h-16 md:h-20 items-center justify-between px-6 border-b border-[var(--border)]/50">
        <div className="flex items-center">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mr-3 premium-shadow overflow-hidden bg-white shrink-0">
            <Image src="/logo.jpeg" alt="Lalbaug Roti House" width={48} height={48} className="object-cover w-full h-full" />
          </div>
          <h1 className="text-lg font-extrabold text-[var(--foreground)] tracking-tight">Lalbaug Roti</h1>
        </div>
        <button onClick={onClose} className="md:hidden text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="px-4 py-4 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest mt-2">
        Overview
      </div>

      <nav className="px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/')
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`relative flex items-center space-x-3 px-4 py-3.5 mb-1 rounded-2xl text-sm font-semibold transition-all duration-300 group ${
                isActive 
                  ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] text-[var(--primary-foreground)] shadow-md shadow-[var(--primary)]/20' 
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110 text-[var(--primary-foreground)]' : 'group-hover:scale-110'}`} />
              <span className="flex-1">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-6 left-4 right-4">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all shadow-sm border border-red-100 dark:border-red-500/20"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
