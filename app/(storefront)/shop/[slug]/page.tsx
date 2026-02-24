"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import {
  getProductBySlug as getStaticProductBySlug,
  getProductsByCategory,
  formatPrice,
  products as staticProducts,
} from "@/lib/data"
import { useProduct } from "@/hooks/use-api"
import { ProductDetail } from "@/components/product-detail"
import { ProductCard } from "@/components/product-card"

interface Props {
  params: Promise<{ slug: string }>
}

export default function ProductPage({ params }: Props) {
  const { slug } = use(params)
  const { data: apiProduct, isLoading } = useProduct(slug)

  const product = apiProduct || getStaticProductBySlug(slug)

  if (!product && !isLoading) {
    notFound()
  }

  if (isLoading && !product) {
    return <div className="mx-auto max-w-7xl px-4 py-8">Loading...</div>
  }

  const related = getProductsByCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 4)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <ProductDetail product={product} />

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-serif text-xl font-bold text-foreground sm:text-2xl">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
