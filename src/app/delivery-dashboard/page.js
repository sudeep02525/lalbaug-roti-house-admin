  "use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LogOut, MapPin, Phone, CheckCircle2, Navigation, Package, User, Sun, Moon, KeyRound, X } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <Button variant="ghost" size="icon" className="w-9 h-9"></Button>

  return (
    <Button
      variant="ghost"
      size="icon"
      className="w-9 h-9"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      title={`Current theme: ${theme}. Click to change.`}
    >
      {theme === 'light' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-blue-400" />}
    </Button>
  )
}

export default function DeliveryDashboard() {
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [activeTab, setActiveTab] = useState('orders')
  
  // Password Change State
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '' })
  const [passLoading, setPassLoading] = useState(false)
  const [passMsg, setPassMsg] = useState({ type: '', text: '' })

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotStep, setForgotStep] = useState(1)
  const [forgotOtp, setForgotOtp] = useState("")
  const [forgotNewPassword, setForgotNewPassword] = useState("")
  const [forgotMessage, setForgotMessage] = useState("")
  const [forgotError, setForgotError] = useState("")
  const [forgotLoading, setForgotLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("delivery_token")
    const userData = localStorage.getItem("delivery_user")
    
    if (!token || !userData || userData === "undefined") {
      router.push("/delivery-login")
      return
    }
    
    try {
      setUser(JSON.parse(userData))
    } catch (e) {
      console.error("Failed to parse delivery_user data:", e)
      router.push("/delivery-login")
      return
    }
    fetchOrders(token)
  }, [router])

  const fetchOrders = async (token) => {
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/delivery-boy/orders`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setOrders(data.data || [])
      } else if (res.status === 401) {
        handleLogout()
      }
    } catch (err) {
      console.error("Failed to fetch assigned orders:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkDelivered = async (orderId) => {
    if (!confirm("Are you sure you want to mark this order as DELIVERED?")) return;
    setUpdatingId(orderId)
    const token = localStorage.getItem("delivery_token")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/delivery-boy/orders/${orderId}/deliver`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        setOrders(prev => prev.filter(o => o._id !== orderId))
      } else {
        alert("Failed to update status. Please try again.")
      }
    } catch (err) {
      console.error("Failed to mark delivered:", err)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("delivery_token")
    localStorage.removeItem("delivery_user")
    router.push("/delivery-login")
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPassMsg({ type: '', text: '' })
    if (!passForm.currentPassword || !passForm.newPassword) {
      return setPassMsg({ type: 'error', text: 'Please fill in all fields' })
    }
    setPassLoading(true)
    try {
      const token = localStorage.getItem("delivery_token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/delivery-boy/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(passForm)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to change password")
      
      setPassMsg({ type: 'success', text: 'Password changed successfully!' })
      setPassForm({ currentPassword: '', newPassword: '' })
    } catch (err) {
      setPassMsg({ type: 'error', text: err.message })
    } finally {
      setPassLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setForgotError("")
    setForgotMessage("")
    setForgotLoading(true)
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/delivery-boy/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to send OTP")
      setForgotMessage(data.message || "OTP sent to your email")
      setForgotStep(2)
    } catch (err) {
      setForgotError(err.message)
    } finally {
      setForgotLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setForgotError("")
    setForgotMessage("")
    setForgotLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/delivery-boy/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, otp: forgotOtp, newPassword: forgotNewPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to reset password")
      
      setForgotMessage("Password reset successfully!")
      setTimeout(() => {
        setShowForgotModal(false)
        setForgotStep(1)
        setForgotOtp("")
        setForgotNewPassword("")
        setForgotMessage("")
      }, 3000)
    } catch (err) {
      setForgotError(err.message)
    } finally {
      setForgotLoading(false)
    }
  }

  if (loading && !orders.length) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="layout-bg flex min-h-screen p-4 gap-4 selection:bg-[#E8A359] selection:text-[#14452F]">
      
      {/* Sidebar matching Admin Layout */}
      <aside className="w-[260px] border border-[var(--border)]/50 glass-panel hidden md:block h-[calc(100vh-32px)] fixed top-4 left-4 z-40 rounded-3xl premium-shadow overflow-hidden">
        <div className="flex h-20 items-center px-6 border-b border-[var(--border)]/50">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-3 premium-shadow overflow-hidden bg-white shrink-0 ring-2 ring-[var(--primary)]/20">
            <img src="/logo.jpeg" alt="Logo" className="object-cover w-full h-full scale-[1.05]" />
          </div>
          <h1 className="text-lg font-extrabold text-[var(--foreground)] tracking-tight">Delivery</h1>
        </div>
        
        <div className="px-4 py-4 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest mt-2">
          Partner Menu
        </div>

        <nav className="px-3 space-y-1">
          <div 
            onClick={() => setActiveTab('orders')}
            className={`relative flex items-center space-x-3 px-4 py-3.5 mb-1 rounded-2xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
              activeTab === 'orders' 
                ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] text-[var(--primary-foreground)] shadow-md shadow-[var(--primary)]/20' 
                : 'text-[var(--muted-foreground)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]'
            }`}
          >
            <Package className={`w-5 h-5 transition-transform duration-300 ${activeTab === 'orders' ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="flex-1">Assigned Orders</span>
          </div>
          
          <div 
            onClick={() => setActiveTab('profile')}
            className={`relative flex items-center space-x-3 px-4 py-3.5 mb-1 rounded-2xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] text-[var(--primary-foreground)] shadow-md shadow-[var(--primary)]/20'
                : 'text-[var(--muted-foreground)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]'
            }`}
          >
            <User className={`w-5 h-5 transition-transform duration-300 ${activeTab === 'profile' ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="flex-1">My Profile</span>
          </div>
        </nav>
        
        <div className="absolute bottom-6 left-4 right-4 flex flex-col gap-3">
          <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-2xl p-3 text-center">
             <p className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider mb-1">Status</p>
             <p className="text-sm font-bold text-[var(--foreground)]">Online & Ready</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all shadow-sm border border-red-100 dark:border-red-500/20"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 md:ml-[280px] flex flex-col min-h-[calc(100vh-32px)] relative z-10 gap-4">
        {/* Header */}
        <header className="h-20 border border-[var(--border)]/50 glass-panel flex items-center justify-between px-6 md:px-8 sticky top-0 md:top-4 z-30 transition-all duration-300 rounded-2xl md:rounded-3xl premium-shadow">
          <div className="flex items-center gap-3">
            <div className="md:hidden w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden ring-2 ring-[var(--primary)]">
              <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover scale-[1.05]" />
            </div>
            <div>
              <h1 className="font-bold text-[var(--foreground)] leading-tight text-lg sm:text-xl">Dashboard</h1>
              {user && <p className="text-xs text-[var(--muted-foreground)] font-medium">Welcome back, {user.name}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 pb-8 mt-4">
          {activeTab === 'orders' ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight mb-2">Assigned Deliveries</h2>
                <p className="text-[var(--muted-foreground)] font-medium">Orders that are currently out for delivery by you.</p>
              </div>

              {orders.length === 0 ? (
                <div className="glass-panel rounded-3xl border border-[var(--border)] p-12 text-center flex flex-col items-center justify-center min-h-[40vh]">
                  <div className="w-20 h-20 bg-[var(--muted)] rounded-full flex items-center justify-center mb-6">
                    <Package className="w-10 h-10 text-[var(--muted-foreground)] opacity-50" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">No Active Deliveries</h3>
                  <p className="text-[var(--muted-foreground)] max-w-sm">You have no pending deliveries assigned to you at the moment. Take a break!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {orders.map((order) => (
                    <Card key={order._id} className="glass-panel premium-shadow overflow-hidden flex flex-col border-[var(--border)]">
                      {/* Order Header */}
                      <div className="bg-[var(--sidebar)] border-b border-[var(--border)] p-5 flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1 block">Order ID</span>
                          <span className="text-lg font-bold text-[var(--foreground)]">#{order.orderNumber}</span>
                        </div>
                        <Badge className="bg-[#E8A359] text-white hover:bg-[#c48847] shadow-sm">
                          {order.orderStatus.replace(/_/g, ' ')}
                        </Badge>
                      </div>

                      <CardContent className="p-5 flex-1 flex flex-col gap-5">
                        {/* Customer Info */}
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 bg-[var(--primary)]/10 p-2 rounded-full text-[var(--primary)] shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-[var(--foreground)] text-sm">{order.address?.customerName || 'Customer'}</p>
                              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Amount to collect: <strong className="text-[var(--primary)]">₹{order.totalAmount}</strong> ({order.paymentStatus})</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 bg-blue-500/10 p-2 rounded-full text-blue-600 shrink-0">
                              <Phone className="w-4 h-4" />
                            </div>
                            <div className="flex-1 flex justify-between items-center">
                              <p className="font-semibold text-[var(--foreground)] text-sm">{order.address?.phone || 'N/A'}</p>
                              <a href={`tel:${order.address?.phone}`} className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-full shadow-sm transition-colors">
                                Call
                              </a>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 bg-red-500/10 p-2 rounded-full text-red-600 shrink-0">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-[var(--foreground)] text-sm leading-relaxed break-words">{[order.address?.addressLine1, order.address?.addressLine2, order.address?.city, order.address?.pincode].filter(Boolean).join(', ') || 'Address not provided'}</p>
                              {order.address?.landmark && (
                                <p className="text-xs text-[var(--muted-foreground)] mt-1">Landmark: {order.address.landmark}</p>
                              )}
                              {order.address?.latitude && order.address?.longitude && (
                                <a 
                                  href={`https://www.google.com/maps/search/?api=1&query=${order.address.latitude},${order.address.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:underline mt-2 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-md"
                                >
                                  <Navigation className="w-3 h-3" /> Get Directions
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Items Summary */}
                        <div className="mt-auto pt-4 border-t border-[var(--border)] border-dashed">
                          <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Order Items</p>
                          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-[var(--foreground)] font-medium"><span className="text-[var(--muted-foreground)]">{item.quantity}x</span> {item.item?.name || 'Item'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>

                      {/* Footer Action */}
                      <div className="p-4 border-t border-[var(--border)] bg-black/5 dark:bg-white/5">
                        <Button 
                          onClick={() => handleMarkDelivered(order._id)}
                          disabled={updatingId === order._id}
                          className="w-full bg-[#1A4D2E] hover:bg-[#11331e] text-white font-bold h-12 shadow-md hover:shadow-lg transition-all rounded-xl"
                        >
                          {updatingId === order._id ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Updating...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5" />
                              Mark as Delivered
                            </div>
                          )}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="mb-8 text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight mb-2">My Profile</h2>
                <p className="text-[var(--muted-foreground)] font-medium">Manage your personal details and account.</p>
              </div>
              
              {user && (
                <div className="glass-panel premium-shadow rounded-3xl border border-[var(--border)] overflow-hidden">
                  <div className="h-32 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] relative">
                    <div className="absolute -bottom-12 left-8 w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center p-1 border-4 border-white dark:border-[var(--card)]">
                       <div className="w-full h-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-4xl font-bold rounded-xl">
                         {user.name.charAt(0).toUpperCase()}
                       </div>
                    </div>
                  </div>
                  
                  <div className="pt-16 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Full Name</p>
                        <p className="text-lg font-semibold text-[var(--foreground)]">{user.name}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Email Address</p>
                        <p className="text-lg font-semibold text-[var(--foreground)]">{user.email}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Phone Number</p>
                        <p className="text-lg font-semibold text-[var(--foreground)]">{user.phone}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Vehicle Details</p>
                        <Badge className="bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 text-sm mt-1">
                          {user.vehicleType || 'Not Specified'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Change Password Section */}
                  <div className="border-t border-[var(--border)] bg-black/5 dark:bg-white/5 p-8">
                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-[var(--primary)]" />
                      Change Password
                    </h3>
                    
                    {passMsg.text && (
                      <div className={`mb-6 p-4 rounded-xl text-sm font-semibold border ${
                        passMsg.type === 'error' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-900/50' : 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:border-green-900/50'
                      }`}>
                        {passMsg.text}
                      </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-[var(--muted-foreground)]">Current Password</label>
                        <Input 
                          type="password" 
                          className="bg-white dark:bg-[var(--sidebar)] border-[var(--border)] rounded-xl"
                          placeholder="••••••••"
                          value={passForm.currentPassword}
                          onChange={e => setPassForm(p => ({...p, currentPassword: e.target.value}))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-[var(--muted-foreground)]">New Password</label>
                        <Input 
                          type="password" 
                          className="bg-white dark:bg-[var(--sidebar)] border-[var(--border)] rounded-xl"
                          placeholder="••••••••"
                          value={passForm.newPassword}
                          onChange={e => setPassForm(p => ({...p, newPassword: e.target.value}))}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={passLoading}
                        className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] rounded-xl shadow-md mt-2"
                      >
                        {passLoading ? 'Updating...' : 'Update Password'}
                      </Button>
                      <div className="mt-4 flex justify-end">
                        <button type="button" onClick={() => {
                          setShowForgotModal(true);
                          setTimeout(() => document.getElementById('forgot-password-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
                        }} className="text-sm text-[#114D3C] font-bold hover:underline dark:text-[#E8A359]">
                          Forget Password?
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Forgot Password Flow */}
      {showForgotModal && (
        <Card className="glass-panel premium-shadow overflow-hidden mt-8 bg-[#FAF8F5] border-[#EAE5D9]" id="forgot-password-section">
          <CardHeader className="border-b border-[#EAE5D9] bg-[#114D3C]">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-white tracking-widest uppercase text-xl font-bold font-serif">Reset Password</CardTitle>
                <CardDescription className="text-white/80 mt-2 font-medium">
                  {forgotStep === 1 ? "We will send an OTP to your registered email." : "Enter the OTP sent to your email and your new password."}
                </CardDescription>
              </div>
              <button 
                onClick={() => { setShowForgotModal(false); setForgotStep(1); setForgotMessage(""); setForgotError(""); }}
                className="text-white/60 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {forgotError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium mb-4 flex items-center border border-red-100">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 mr-2" />
                {forgotError}
              </div>
            )}
            {forgotMessage && (
              <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm font-medium mb-4 flex items-center border border-green-100">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600 mr-2" />
                {forgotMessage}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#73706A] uppercase tracking-wider mb-2 block">Email</label>
                  <Input
                    type="email"
                    value={deliveryBoy?.email || "delivery@lalbaugrotihouse.com"}
                    disabled
                    className="bg-[#EAE5D9]/50 border-[#EAE5D9] text-[#2C3E35] focus-visible:ring-[#16A34A]"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full bg-[#114D3C] hover:bg-[#0B382B] text-white rounded-xl h-12 shadow-md mt-4 text-sm tracking-widest font-bold uppercase"
                >
                  {forgotLoading ? "Sending..." : "Send OTP"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#73706A] uppercase tracking-wider mb-2 block">OTP Code</label>
                  <Input
                    type="text"
                    required
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="123456"
                    className="bg-white border-[#EAE5D9] text-[#2C3E35] focus-visible:ring-[#16A34A] tracking-widest"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#73706A] uppercase tracking-wider mb-2 block">New Password</label>
                  <Input
                    type="password"
                    required
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-white border-[#EAE5D9] text-[#2C3E35] focus-visible:ring-[#16A34A] tracking-widest"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full bg-[#114D3C] hover:bg-[#0B382B] text-white rounded-xl h-12 shadow-md mt-4 text-sm tracking-widest font-bold uppercase"
                >
                  {forgotLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
