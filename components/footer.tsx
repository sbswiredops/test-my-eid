import Link from "next/link"
import { categories } from "@/lib/data"

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
                <span className="text-sm font-bold text-primary-foreground">
                  EC
                </span>
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-foreground">
                Eid Collection
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your destination for premium Eid fashion. Celebrating tradition
              with modern elegance since 2020.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Shop All
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/shop?category=${cat.slug}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Customer Service
            </h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="/account"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  My Account
                </Link>
              </li>
              <li>
                <Link
                  href="/account?tab=orders"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Order Tracking
                </Link>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  Shipping & Returns
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  Size Guide
                </span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Contact
            </h3>
            <ul className="flex flex-col gap-2">
              <li className="text-sm text-muted-foreground">
                +92 300 1234567
              </li>
              <li className="text-sm text-muted-foreground">
                info@eidcollection.pk
              </li>
              <li className="text-sm text-muted-foreground">
                Lahore, Punjab, Pakistan
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-border/60 pt-6 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {"2026 Eid Collection. All rights reserved."}
          </p>
          <p className="text-xs text-muted-foreground">
            Cash on Delivery Available Nationwide
          </p>
        </div>
      </div>
    </footer>
  )
}
