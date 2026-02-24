"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useCart } from "@/lib/cart-store"
import { useAuth } from "@/lib/auth-store"
import { useOrders } from "@/lib/order-store"
import { formatPrice, defaultSettings, districts } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ShoppingBag, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const { createOrder } = useOrders()

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    district: user?.district || "",
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

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
            Nothing to Checkout
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your cart is empty. Add some items first.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/shop">Browse Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email"
    if (!formData.phone.trim()) newErrors.phone = "Phone is required"
    if (!formData.address.trim()) newErrors.address = "Address is required"
    if (!formData.district) newErrors.district = "District is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    // Simulate processing
    setTimeout(() => {
      const order = createOrder(
        items,
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          district: formData.district,
          notes: formData.notes,
        },
        subtotal
      )
      clearCart()
      toast.success("Order placed successfully!")
      router.push(`/checkout/success?orderId=${order.id}`)
    }, 1000)
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link href="/cart">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Cart
        </Link>
      </Button>

      <h1 className="mb-8 font-serif text-2xl font-bold text-foreground sm:text-3xl">
        Checkout
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Shipping Form */}
          <div className="flex-1">
            <div className="rounded-lg border border-border/60 bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold text-card-foreground">
                Shipping Information
              </h2>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      className="mt-1"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-destructive">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="mt-1"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-destructive">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="mt-1"
                      placeholder="+92 3XX XXXXXXX"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-destructive">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="district">City / District *</Label>
                    <Select
                      value={formData.district}
                      onValueChange={(v) => updateField("district", v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.district && (
                      <p className="mt-1 text-xs text-destructive">
                        {errors.district}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Full Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                  {errors.address && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.address}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="notes">Order Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    className="mt-1"
                    rows={2}
                    placeholder="Any special instructions..."
                  />
                </div>
              </div>

              <Separator className="my-6" />

              <h2 className="mb-4 text-lg font-semibold text-card-foreground">
                Payment Method
              </h2>
              <RadioGroup defaultValue="cod" className="gap-3">
                <div className="flex items-center gap-3 rounded-lg border border-primary bg-primary/5 p-3">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex-1 cursor-pointer">
                    <span className="text-sm font-medium">Cash on Delivery</span>
                    <p className="text-xs text-muted-foreground">
                      Pay when you receive your order
                    </p>
                  </Label>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border p-3 opacity-50">
                  <RadioGroupItem value="online" id="online" disabled />
                  <Label htmlFor="online" className="flex-1">
                    <span className="text-sm font-medium">Online Payment</span>
                    <p className="text-xs text-muted-foreground">
                      Coming soon
                    </p>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-80">
            <div className="sticky top-24 rounded-lg border border-border/60 bg-card p-6">
              <h2 className="text-lg font-semibold text-card-foreground">
                Order Summary
              </h2>
              <Separator className="my-4" />
              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground line-clamp-1">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium text-foreground">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium text-foreground">
                    {deliveryCharge === 0
                      ? "FREE"
                      : formatPrice(deliveryCharge)}
                  </span>
                </div>
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
              <Button
                type="submit"
                className="mt-6 w-full"
                size="lg"
                disabled={submitting}
              >
                {submitting ? "Processing..." : "Place Order"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
