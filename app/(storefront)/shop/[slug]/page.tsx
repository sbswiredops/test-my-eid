"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useProducts, useProduct } from "@/hooks/use-api";
import { ProductDetail } from "@/components/product-detail";
import { ProductCard } from "@/components/product-card";
import { Product } from "@/lib/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function ProductPage({ params }: Props) {
  const { slug } = use(params);
  const { data: apiProduct, isLoading } = useProduct(slug);

  const product = apiProduct;

  // Ensure hooks are called in the same order every render by
  // calling `useProducts` unconditionally. Build params only when
  // we have a product and a valid category id to avoid sending
  // undefined query values to the API (which can cause 400s).
  const relatedParams = product
    ? (() => {
        const p: any = {};
        // Try to resolve a category id from newer `categories` array
        const catId = product?.categories && product.categories.length > 0
          ? product.categories[0].id
          : // fall back to legacy `category` field if present
            (product as any).category || (product as any).categoryId || undefined;
        if (catId) p.categoryId = catId;
        p.limit = 4;
        return p;
      })()
    : undefined;

  const { data: relatedData } = useProducts(relatedParams);

  if (!product && !isLoading) {
    notFound();
  }

  if (isLoading && !product) {
    return <div className="mx-auto max-w-7xl px-4 py-8">Loading...</div>;
  }


  const relatedArray = (() => {
    if (!relatedData) return [];
    if (Array.isArray(relatedData)) return relatedData;
    if (Array.isArray((relatedData as any).items)) return (relatedData as any).items;
    if (Array.isArray((relatedData as any).data)) return (relatedData as any).data;
    if (Array.isArray((relatedData as any).data?.items)) return (relatedData as any).data.items;
    return [];
  })();

  const related = (relatedArray as Product[])
    .filter((p: Product) => p.id !== product?.id)
    .slice(0, 4);

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
            {related.map((p: Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
