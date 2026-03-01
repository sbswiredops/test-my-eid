"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { HeroBanner } from "@/components/hero-banner";
import {
  useProducts,
  useCategories,
  useApi,
  useMiddleBanners,
  useBottomBanners,
} from "@/hooks/use-api";
import { Truck, Shield, RotateCcw, Phone } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Free Delivery",
    description: "On orders above BDT. 5,000",
  },
  {
    icon: Shield,
    title: "Secure Shopping",
    description: "100% authentic products",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "7-day return policy",
  },
  {
    icon: Phone,
    title: "24/7 Support",
    description: "Call us anytime",
  },
];

export default function HomePage() {
  const { data: productsData } = useProducts();
  const { data: categoriesData } = useCategories();

  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  const products = Array.isArray(productsData) ? productsData : [];

  // Home categories and banners
  const { data: homeCategoriesData } = useApi<any[]>("/homecategory");
  const homeCategories = Array.isArray(homeCategoriesData)
    ? homeCategoriesData
    : [];

  type Banner = {
    id?: string | number;
    image?: string;
    img?: string;
    title?: string;
    ctaLink?: string;
    link?: string;
  };

  const { data: middleBannersData } = useMiddleBanners() as {
    data?: Banner[] | { items?: Banner[]; data?: Banner[] };
  };
  const middleBanners: Banner[] = Array.isArray(middleBannersData)
    ? middleBannersData
    : (middleBannersData?.items ?? middleBannersData?.data ?? []);

  const { data: bottomBannersData } = useBottomBanners() as {
    data?: Banner[] | { items?: Banner[]; data?: Banner[] };
  };
  const bottomBanners: Banner[] = Array.isArray(bottomBannersData)
    ? bottomBannersData
    : (bottomBannersData?.items ?? bottomBannersData?.data ?? []);

  const featured = products.filter((p: any) => p.featured);
  const newArrivals = [...products]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Features bar */}
      <section className="border-b border-border/60 bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {feature.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by Category */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12">
        <div className="mb-8 text-center">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl text-balance">
            Shop by Category
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Find the perfect Eid outfit for everyone in the family
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="group relative overflow-hidden rounded-lg"
            >
              <div className="aspect-3/4 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-end bg-linear-to-t from-black/70 via-black/20 to-transparent p-4">
                <h3 className="text-center font-serif text-lg font-bold text-white sm:text-xl">
                  {cat.name}
                </h3>
                <p className="mt-1 text-xs text-white/80">Shop Now</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Home Categories: render each as its own section with products and category cards */}
      {homeCategories.length > 0 && (
        <div className="w-full">
          {homeCategories.slice(0, 2).map((hc: any) => {
            const hcProducts: any[] = Array.isArray(hc.products)
              ? hc.products
              : [];
            const hcProductIds = new Set(hcProducts.map((p) => p.id));

            return (
              <section
                key={hc.id}
                className="mx-auto w-full max-w-7xl px-4 py-12 border-t"
              >
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {hc.name}
                    </h2>
                    {hc.shortDescription && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {hc.shortDescription}
                      </p>
                    )}
                  </div>
                  <div>
                    {hc.image && (
                      <img
                        src={hc.image}
                        alt={hc.name}
                        className="h-20 w-48 rounded object-cover"
                      />
                    )}
                  </div>
                </div>

                {/* Unified grid: categories + products together, same-size cards */}
                <div className="mb-6">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {(() => {
                      // Build a combined list: categories first, then products not already included
                      const items: any[] = [];

                      if (Array.isArray(hc.categories)) {
                        for (const cat of hc.categories) {
                          items.push({ type: "category", item: cat });
                        }
                      }

                      // collect product ids already added (from hc.products)
                      const seen = new Set<string>();
                      for (const p of hcProducts) {
                        seen.add(p.id);
                      }

                      // add home-category products
                      for (const p of hcProducts) {
                        items.push({ type: "product", item: p });
                      }

                      // also include products from categories that aren't already included
                      if (Array.isArray(hc.categories)) {
                        for (const cat of hc.categories) {
                          if (Array.isArray(cat.products)) {
                            for (const p of cat.products) {
                              if (!seen.has(p.id)) {
                                seen.add(p.id);
                                items.push({ type: "product", item: p });
                              }
                            }
                          }
                        }
                      }

                      // Only show up to 8 items (2 rows x 4 cols). If more exist, overlay "See more" on 8th.
                      const maxVisible = 8;
                      const visible = items.slice(0, maxVisible);
                      const hasMore = items.length > maxVisible;

                      return visible.map((entry, idx) => {
                        const showOverlay = hasMore && idx === maxVisible - 1;

                        if (entry.type === "category") {
                          const cat = entry.item;
                          return (
                            <div key={`cat-${cat.id}`} className="relative">
                              <Link
                                href={`/shop?category=${cat.slug}`}
                                className="group flex flex-col overflow-hidden rounded-lg border border-border/60 bg-card transition-all hover:shadow-md"
                              >
                                <div className="relative aspect-3/4 overflow-hidden bg-muted">
                                  <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                </div>
                                <div className="flex flex-1 flex-col gap-1.5 p-3">
                                  <h3 className="text-sm font-medium leading-tight text-card-foreground line-clamp-2">
                                    {cat.name}
                                  </h3>
                                  <div className="mt-auto">
                                    <p className="text-xs text-muted-foreground">
                                      {cat.products?.length || 0} products
                                    </p>
                                  </div>
                                </div>
                              </Link>

                              {showOverlay && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Link
                                    href={`/shop?homeCategory=${hc.slug ?? hc.id}`}
                                    className="rounded bg-black/60 px-4 py-2 text-sm font-medium text-white"
                                  >
                                    See more
                                  </Link>
                                </div>
                              )}
                            </div>
                          );
                        }

                        const product = entry.item;
                        return (
                          <div key={`p-${product.id}`} className="relative">
                            <ProductCard product={product} />
                            {showOverlay && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Link
                                  href={`/shop?homeCategory=${hc.slug ?? hc.id}`}
                                  className="rounded bg-black/60 px-4 py-2 text-sm font-medium text-white"
                                >
                                  See more
                                </Link>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </section>
            );
          })}

          {/* middle banners after first two home categories */}
          {middleBanners.length > 0 && (
            <div className="mx-auto max-w-7xl px-4 py-6">
              {middleBanners.map((b: any, idx: number) => (
                <div
                  key={b.id ?? idx}
                  className="mb-6 w-full overflow-hidden rounded-lg"
                >
                  <a href={b.ctaLink ?? b.link ?? "#"}>
                    <img
                      src={b.image ?? b.img}
                      alt={b.title ?? ""}
                      className="w-full object-cover"
                    />
                  </a>
                </div>
              ))}
            </div>
          )}

          {homeCategories.slice(2).map((hc: any) => {
            const hcProducts: any[] = Array.isArray(hc.products)
              ? hc.products
              : [];
            const hcProductIds = new Set(hcProducts.map((p) => p.id));

            return (
              <section
                key={hc.id}
                className="mx-auto w-full max-w-7xl px-4 py-12 border-t"
              >
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {hc.name}
                    </h2>
                    {hc.shortDescription && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {hc.shortDescription}
                      </p>
                    )}
                  </div>
                  <div>
                    {hc.image && (
                      <img
                        src={hc.image}
                        alt={hc.name}
                        className="h-20 w-48 rounded object-cover"
                      />
                    )}
                  </div>
                </div>

                {/* Unified grid: categories + products together, same-size cards */}
                <div className="mb-6">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {(() => {
                      // Build a combined list: categories first, then products not already included
                      const items: any[] = [];

                      if (Array.isArray(hc.categories)) {
                        for (const cat of hc.categories) {
                          items.push({ type: "category", item: cat });
                        }
                      }

                      // collect product ids already added (from hc.products)
                      const seen = new Set<string>();
                      for (const p of hcProducts) {
                        seen.add(p.id);
                      }

                      // add home-category products
                      for (const p of hcProducts) {
                        items.push({ type: "product", item: p });
                      }

                      // also include products from categories that aren't already included
                      if (Array.isArray(hc.categories)) {
                        for (const cat of hc.categories) {
                          if (Array.isArray(cat.products)) {
                            for (const p of cat.products) {
                              if (!seen.has(p.id)) {
                                seen.add(p.id);
                                items.push({ type: "product", item: p });
                              }
                            }
                          }
                        }
                      }

                      // Only show up to 8 items (2 rows x 4 cols). If more exist, overlay "See more" on 8th.
                      const maxVisible = 8;
                      const visible = items.slice(0, maxVisible);
                      const hasMore = items.length > maxVisible;

                      return visible.map((entry, idx) => {
                        const showOverlay = hasMore && idx === maxVisible - 1;

                        if (entry.type === "category") {
                          const cat = entry.item;
                          return (
                            <div key={`cat-${cat.id}`} className="relative">
                              <Link
                                href={`/shop?category=${cat.slug}`}
                                className="group flex flex-col overflow-hidden rounded-lg border border-border/60 bg-card transition-all hover:shadow-md"
                              >
                                <div className="relative aspect-3/4 overflow-hidden bg-muted">
                                  <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                </div>
                                <div className="flex flex-1 flex-col gap-1.5 p-3">
                                  <h3 className="text-sm font-medium leading-tight text-card-foreground line-clamp-2">
                                    {cat.name}
                                  </h3>
                                  <div className="mt-auto">
                                    <p className="text-xs text-muted-foreground">
                                      {cat.products?.length || 0} products
                                    </p>
                                  </div>
                                </div>
                              </Link>

                              {showOverlay && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Link
                                    href={`/shop?homeCategory=${hc.slug ?? hc.id}`}
                                    className="rounded bg-black/60 px-4 py-2 text-sm font-medium text-white"
                                  >
                                    See more
                                  </Link>
                                </div>
                              )}
                            </div>
                          );
                        }

                        const product = entry.item;
                        return (
                          <div key={`p-${product.id}`} className="relative">
                            <ProductCard product={product} />
                            {showOverlay && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Link
                                  href={`/shop?homeCategory=${hc.slug ?? hc.id}`}
                                  className="rounded bg-black/60 px-4 py-2 text-sm font-medium text-white"
                                >
                                  See more
                                </Link>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </section>
            );
          })}

          {/* Bottom banners */}
          {bottomBanners.length > 0 && (
            <div className="mx-auto max-w-7xl px-4 py-6">
              {bottomBanners.map((b: any, idx: number) => (
                <div
                  key={b.id ?? idx}
                  className="mb-6 w-full overflow-hidden rounded-lg"
                >
                  <a href={b.ctaLink ?? b.link ?? "#"}>
                    <img
                      src={b.image ?? b.img}
                      alt={b.title ?? ""}
                      className="w-full object-cover"
                    />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Promotional Banner */}
      <section className="relative overflow-hidden bg-primary py-16">
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <span className="inline-block rounded-full bg-accent px-4 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
            Limited Time Offer
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold text-primary-foreground sm:text-4xl text-balance">
            Eid Sale - Up to 50% Off
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-primary-foreground/80">
            Celebrate this blessed occasion with our exclusive collection at
            unbeatable prices. Free delivery on orders above BDT. 5,000.
          </p>
          <Button variant="secondary" size="lg" className="mt-6" asChild>
            <Link href="/shop">Shop the Sale</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
