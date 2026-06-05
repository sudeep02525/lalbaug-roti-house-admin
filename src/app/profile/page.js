"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Save, X } from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  
  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotStep, setForgotStep] = useState(1)
  const [forgotOtp, setForgotOtp] = useState("")
  const [forgotNewPassword, setForgotNewPassword] = useState("")
  const [forgotMessage, setForgotMessage] = useState("")
  const [forgotError, setForgotError] = useState("")
  const [forgotLoading, setForgotLoading] = useState(false)

  useEffect(() => {
    const adminData = localStorage.getItem("admin_user")
    if (adminData && adminData !== "undefined") {
      try {
        setUser(JSON.parse(adminData))
      } catch (error) {
        console.error("Failed to parse admin_user data:", error)
      }
    }
  }, [])

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setForgotError("")
    setForgotMessage("")
    setForgotLoading(true)
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email || "admin@lalbaugrotihouse.com" }),
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email || "admin@lalbaugrotihouse.com", otp: forgotOtp, newPassword: forgotNewPassword }),
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
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight mb-2">Profile</h1>
        <p className="text-[var(--muted-foreground)] font-medium">Manage your account settings and password.</p>
      </div>

      <div className="grid gap-6">
        <Card className="glass-panel premium-shadow overflow-hidden">
          <CardHeader className="border-b border-[var(--border)]/50 bg-black/5 dark:bg-white/5">
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details and email.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Full Name</label>
              <Input defaultValue={user?.name || "Admin User"} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Email Address</label>
              <Input type="email" value={user?.email || "admin@lalbaugrotihouse.com"} disabled className="bg-[var(--muted)]/50" />
              <p className="text-[13px] text-[var(--muted-foreground)]">Email address cannot be changed.</p>
            </div>
          </CardContent>
          <CardFooter className="border-t border-[var(--border)] pt-6">
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Update Profile
            </Button>
          </CardFooter>
        </Card>

        <Card className="glass-panel premium-shadow overflow-hidden">
          <CardHeader className="border-b border-[var(--border)]/50 bg-black/5 dark:bg-white/5">
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Current Password</label>
              <Input type="password" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">New Password</label>
              <Input type="password" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Confirm New Password</label>
              <Input type="password" />
            </div>
          </CardContent>
          <CardFooter className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button variant="accent">
              Update Password
            </Button>
            <button type="button" onClick={() => {
              setShowForgotModal(true);
              setTimeout(() => document.getElementById('forgot-password-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
            }} className="text-sm text-[#114D3C] font-bold hover:underline dark:text-[#E8A359]">
              Forget Password?
            </button>
          </CardFooter>
        </Card>
      </div>

      {/* Forgot Password Flow */}
      {showForgotModal && (
        <Card className="glass-panel premium-shadow overflow-hidden mt-8 bg-[#FAF8F5] border-[#EAE5D9]" id="forgot-password-section">
          <CardHeader className="border-b border-[#EAE5D9] bg-[#114D3C]">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-white tracking-widest uppercase text-xl font-bold font-serif">Reset Password</CardTitle>
                <CardDescription className="text-white/80 mt-2 font-medium">
                  {forgotStep === 1 ? "We will send an OTP to your registered admin email." : "Enter the OTP sent to your email and your new password."}
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
                  <label className="text-xs font-bold text-[#73706A] uppercase tracking-wider mb-2 block">Admin Email</label>
                  <Input
                    type="email"
                    value={user?.email || "admin@lalbaugrotihouse.com"}
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
