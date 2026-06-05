"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          const orders = data.data?.orders || data.data || []

          // Group orders by phone to get unique customers
          const map = {}
          for (const order of orders) {
            const phone = order.address?.phone
            if (!phone) continue
            if (!map[phone]) {
              map[phone] = {
                name: order.address?.customerName || '—',
                phone,
                orderCount: 0,
                totalSpend: 0,
              }
            }
            map[phone].orderCount += 1
            map[phone].totalSpend += order.totalAmount || 0
          }

          setCustomers(Object.values(map).sort((a, b) => b.orderCount - a.orderCount))
        }
      } catch (err) {
        console.error('Failed to fetch customers:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  const filtered = customers.filter(c => {
    const term = search.toLowerCase()
    return c.name.toLowerCase().includes(term) || c.phone.includes(term)
  })

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight mb-2">Customers</h1>
        <p className="text-[var(--muted-foreground)] font-medium">Overview of all customers derived from order history.</p>
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
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-[var(--muted)] rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--muted)]/50">
                  <TableHead className="pl-6">Customer Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead>Total Spend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-[var(--muted-foreground)] py-10">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((customer) => (
                    <TableRow key={customer.phone}>
                      <TableCell className="font-medium pl-6">{customer.name}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.orderCount}</TableCell>
                      <TableCell className="font-semibold">₹{customer.totalSpend}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
