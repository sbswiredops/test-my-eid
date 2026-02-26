"use client"

import React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useOrders } from "@/lib/order-store"
import { formatPrice } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function OrderDetailsPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const { getOrderById } = useOrders()
  const id = params.id
  const order = id ? getOrderById(id) : undefined

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">Order not found.</p>
        <div className="mt-4">
          <Button asChild>
            <Link href="/account?tab=orders">Back to Orders</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Order Details</h1>
          <p className="mt-1 text-sm text-muted-foreground">Order: <span className="font-mono">{order.orderId ?? order.id}</span></p>
        </div>
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-2 rounded-lg border border-border/60 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">Items</h2>
          <div className="flex flex-col gap-4">
            {order.items.map((it) => (
              <div key={it.id ?? `${it.productId}-${it.size}`} className="flex items-center gap-4">
                {it.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.image} alt={it.name} className="h-16 w-16 rounded object-cover" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{it.name}</div>
                      <div className="text-xs text-muted-foreground">Size: {it.size ?? "-"}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatPrice(it.price)}</div>
                      <div className="text-xs text-muted-foreground">Qty: {it.quantity}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border/60 bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">Order Info</h2>
          <div className="text-sm">
            <p className="mb-2"><span className="font-medium">Customer:</span> {order.customer?.name ?? "-"}</p>
            <p className="mb-2"><span className="font-medium">Email:</span> {order.customer?.email ?? "-"}</p>
            <p className="mb-2"><span className="font-medium">Phone:</span> {order.customer?.phone ?? "-"}</p>
            <p className="mb-2"><span className="font-medium">Address:</span> {order.customer?.address ?? "-"}</p>
            <p className="mb-2"><span className="font-medium">District:</span> {order.customer?.district ?? "-"}</p>

            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium">{order.deliveryCharge === 0 ? "FREE" : formatPrice(order.deliveryCharge)}</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-base font-semibold">Total</span>
                <span className="text-lg font-bold text-primary">{formatPrice(order.total)}</span>
              </div>

              <div className="mt-4">
                <Badge className="capitalize">{order.status}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
