"use client"

import Link from "next/link"
import type { Product } from "@/lib/types"
import { formatPrice } from "@/lib/data"
import { Badge } from "@/components/ui/badge"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.originalPrice! - product.price) / product.originalPrice!) *
          100
      )
    : 0

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border/60 bg-card transition-all hover:shadow-md"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {hasDiscount && (
          <Badge className="absolute left-2 top-2 bg-destructive text-destructive-foreground">
            -{discountPercent}%
          </Badge>
        )}
        {product.featured && !hasDiscount && (
          <Badge className="absolute left-2 top-2 bg-accent text-accent-foreground">
            Featured
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="text-sm font-medium leading-tight text-card-foreground line-clamp-2">
          {product.name}
        </h3>
        <div className="mt-auto flex items-center gap-2">
          <span className="text-sm font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.originalPrice!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
