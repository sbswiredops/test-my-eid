"use client"

import { useState } from "react"
import type { Product } from "@/lib/types"
import { formatPrice } from "@/lib/data"
import { useCart } from "@/lib/cart-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Minus, Plus, ShoppingBag, Check, Truck } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.originalPrice! - product.price) / product.originalPrice!) *
          100
      )
    : 0

  const stock = selectedSize ? product.stockPerSize[selectedSize] || 0 : 0

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size")
      return
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity,
      image: product.images[0],
      slug: product.slug,
    })
    toast.success(`${product.name} added to cart`, {
      description: `Size: ${selectedSize}, Qty: ${quantity}`,
    })
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
      {/* Image */}
      <div className="lg:w-1/2">
        <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col lg:w-1/2">
        {/* Breadcrumb-like category */}
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {product.category.replace("-", " ")}
        </p>

        <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl text-balance">
          {product.name}
        </h1>

        {/* Price */}
        <div className="mt-3 flex items-center gap-3">
          <span className="text-2xl font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.originalPrice!)}
              </span>
              <Badge className="bg-destructive text-destructive-foreground">
                -{discountPercent}% OFF
              </Badge>
            </>
          )}
        </div>

        <Separator className="my-5" />

        {/* Size selector */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              Select Size
            </span>
            {selectedSize && (
              <span className="text-xs text-muted-foreground">
                {stock > 0
                  ? `${stock} in stock`
                  : "Out of stock"}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => {
              const sizeStock = product.stockPerSize[size] || 0
              return (
                <button
                  key={size}
                  onClick={() => {
                    setSelectedSize(size)
                    setQuantity(1)
                  }}
                  disabled={sizeStock === 0}
                  className={cn(
                    "rounded-md border px-4 py-2 text-sm font-medium transition-all",
                    selectedSize === size
                      ? "border-primary bg-primary text-primary-foreground"
                      : sizeStock === 0
                        ? "border-border bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                        : "border-border bg-card text-foreground hover:border-primary/60"
                  )}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>

        {/* Quantity */}
        <div className="mt-5">
          <span className="mb-3 block text-sm font-semibold text-foreground">
            Quantity
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-md border border-border">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-muted"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex h-10 w-12 items-center justify-center border-x border-border text-sm font-medium">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity(Math.min(stock || 10, quantity + 1))
                }
                className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-muted"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Add to Cart */}
        <Button
          size="lg"
          className="mt-6 w-full sm:w-auto"
          onClick={handleAddToCart}
          disabled={!selectedSize || stock === 0}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          {!selectedSize ? "Select a Size" : stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>

        {/* Shipping info */}
        <div className="mt-6 flex flex-col gap-2 rounded-lg bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Truck className="h-4 w-4 text-primary" />
            <span>Free delivery on orders above Rs. 5,000</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Check className="h-4 w-4 text-primary" />
            <span>Cash on Delivery available</span>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Tabs */}
        <Tabs defaultValue="description">
          <TabsList className="w-full">
            <TabsTrigger value="description" className="flex-1">
              Description
            </TabsTrigger>
            <TabsTrigger value="size-guide" className="flex-1">
              Size Guide
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="size-guide" className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-left font-medium text-foreground">Size</th>
                    <th className="pb-2 text-left font-medium text-foreground">Chest</th>
                    <th className="pb-2 text-left font-medium text-foreground">Length</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b"><td className="py-2">S</td><td>36"</td><td>28"</td></tr>
                  <tr className="border-b"><td className="py-2">M</td><td>38"</td><td>29"</td></tr>
                  <tr className="border-b"><td className="py-2">L</td><td>40"</td><td>30"</td></tr>
                  <tr className="border-b"><td className="py-2">XL</td><td>42"</td><td>31"</td></tr>
                  <tr><td className="py-2">XXL</td><td>44"</td><td>32"</td></tr>
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
