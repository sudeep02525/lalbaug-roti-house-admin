"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"

export default function SettingsPage() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/settings`)
      if (res.ok) {
        const data = await res.json()
        setSettings(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/settings`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          minOrderQty: Number(settings.minOrderQty),
          maxRadiusKm: Number(settings.maxRadiusKm),
          restaurantLat: Number(settings.restaurantLat),
          restaurantLng: Number(settings.restaurantLng),
          restaurantPhone: settings.restaurantPhone,
          restaurantName: settings.restaurantName,
        }),
      })
      if (res.ok) {
        showToast('Settings saved successfully!')
      } else {
        const data = await res.json()
        showToast(data.message || 'Failed to save settings', 'error')
      }
    } catch (err) {
      showToast('Unable to connect to server', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight mb-2">System Settings</h1>
          <p className="text-[var(--muted-foreground)] font-medium">Configure global settings for the platform.</p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-[var(--muted)] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight mb-2">System Settings</h1>
        <p className="text-[var(--muted-foreground)] font-medium">Configure global settings for the platform.</p>
      </div>

      <Card className="glass-panel premium-shadow overflow-hidden">
        <CardHeader className="border-b border-[var(--border)]/50 bg-black/5 dark:bg-white/5">
          <CardTitle>Restaurant Info</CardTitle>
          <CardDescription>Basic restaurant contact and location details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Restaurant Name</label>
              <Input
                value={settings?.restaurantName || ''}
                onChange={e => handleChange('restaurantName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Restaurant Phone</label>
              <Input
                value={settings?.restaurantPhone || ''}
                onChange={e => handleChange('restaurantPhone', e.target.value)}
                placeholder="9324688099"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Restaurant Latitude</label>
              <Input
                type="number"
                step="0.0001"
                value={settings?.restaurantLat || ''}
                onChange={e => handleChange('restaurantLat', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Restaurant Longitude</label>
              <Input
                type="number"
                step="0.0001"
                value={settings?.restaurantLng || ''}
                onChange={e => handleChange('restaurantLng', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel premium-shadow overflow-hidden">
        <CardHeader className="border-b border-[var(--border)]/50 bg-black/5 dark:bg-white/5">
          <CardTitle>Delivery Settings</CardTitle>
          <CardDescription>Update rules regarding delivery charges and order limits.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Minimum Order Quantity (Rotis)</label>
              <Input
                type="number"
                value={settings?.minOrderQty || ''}
                onChange={e => handleChange('minOrderQty', e.target.value)}
              />
              <p className="text-[13px] text-[var(--muted-foreground)]">The minimum number of rotis required to place an order.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Maximum Delivery Radius (km)</label>
              <Input
                type="number"
                value={settings?.maxRadiusKm || ''}
                onChange={e => handleChange('maxRadiusKm', e.target.value)}
              />
              <p className="text-[13px] text-[var(--muted-foreground)]">Deliveries beyond this radius will be rejected.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t border-[var(--border)] pt-6">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
