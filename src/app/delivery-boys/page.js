"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Edit, Trash2, X, ToggleLeft, ToggleRight } from "lucide-react"

const VEHICLE_TYPES = ["Bike", "Scooter", "Bicycle", "On Foot"]

export default function DeliveryBoysPage() {
  const [boys, setBoys] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', vehicleType: 'Bike' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }

  useEffect(() => { fetchBoys() }, [])

  const fetchBoys = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/delivery-boy`, { headers })
      if (res.ok) {
        const data = await res.json()
        setBoys(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch delivery boys:', err)
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', email: '', phone: '', password: '', vehicleType: 'Bike' })
    setError("")
    setShowModal(true)
  }

  const openEdit = (boy) => {
    setEditing(boy)
    setForm({ name: boy.name, email: boy.email || '', phone: boy.phone, password: '', vehicleType: boy.vehicleType || 'Bike' })
    setError("")
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    setError("")
  }

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) return setError("Name, email, and phone are required.")
    if (!editing && !form.password.trim()) return setError("Password is required for new delivery boys.")
    setSaving(true)
    setError("")
    try {
      const payload = { name: form.name, email: form.email, phone: form.phone, vehicleType: form.vehicleType }
      if (form.password) payload.password = form.password

      const url = editing
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/delivery-boy/${editing._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/delivery-boy`
      const method = editing ? 'PUT' : 'POST'

      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to save')
      await fetchBoys()
      closeModal()
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (boy) => {
    if (!confirm(`Delete "${boy.name}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/delivery-boy/${boy._id}`, {
        method: 'DELETE',
        headers,
      })
      if (res.ok) setBoys(prev => prev.filter(b => b._id !== boy._id))
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const handleToggleActive = async (boy) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/delivery-boy/${boy._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ active: !boy.active }),
      })
      if (res.ok) {
        setBoys(prev => prev.map(b => b._id === boy._id ? { ...b, active: !b.active } : b))
      }
    } catch (err) {
      console.error('Toggle failed:', err)
    }
  }

  const filtered = boys.filter(b => {
    const term = search.toLowerCase()
    return b.name?.toLowerCase().includes(term) || b.phone?.includes(term)
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight mb-2">Delivery Boys</h1>
          <p className="text-[var(--muted-foreground)] font-medium">Manage your delivery fleet.</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Delivery Boy
        </Button>
      </div>

      <Card className="glass-panel premium-shadow overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[var(--border)]/50 bg-black/5 dark:bg-white/5 py-5">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors" />
            <Input
              placeholder="Search by name or phone..."
              className="pl-10 pr-4 py-2 bg-[var(--sidebar)] border-[var(--border)] rounded-full focus-visible:ring-1 focus-visible:ring-[var(--primary)] focus-visible:border-[var(--primary)] shadow-sm transition-all text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-[var(--muted)] rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--muted)]/50">
                  <TableHead className="pl-6">Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-[var(--muted-foreground)] py-10">
                      No delivery boys found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((boy) => (
                    <TableRow key={boy._id}>
                      <TableCell className="font-medium pl-6">{boy.name}</TableCell>
                      <TableCell>{boy.phone}</TableCell>
                      <TableCell className="text-[var(--muted-foreground)]">{boy.vehicleType || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={boy.active ? 'success' : 'secondary'}>
                          {boy.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            title={boy.active ? "Deactivate" : "Activate"}
                            onClick={() => handleToggleActive(boy)}
                            className={boy.active ? "text-green-600 hover:text-green-700" : "text-gray-400 hover:text-gray-600"}
                          >
                            {boy.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                          </Button>
                          <Button variant="ghost" size="icon" title="Edit" onClick={() => openEdit(boy)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Delete" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(boy)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
          <div className="bg-[var(--card)] rounded-2xl shadow-2xl w-full max-w-md p-6 relative z-10 border border-[var(--border)] glass-panel animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                {editing ? 'Edit Delivery Boy' : 'Add Delivery Boy'}
              </h2>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-4 mb-6">
              <div className="space-y-1">
                <label className="text-sm font-medium">Full Name</label>
                <Input name="name" placeholder="Raju Bhai" value={form.name} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Email Address</label>
                <Input name="email" type="email" placeholder="raju@example.com" value={form.email} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Phone Number</label>
                <Input name="phone" placeholder="+91 9876543210" value={form.phone} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Password {editing && <span className="text-[var(--muted-foreground)] font-normal">(leave blank to keep current)</span>}
                </label>
                <Input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Vehicle Type</label>
                <select
                  name="vehicleType"
                  value={form.vehicleType}
                  onChange={handleChange}
                  className="w-full text-sm font-semibold border border-[var(--border)] rounded-xl px-3 py-2.5 bg-[var(--sidebar)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all shadow-sm"
                >
                  {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={closeModal} disabled={saving}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
