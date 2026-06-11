"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Navigation } from "lucide-react";
import Link from "next/link";

const ORDER_STATUSES = [
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    fetchOrders();
    fetchDeliveryBoys();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders?t=${new Date().getTime()}`,
        { headers },
      );
      if (res.ok) {
        const data = await res.json();
        const list = data.data?.orders || data.data || [];
        setOrders(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryBoys = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/delivery-boy`,
        { headers },
      );
      if (res.ok) {
        const data = await res.json();
        setDeliveryBoys(data.data?.filter((b) => b.active) || []);
      }
    } catch (err) {
      console.error("Failed to fetch delivery boys:", err);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/${orderId}/status`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId ? { ...o, orderStatus: newStatus } : o,
          ),
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAssign = async (orderId, deliveryBoyId) => {
    if (!deliveryBoyId) return;
    setUpdatingId(orderId);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/${orderId}/assign`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({ deliveryBoyId }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        fetchOrders();
      } else {
        alert(`Failed to assign delivery boy: ${data.message}`);
      }
    } catch (err) {
      console.error("Failed to assign:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    const term = search.toLowerCase();
    return (
      o.orderNumber?.toLowerCase().includes(term) ||
      o.address?.customerName?.toLowerCase().includes(term) ||
      o.address?.phone?.includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight mb-2">
            Orders Management
          </h1>
          <p className="text-[var(--muted-foreground)] font-medium">
            Manage and track all customer orders.
          </p>
        </div>
      </div>

      <Card className="glass-panel premium-shadow overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[var(--border)]/50 bg-black/5 dark:bg-white/5 py-5">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors" />
            <Input
              placeholder="Search by order ID, customer or phone..."
              className="pl-10 pr-4 py-2 bg-[var(--sidebar)] border-[var(--border)] rounded-full focus-visible:ring-1 focus-visible:ring-[var(--primary)] focus-visible:border-[var(--primary)] shadow-sm transition-all text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-6">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-[var(--muted)] rounded animate-pulse"
                />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--muted)]/50">
                  <TableHead className="pl-6">Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delivery Boy</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-[var(--muted-foreground)] py-10"
                    >
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium pl-6">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        {order.address?.customerName || "—"}
                      </TableCell>
                      <TableCell>{order.address?.phone || "—"}</TableCell>
                      <TableCell className="font-semibold">
                        ₹{order.totalAmount}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-start gap-1">
                          <Badge
                            variant={
                              order.paymentStatus === "PAID"
                                ? "success"
                                : order.paymentStatus === "FAILED"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {order.paymentStatus}
                          </Badge>
                          {order.razorpayPaymentId && (
                            <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                              {order.razorpayPaymentId}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <select
                          className="text-sm font-semibold border border-[var(--border)] rounded-lg px-3 py-1.5 bg-[var(--sidebar)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 disabled:opacity-50 transition-all shadow-sm"
                          value={order.orderStatus}
                          onChange={(e) =>
                            handleStatusChange(order._id, e.target.value)
                          }
                          disabled={updatingId === order._id}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell>
                        {order.assignedDeliveryBoy ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-[var(--primary)]">
                              {order.assignedDeliveryBoy.name}
                            </span>
                            <span className="text-xs text-[var(--muted-foreground)]">
                              Assigned
                            </span>
                          </div>
                        ) : (
                          <select
                            className="text-sm border border-[var(--border)] rounded-lg px-2 py-1.5 bg-[var(--sidebar)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 disabled:opacity-50 transition-all"
                            value=""
                            onChange={(e) =>
                              handleAssign(order._id, e.target.value)
                            }
                            disabled={
                              updatingId === order._id ||
                              deliveryBoys.length === 0
                            }
                          >
                            <option value="" disabled>
                              Assign...
                            </option>
                            {deliveryBoys.map((b) => (
                              <option key={b._id} value={b._id}>
                                {b.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        {order.address?.latitude &&
                          order.address?.longitude && (
                            <Link
                              href={`https://www.google.com/maps/search/?api=1&query=${order.address.latitude},${order.address.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="outline"
                                size="icon"
                                title="Open in Google Maps"
                                className="border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
                              >
                                <Navigation className="w-4 h-4" />
                              </Button>
                            </Link>
                          )}
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
  );
}
