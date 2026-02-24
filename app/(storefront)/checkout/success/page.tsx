"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, ShoppingBag, ClipboardList } from "lucide-react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle className="h-10 w-10 text-primary" />
        </div>
        <h1 className="mt-6 font-serif text-2xl font-bold text-foreground sm:text-3xl">
          Order Placed Successfully!
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Thank you for your order. We will process it shortly and send you a
          confirmation.
        </p>
        {orderId && (
          <div className="mt-6 rounded-lg border border-border/60 bg-card px-6 py-4">
            <p className="text-xs text-muted-foreground">Order ID</p>
            <p className="mt-1 text-lg font-bold text-primary">{orderId}</p>
          </div>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/shop">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/account?tab=orders">
              <ClipboardList className="mr-2 h-4 w-4" />
              View Orders
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
