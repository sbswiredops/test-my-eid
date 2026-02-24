"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { HeroBanner } from "@/components/hero-banner"
import {
  categories,
  getFeaturedProducts,
  products,
} from "@/lib/data"
import { Truck, Shield, RotateCcw, Phone } from "lucide-react"

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
]

export default function HomePage() {
  const featured = getFeaturedProducts()
  const newArrivals = [...products]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 4)

  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Features bar */}
      <section className="border-b border-border/60 bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
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
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4">
                <h3 className="text-center font-serif text-lg font-bold text-white sm:text-xl">
                  {cat.name}
                </h3>
                <p className="mt-1 text-xs text-white/80">
                  Shop Now
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Featured Products
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Our handpicked favorites for this Eid
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/shop">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

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
          <Button
            variant="secondary"
            size="lg"
            className="mt-6"
            asChild
          >
            <Link href="/shop">Shop the Sale</Link>
          </Button>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              New Arrivals
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fresh additions to our Eid collection
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/shop?sort=newest">See More</Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}
