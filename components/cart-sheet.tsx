"use client"

import Link from "next/link"
import { useCart } from "@/lib/cart-store"
import { formatPrice } from "@/lib/data"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Cart ({itemCount})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Your cart is empty
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              asChild
            >
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4">
              <div className="flex flex-col gap-4">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}`}
                    className="flex gap-3"
                  >
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium leading-tight">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Size: {item.size}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId, item.size)}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.size,
                                item.quantity - 1
                              )
                            }
                            className="flex h-6 w-6 items-center justify-center rounded border text-xs transition-colors hover:bg-muted"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-xs">
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
                            className="flex h-6 w-6 items-center justify-center rounded border text-xs transition-colors hover:bg-muted"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-sm font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <SheetFooter className="border-t pt-4">
              <div className="w-full">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <Separator className="my-3" />
                <div className="flex flex-col gap-2">
                  <Button asChild onClick={() => onOpenChange(false)}>
                    <Link href="/cart">View Cart</Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    onClick={() => onOpenChange(false)}
                  >
                    <Link href="/checkout">Checkout</Link>
                  </Button>
                </div>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
