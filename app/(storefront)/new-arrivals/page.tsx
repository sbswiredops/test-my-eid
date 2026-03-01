"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { formatPrice } from "@/lib/data";
import { useProducts, useCategories } from "@/hooks/use-api";
import { productService } from "@/lib/api/products";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  SlidersHorizontal,
  X,
  Loader2,
  ChevronDown,
  Check,
  Filter,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowUpDown,
  Grid3x3,
  List,
  Star,
  Truck,
  Shield,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Product } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS_PER_PAGE = 8;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function NewArrivalsContent() {
  // States
  const [search, setSearch] = useState("");
  const [selectedSizeIds, setSelectedSizeIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // State for new-arrivals category ID
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >(undefined);

  // Fetch sizes from API
  const [sizes, setSizes] = useState<
    Array<{ id: string; name: string; order?: number }>
  >([]);
  const [sizesLoading, setSizesLoading] = useState(true);
  const [sizesError, setSizesError] = useState(false);

  useEffect(() => {
    const fetchSizes = async () => {
      try {
        setSizesLoading(true);
        setSizesError(false);
        const response = await productService.getSizes();

        if (response?.data) {
          const raw = Array.isArray(response.data)
            ? response.data
            : response.data.items || [];

          const normalized = raw.map((s: any) => ({
            id: s.id ?? s._id ?? String(s.value ?? s.size ?? Math.random()),
            name:
              s.name ??
              s.size ??
              s.label ??
              s.value ??
              String(s.id ?? s._id ?? ""),
            order: s.order ?? s.priority ?? undefined,
          }));

          setSizes(normalized as any[]);
        } else {
          setSizes([]);
        }
      } catch (error) {
        console.error("Failed to fetch sizes:", error);
        setSizesError(true);
        setSizes([]);
        toast.error("Failed to load sizes");
      } finally {
        setSizesLoading(false);
      }
    };

    fetchSizes();
  }, []);

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();
  type Category = { id: string; name: string; slug?: string };
  const categories = useMemo<Category[]>(() => {
    if (!categoriesData) return [];
    return Array.isArray(categoriesData)
      ? categoriesData
      : (categoriesData as { items?: Category[] })?.items || [];
  }, [categoriesData]);

  // Find and set new-arrivals category ID
  useEffect(() => {
    if (!categories || categories.length === 0) return;

    const found = categories.find((c: any) => c.slug === "new-arrivals");

    if (found) {
      setSelectedCategoryId(found.id);
    }
  }, [categories]);

  // Prepare query params
  const queryParams = useMemo(() => {
    const params: any = {
      page,
      limit: ITEMS_PER_PAGE,
      sortBy,
      sortOrder,
    };

    if (search && search.trim() !== "") {
      params.search = search.trim();
    }

    if (selectedCategoryId) {
      params.categoryId = selectedCategoryId;
    }

    if (selectedSizeIds.length > 0) {
      params.sizeIds = selectedSizeIds;
    }

    return params;
  }, [page, search, selectedCategoryId, sortBy, sortOrder, selectedSizeIds]);

  // Fetch products
  const {
    data: productsResponse,
    isLoading,
    mutate,
    error,
  } = useProducts(queryParams);

  // Handle API error
  useEffect(() => {
    if (error) {
      toast.error("Failed to load products");
    }
  }, [error]);

  // Handle API response properly
  const products = useMemo(() => {
    if (!productsResponse) return [];

    if (productsResponse.items) {
      return productsResponse.items;
    }
    if (Array.isArray(productsResponse)) {
      return productsResponse;
    }
    if (productsResponse.data?.items) {
      return productsResponse.data.items;
    }
    if (productsResponse.data && Array.isArray(productsResponse.data)) {
      return productsResponse.data;
    }
    return [];
  }, [productsResponse]);

  // Get pagination meta
  const paginationMeta = useMemo(() => {
    if (productsResponse?.meta) {
      return productsResponse.meta;
    }
    if (productsResponse?.pagination) {
      return productsResponse.pagination;
    }
    return {
      total: products.length,
      page: page,
      limit: ITEMS_PER_PAGE,
      totalPages: Math.ceil(products.length / ITEMS_PER_PAGE) || 1,
    };
  }, [productsResponse, products.length, page]);

  // Handle sort change
  const handleSortChange = (value: string) => {
    switch (value) {
      case "newest":
        setSortBy("createdAt");
        setSortOrder("DESC");
        break;
      case "price-low":
        setSortBy("price");
        setSortOrder("ASC");
        break;
      case "price-high":
        setSortBy("price");
        setSortOrder("DESC");
        break;
      case "name":
        setSortBy("name");
        setSortOrder("ASC");
        break;
      case "popular":
        setSortBy("views");
        setSortOrder("DESC");
        break;
    }
    setPage(1);
  };

  // Get current sort value
  const getCurrentSortValue = () => {
    if (sortBy === "createdAt" && sortOrder === "DESC") return "newest";
    if (sortBy === "price" && sortOrder === "ASC") return "price-low";
    if (sortBy === "price" && sortOrder === "DESC") return "price-high";
    if (sortBy === "name" && sortOrder === "ASC") return "name";
    if (sortBy === "views" && sortOrder === "DESC") return "popular";
    return "newest";
  };

  // Toggle size selection
  const toggleSize = (sizeId: string) => {
    setSelectedSizeIds((prev) =>
      prev.includes(sizeId)
        ? prev.filter((s) => s !== sizeId)
        : [...prev, sizeId],
    );
    setPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    setSelectedSizeIds([]);
    setSortBy("createdAt");
    setSortOrder("DESC");
    setPage(1);
    setPriceRange([0, 50000]);
    setSelectedBrands([]);

    toast.success("Filters cleared", {
      icon: <RefreshCw className="h-4 w-4" />,
    });
  };

  // Check if any filters are active
  const hasActiveFilters = !!(
    (search && search.trim() !== "") ||
    selectedSizeIds.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 50000 ||
    selectedBrands.length > 0
  );

  // Get filter count
  const filterCount = useMemo(() => {
    let count = 0;
    if (search && search.trim() !== "") count++;
    count += selectedSizeIds.length;
    if (priceRange[0] > 0 || priceRange[1] < 50000) count++;
    count += selectedBrands.length;
    return count;
  }, [search, selectedSizeIds, priceRange, selectedBrands]);

  // Filter sidebar content
  const filterContent = (
    <div className="flex flex-col h-full">
      {/* Header with clear all */}
      <div className="flex items-center justify-between p-4 border-b bg-linear-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Filters</h2>
          {filterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 bg-primary/10 text-primary"
            >
              {filterCount}
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-6">
          {/* Search filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              Search
            </h3>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 pr-8 border-muted-foreground/20 focus:border-primary transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground hover:scale-110 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <Separator className="bg-linear-to-r from-transparent via-border to-transparent" />

          {/* Sizes Accordion */}
          <Accordion
            type="single"
            collapsible
            defaultValue="sizes"
            className="w-full"
          >
            <AccordionItem value="sizes" className="border-none">
              <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline hover:text-primary transition-colors">
                <span className="flex items-center gap-2">
                  <span>Sizes</span>
                  {selectedSizeIds.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="h-5 px-1.5 text-xs bg-primary/10 text-primary"
                    >
                      {selectedSizeIds.length}
                    </Badge>
                  )}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                {sizesLoading ? (
                  <div className="space-y-2 mt-2">
                    <Skeleton className="h-8 w-full rounded-md" />
                    <Skeleton className="h-8 w-3/4 rounded-md" />
                    <Skeleton className="h-8 w-4/5 rounded-md" />
                  </div>
                ) : sizesError ? (
                  <div className="text-sm text-destructive mt-2 p-3 bg-destructive/10 rounded-md">
                    Failed to load sizes
                  </div>
                ) : sizes.length > 0 ? (
                  <div className="grid grid-cols-2 gap-1 mt-2">
                    {sizes
                      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                      .map((size) => (
                        <button
                          key={size.id}
                          onClick={() => toggleSize(size.id)}
                          className={cn(
                            "flex items-center justify-center gap-2 px-2 py-2 rounded-md text-sm transition-all duration-200 border",
                            selectedSizeIds.includes(size.id)
                              ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                              : "border-muted hover:border-primary hover:text-primary hover:shadow-sm",
                          )}
                        >
                          {selectedSizeIds.includes(size.id) && (
                            <Check className="h-3 w-3" />
                          )}
                          <span>{size.name}</span>
                        </button>
                      ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground mt-2 p-3 bg-muted/30 rounded-md">
                    No sizes available
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="relative bg-linear-to-r from-primary via-primary/90 to-primary overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 mask-[radial-gradient(ellipse_at_center,white,transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge
              variant="secondary"
              className="mb-4 bg-white/20 text-white border-white/30"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              Fresh Collection
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
              New Arrivals
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Discover the latest trends and exclusive pieces for Eid
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="text-white">
                <div className="text-2xl font-bold">
                  {paginationMeta.total}+
                </div>
                <div className="text-sm text-white/80">Products</div>
              </div>
              <div className="w-px h-8 bg-white/30" />
              <div className="text-white">
                <div className="text-2xl font-bold">New</div>
                <div className="text-sm text-white/80">Arrivals</div>
              </div>
              <div className="w-px h-8 bg-white/30" />
              <div className="text-white">
                <div className="text-2xl font-bold">Eid</div>
                <div className="text-sm text-white/80">Collection</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Bar */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              <span>Free Shipping on Orders Above BDT. 5,000</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>100% Authentic Products</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary" />
              <span>Easy Returns</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Filters - Desktop */}
          <div className="hidden lg:block">
            <div className="sticky top-20 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
              {filterContent}
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Top bar with sort and mobile filter */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      <>
                        Showing{" "}
                        <span className="font-medium text-foreground">
                          {products.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-foreground">
                          {paginationMeta.total}
                        </span>{" "}
                        products
                      </>
                    )}
                  </p>
                </motion.div>
              </div>

              <div className="flex items-center gap-3">
                {/* View mode toggle */}
                <div className="hidden sm:flex items-center gap-1 border rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8",
                      viewMode === "grid" && "bg-primary/10 text-primary",
                    )}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8",
                      viewMode === "list" && "bg-primary/10 text-primary",
                    )}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {/* Sort select */}
                <Select
                  value={getCurrentSortValue()}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-45 border-muted-foreground/20 focus:ring-primary/20">
                    <ArrowUpDown className="mr-2 h-3 w-3 text-muted-foreground" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="newest"
                      className="flex items-center gap-2"
                    >
                      <Clock className="mr-2 h-3 w-3" />
                      Newest
                    </SelectItem>
                    <SelectItem value="popular">
                      <TrendingUp className="mr-2 h-3 w-3" />
                      Most Popular
                    </SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="name">Name: A to Z</SelectItem>
                  </SelectContent>
                </Select>

                {/* Mobile filter button */}
                <Sheet
                  open={mobileFiltersOpen}
                  onOpenChange={setMobileFiltersOpen}
                >
                  <SheetTrigger asChild className="lg:hidden">
                    <Button variant="outline" size="sm" className="relative">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Filters
                      {filterCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-2 h-5 px-1.5 text-xs bg-primary text-primary-foreground"
                        >
                          {filterCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0">
                    <SheetHeader className="p-4 border-b bg-linear-to-r from-primary/5 to-transparent">
                      <SheetTitle className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-primary" />
                        Filters
                      </SheetTitle>
                    </SheetHeader>
                    {filterContent}
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Products grid/list */}
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    viewMode === "grid"
                      ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                      : "space-y-4",
                  )}
                >
                  {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "space-y-4",
                        viewMode === "list" && "flex gap-4",
                      )}
                    >
                      <Skeleton
                        className={cn(
                          "rounded-lg",
                          viewMode === "grid" ? "aspect-square" : "h-32 w-32",
                        )}
                      />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : products.length > 0 ? (
                <motion.div
                  key="products"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0 }}
                  className={cn(
                    viewMode === "grid"
                      ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                      : "space-y-4",
                  )}
                >
                  {products.map((product: Product) => (
                    <motion.div key={product.id} variants={itemVariants}>
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-dashed p-16 text-center bg-linear-to-b from-muted/30 to-background"
                >
                  <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Search className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">No products found</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                    We couldn't find any products matching your criteria. Try
                    adjusting your filters or search query.
                  </p>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={clearFilters}
                      className="mt-6 hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Clear all filters
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {paginationMeta.totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex items-center justify-center gap-2"
              >
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1 || isLoading}
                  className="hover:border-primary hover:text-primary"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({
                    length: Math.min(paginationMeta.totalPages, 5),
                  }).map((_, i) => {
                    let pageNum = page;
                    if (paginationMeta.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= paginationMeta.totalPages - 2) {
                      pageNum = paginationMeta.totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? "default" : "outline"}
                        onClick={() => setPage(pageNum)}
                        disabled={isLoading}
                        className={cn(
                          "min-w-10 transition-all",
                          pageNum === page && "scale-110 shadow-md",
                        )}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() =>
                    setPage(Math.min(paginationMeta.totalPages, page + 1))
                  }
                  disabled={page === paginationMeta.totalPages || isLoading}
                  className="hover:border-primary hover:text-primary"
                >
                  Next
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading component
function NewArrivalsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary/10 h-64 animate-pulse" />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function NewArrivalsPage() {
  return (
    <Suspense fallback={<NewArrivalsLoading />}>
      <NewArrivalsContent />
    </Suspense>
  );
}
