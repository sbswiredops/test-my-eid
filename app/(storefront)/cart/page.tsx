"use client"

import Link from "next/link"
import { useCart } from "@/lib/cart-store"
import { formatPrice, defaultSettings } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart, itemCount } =
    useCart()

  const deliveryCharge =
    subtotal >= defaultSettings.freeDeliveryThreshold
      ? 0
      : defaultSettings.deliveryCharge
  const total = subtotal + deliveryCharge

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Your Cart is Empty
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Looks like you haven&apos;t added any items yet.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
          Shopping Cart
        </h1>
        <span className="text-sm text-muted-foreground">
          {itemCount} item{itemCount !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Cart items */}
        <div className="flex-1">
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="flex gap-4 rounded-lg border border-border/60 bg-card p-4"
              >
                <Link
                  href={`/shop/${item.slug}`}
                  className="h-24 w-20  overflow-hidden rounded-md bg-muted sm:h-28 sm:w-24"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        href={`/shop/${item.slug}`}
                        className="text-sm font-semibold text-card-foreground hover:text-primary"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Size: {item.size}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.size)}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center rounded-md border border-border">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.size,
                            item.quantity - 1
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center transition-colors hover:bg-muted"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="flex h-8 w-10 items-center justify-center border-x border-border text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.size,
                            item.quantity + 1
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center transition-colors hover:bg-muted"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-foreground">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/shop">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-80">
          <div className="rounded-lg border border-border/60 bg-card p-6">
            <h2 className="text-lg font-semibold text-card-foreground">
              Order Summary
            </h2>
            <Separator className="my-4" />
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium text-foreground">
                  {deliveryCharge === 0 ? "FREE" : formatPrice(deliveryCharge)}
                </span>
              </div>
              {deliveryCharge > 0 && (
                <p className="text-xs text-muted-foreground">
                  Add {formatPrice(defaultSettings.freeDeliveryThreshold - subtotal)}{" "}
                  more for free delivery
                </p>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-foreground">
                  Total
                </span>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
            <Button className="mt-6 w-full" size="lg" asChild>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
