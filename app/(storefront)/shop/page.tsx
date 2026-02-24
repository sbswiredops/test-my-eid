"use client"

import { useSearchParams } from "next/navigation"
import { useState, useMemo, Suspense } from "react"
import {
  products as staticProducts,
  categories as staticCategories,
  formatPrice,
} from "@/lib/data"
import { useProducts, useCategories } from "@/hooks/use-api"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Search, SlidersHorizontal, X } from "lucide-react"

const ITEMS_PER_PAGE = 8
const allSizes = ["S", "M", "L", "XL", "XXL", "Free Size", "2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y"]

function ShopContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")
  const sortParam = searchParams.get("sort")

  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "all")
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 35000])
  const [sortBy, setSortBy] = useState(sortParam || "newest")
  const [page, setPage] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)

  // Fetch categories
  const { data: categoriesData } = useCategories()
  const categories = categoriesData || staticCategories

  // Fetch products with filters
  const { data: productsData, isLoading } = useProducts({
    search,
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    sizes: selectedSizes.length > 0 ? selectedSizes.join(",") : undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    sort: sortBy,
    page,
    limit: ITEMS_PER_PAGE,
  })

  // Use API data if available, otherwise fall back to client-side filtering of static data
  const apiProducts = productsData?.data || productsData // handle different response formats

  const filtered = useMemo(() => {
    if (apiProducts && apiProducts.length > 0) return apiProducts

    // Fallback client-side filtering for demo
    let result = [...staticProducts]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q))
      )
    }

    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory)
    }

    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.sizes.some((s) => selectedSizes.includes(s))
      )
    }

    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    )

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        result.sort((a, b) => b.price - a.price)
        break
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "sale":
        result.sort((a, b) => {
          const aDiscount = a.originalPrice ? a.originalPrice - a.price : 0
          const bDiscount = b.originalPrice ? b.originalPrice - b.price : 0
          return bDiscount - aDiscount
        })
        break
      case "newest":
      default:
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    }

    return result
  }, [search, selectedCategory, selectedSizes, priceRange, sortBy])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paged = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
    setPage(1)
  }

  const clearFilters = () => {
    setSearch("")
    setSelectedCategory("all")
    setSelectedSizes([])
    setPriceRange([0, 35000])
    setSortBy("newest")
    setPage(1)
  }

  const hasActiveFilters =
    search || selectedCategory !== "all" || selectedSizes.length > 0 || priceRange[0] > 0 || priceRange[1] < 35000

  const filterContent = (
    <div className="flex flex-col gap-6">
      {/* Categories */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Category</h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => { setSelectedCategory("all"); setPage(1) }}
            className={`text-left text-sm transition-colors ${selectedCategory === "all" ? "font-medium text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => { setSelectedCategory(cat.slug); setPage(1) }}
              className={`text-left text-sm transition-colors ${selectedCategory === cat.slug ? "font-medium text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Price Range</h3>
        <Slider
          value={priceRange}
          onValueChange={(v) => { setPriceRange(v as [number, number]); setPage(1) }}
          max={35000}
          step={500}
          className="mb-2"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Size</h3>
        <div className="flex flex-wrap gap-2">
          {allSizes.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                selectedSizes.includes(size)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/50"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-1 h-3 w-3" />
          Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
          {selectedCategory !== "all"
            ? categories.find((c) => c.slug === selectedCategory)?.name || "Shop"
            : "All Products"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Search & Sort bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="mr-1.5 h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    !
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4 px-1">
                {filterContent}
              </div>
            </SheetContent>
          </Sheet>
          <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1) }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="sale">On Sale</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main content */}
      <div className="flex gap-8">
        {/* Desktop sidebar filters */}
        <aside className="hidden w-56 shrink-0 lg:block">
          {filterContent}
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {paged.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">
                No products found
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try adjusting your filters or search query
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3">
                {paged.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <Button
                        key={p}
                        variant={p === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(p)}
                        className="w-9"
                      >
                        {p}
                      </Button>
                    )
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8"><p>Loading...</p></div>}>
      <ShopContent />
    </Suspense>
  )
}
