"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Package, TrendingUp, Clock, CheckCircle2 } from "lucide-react"
import axios from "axios"

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    const headers = { 'Authorization': `Bearer ${token}` }

    const fetchData = async (isPolling = false) => {
      if (!isPolling) setLoading(true)
      try {
        const [dashRes, ordersRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/dashboard?t=${new Date().getTime()}`, { headers, validateStatus: () => true }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders?t=${new Date().getTime()}`, { headers, validateStatus: () => true }),
        ])

        if (dashRes.status === 200 || dashRes.status === 201) {
          const dashData = dashRes.data
          setStats(dashData.data)
        }

        if (ordersRes.status === 200 || ordersRes.status === 201) {
          const ordersData = ordersRes.data
          const orders = ordersData.data?.orders || ordersData.data || []
          setRecentOrders(Array.isArray(orders) ? orders.slice(0, 5) : [])
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        if (!isPolling) setLoading(false)
      }
    }

    fetchData()
    
    // Auto-refresh (polling) every 15 seconds
    const intervalId = setInterval(() => {
      fetchData(true)
    }, 15000)
    
    return () => clearInterval(intervalId)
  }, [])

  const statCards = [
    { title: "Total Orders", value: stats?.totalOrders ?? '—', icon: Package, color: "text-blue-500", bg: "bg-blue-100" },
    { title: "Today's Orders", value: stats?.todaysOrders ?? '—', icon: TrendingUp, color: "text-[var(--accent)]", bg: "bg-emerald-100" },
    { title: "Revenue (Today)", value: stats?.revenue != null ? `₹${stats.revenue}` : '—', icon: CheckCircle2, color: "text-violet-500", bg: "bg-violet-100" },
    { title: "Pending Orders", value: stats?.pendingOrders ?? '—', icon: Clock, color: "text-amber-500", bg: "bg-amber-100" },
  ]

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight mb-2">Dashboard Overview</h1>
        <p className="text-[var(--muted-foreground)] font-medium">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="glass-panel premium-shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-6 relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-6">
                  <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider w-2/3 leading-tight pt-1">{stat.title}</p>
                  <div className={`p-3 rounded-2xl ${stat.bg} shadow-sm transition-transform group-hover:rotate-6 group-hover:scale-110 duration-300`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <div>
                  {loading ? (
                    <div className="h-10 w-24 bg-[var(--muted)] rounded animate-pulse" />
                  ) : (
                    <h3 className="text-4xl font-extrabold tracking-tight text-[var(--foreground)] drop-shadow-sm">{stat.value}</h3>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="glass-panel premium-shadow overflow-hidden">
        <CardHeader className="border-b border-[var(--border)]/50 bg-black/5 dark:bg-white/5 py-4">
          <CardTitle className="text-lg font-bold">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-[var(--muted)] rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-[var(--muted-foreground)] py-8">
                      No orders yet
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.address?.customerName || '—'}</TableCell>
                      <TableCell>₹{order.totalAmount}</TableCell>
                      <TableCell>
                        <Badge variant={
                          order.orderStatus === 'DELIVERED' ? 'success' :
                          order.orderStatus === 'CANCELLED' ? 'destructive' :
                          order.orderStatus === 'PENDING' ? 'warning' :
                          order.orderStatus === 'CONFIRMED' ? 'confirmed' :
                          order.orderStatus === 'OUT_FOR_DELIVERY' ? 'outForDelivery' : 'secondary'
                        }>
                          {order.orderStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={order.paymentStatus === 'PAID' ? 'success' : order.paymentStatus === 'FAILED' ? 'destructive' : 'secondary'}>
                          {order.paymentStatus}
                        </Badge>
                      </TableCell>
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
