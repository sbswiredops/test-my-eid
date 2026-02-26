"use client"

import { useState } from "react"
import { useOrders } from "@/lib/order-store"
import { formatPrice } from "@/lib/data"
import type { OrderStatus } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Eye, Printer } from "lucide-react"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const statusOptions: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
]

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useOrders()
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [viewingOrder, setViewingOrder] = useState<string | null>(null)

  const filtered = orders.filter((order) => {
    const orderIdentifier = (order as any).orderId || order.id || "";
    const matchesSearch =
      orderIdentifier.toString().toLowerCase().includes(search.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const selectedOrder = orders.find((o) => o.id === viewingOrder)

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Orders
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage customer orders ({orders.length} total)
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order ID, name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statusOptions.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-4 font-medium text-muted-foreground">
                    Order ID
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    Customer
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    Total
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="p-4 font-mono text-xs">{order.orderId || order.id}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {order.customer.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.customer.phone}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 font-medium">
                      {formatPrice(order.total)}
                    </td>
                    <td className="p-4">
                      <Select
                        value={order.status}
                        onValueChange={(val) =>
                          updateOrderStatus(order.id, val as OrderStatus)
                        }
                      >
                        <SelectTrigger className="h-8 w-32">
                          <Badge
                            variant="secondary"
                            className={statusColors[order.status]}
                          >
                            {order.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((s) => (
                            <SelectItem
                              key={s}
                              value={s}
                              className="capitalize"
                            >
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-PK")}
                    </td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewingOrder(order.id)}
                        aria-label={`View order ${order.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No orders found.{" "}
              {orders.length === 0
                ? "Orders placed by customers will appear here."
                : "Try adjusting your filters."}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog
        open={!!viewingOrder}
        onOpenChange={(open) => !open && setViewingOrder(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">
              Order {selectedOrder?.orderId || selectedOrder?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="flex flex-col gap-6 pt-2" id="invoice-content">
              {/* Customer Info */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  Customer Details
                </h3>
                <div className="rounded-lg border p-3 text-sm">
                  <p>
                    <span className="text-muted-foreground">Name:</span>{" "}
                    {selectedOrder.customer.name}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    {selectedOrder.customer.email}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Phone:</span>{" "}
                    {selectedOrder.customer.phone}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Address:</span>{" "}
                    {selectedOrder.customer.address}
                  </p>
                  <p>
                    <span className="text-muted-foreground">District:</span>{" "}
                    {selectedOrder.customer.district}
                  </p>
                  {selectedOrder.customer.notes && (
                    <p>
                      <span className="text-muted-foreground">Notes:</span>{" "}
                      {selectedOrder.customer.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  Order Items
                </h3>
                <div className="flex flex-col gap-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border p-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Size: {item.size} | Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-lg border p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>
                    {selectedOrder.deliveryCharge === 0
                      ? "Free"
                      : formatPrice(selectedOrder.deliveryCharge)}
                  </span>
                </div>
                <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <div>
                  <span className="text-muted-foreground">Payment:</span>{" "}
                  {selectedOrder.paymentMethod}
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>{" "}
                  {new Date(selectedOrder.createdAt).toLocaleDateString(
                    "en-PK",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </div>
              </div>

              <Button variant="outline" onClick={handlePrint} className="w-full">
                <Printer className="mr-2 h-4 w-4" />
                Print Invoice
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
