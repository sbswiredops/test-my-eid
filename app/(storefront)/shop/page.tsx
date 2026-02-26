"use client";

import { useSearchParams } from "next/navigation";
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
  RotateCcw
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

const ITEMS_PER_PAGE = 8;

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  // States
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >(undefined);
  const [selectedSizeIds, setSelectedSizeIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

  // If `category` param is present in URL (might be slug), resolve to category ID
  useEffect(() => {
    if (!categoryParam) return;
    if (!categories || categories.length === 0) return;

    const found = categories.find(
      (c: any) => c.id === categoryParam || c.slug === categoryParam,
    );

    if (found) {
      setSelectedCategoryId(found.id);
    } else {
      // Not found: keep as undefined to avoid sending invalid values to API
      setSelectedCategoryId(undefined);
    }
  }, [categoryParam, categories]);

  // Prepare query params - filter out undefined values
  const queryParams = useMemo(() => {
    const params: any = {
      page,
      limit: ITEMS_PER_PAGE,
      sortBy,
      sortOrder,
    };

    // Only add if they have real values (not undefined, not empty string)
    if (search && search.trim() !== "") {
      params.search = search.trim();
    }

    if (selectedCategoryId) {
      params.categoryId = selectedCategoryId;
    }

    return params;
  }, [page, search, selectedCategoryId, sortBy, sortOrder]);

  // Fetch products with clean params
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
    }
    setPage(1);
  };

  // Get current sort value for select
  const getCurrentSortValue = () => {
    if (sortBy === "createdAt" && sortOrder === "DESC") return "newest";
    if (sortBy === "price" && sortOrder === "ASC") return "price-low";
    if (sortBy === "price" && sortOrder === "DESC") return "price-high";
    if (sortBy === "name" && sortOrder === "ASC") return "name";
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
    setSelectedCategoryId(undefined);
    setSelectedSizeIds([]);
    setSortBy("createdAt");
    setSortOrder("DESC");
    setPage(1);

    toast.success("Filters cleared");
  };

  // Check if any filters are active
  const hasActiveFilters = !!(
    (search && search.trim() !== "") ||
    selectedCategoryId ||
    selectedSizeIds.length > 0
  );

  // Get filter count
  const filterCount = useMemo(() => {
    let count = 0;
    if (search && search.trim() !== "") count++;
    if (selectedCategoryId) count++;
    count += selectedSizeIds.length;
    return count;
  }, [search, selectedCategoryId, selectedSizeIds]);

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c: any) => c.id === categoryId);
    return category?.name || categoryId;
  };

  // Filter sidebar content
  const filterContent = (
    <div className="flex flex-col h-full">
      {/* Header with clear all */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Filters</h2>
          {filterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {filterCount}
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2 text-xs"
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
              <Search className="h-4 w-4 text-muted-foreground" />
              Search
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 pr-8"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <Separator />

          {/* Categories Accordion */}
          <Accordion type="single" collapsible defaultValue="categories" className="w-full">
            <AccordionItem value="categories" className="border-none">
              <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                <span className="flex items-center gap-2">
                  <span>Categories</span>
                  {selectedCategoryId && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      1
                    </Badge>
                  )}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                {categoriesLoading ? (
                  <div className="space-y-2 mt-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-8 w-4/5" />
                  </div>
                ) : categories.length > 0 ? (
                  <div className="space-y-1 mt-2">
                    <button
                      onClick={() => {
                        setSelectedCategoryId(undefined);
                        setPage(1);
                      }}
                      className={cn(
                        "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors",
                        !selectedCategoryId
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {!selectedCategoryId && (
                        <Check className="h-4 w-4" />
                      )}
                      <span>All Products</span>
                    </button>
                    {categories.map((cat: { id: string; name: string }) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategoryId(cat.id);
                          setPage(1);
                        }}
                        className={cn(
                          "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors",
                          selectedCategoryId === cat.id
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {selectedCategoryId === cat.id && (
                          <Check className="h-4 w-4" />
                        )}
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-2">No categories found</p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Separator />

          {/* Sizes Accordion */}
          <Accordion type="single" collapsible defaultValue="sizes" className="w-full">
            <AccordionItem value="sizes" className="border-none">
              <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                <span className="flex items-center gap-2">
                  <span>Sizes</span>
                  {selectedSizeIds.length > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {selectedSizeIds.length}
                    </Badge>
                  )}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                {sizesLoading ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                ) : sizes.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {sizes.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => toggleSize(size.id)}
                        className={cn(
                          "rounded-md border px-3 py-1.5 text-xs font-medium transition-all",
                          selectedSizeIds.includes(size.id)
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-accent/50"
                        )}
                      >
                        {size.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-2">No sizes available</p>
                )}
                {sizesError && (
                  <p className="text-xs text-destructive mt-1">Failed to load sizes</p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>

      {/* Mobile Apply Button */}
      <div className="lg:hidden p-4 border-t">
        <Button 
          onClick={() => setMobileFiltersOpen(false)} 
          className="w-full"
          size="lg"
        >
          Apply Filters
          {filterCount > 0 && (
            <Badge variant="secondary" className="ml-2 bg-primary-foreground text-primary">
              {filterCount}
            </Badge>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
          {selectedCategoryId
            ? getCategoryName(selectedCategoryId)
            : "All Products"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading...
            </span>
          ) : (
            <>
              {paginationMeta.total} product
              {paginationMeta.total !== 1 ? "s" : ""} found
            </>
          )}
        </p>
      </div>

      {/* Search & Sort bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 pr-8"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Button with Popover for Desktop */}
          <div className="hidden lg:block">
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                  {filterCount > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                      {filterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-80 p-0" 
                align="start"
                sideOffset={8}
              >
                {filterContent}
              </PopoverContent>
            </Popover>
          </div>

          {/* Mobile filter sheet */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="sm" className="relative">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
                {filterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                    {filterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-96 p-0">
              {filterContent}
            </SheetContent>
          </Sheet>

          {/* Sort dropdown */}
          <Select
            value={getCurrentSortValue()}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Bar */}
      {hasActiveFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {search && search.trim() !== "" && (
            <Badge variant="secondary" className="gap-1 px-2 py-1">
              "{search}"
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
              />
            </Badge>
          )}
          {selectedCategoryId && (
            <Badge variant="secondary" className="gap-1 px-2 py-1">
              {getCategoryName(selectedCategoryId)}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => {
                  setSelectedCategoryId(undefined);
                  setPage(1);
                }}
              />
            </Badge>
          )}
          {selectedSizeIds.map((sizeId) => {
            const size = sizes.find((s) => s.id === sizeId);
            return size ? (
              <Badge key={sizeId} variant="secondary" className="gap-1 px-2 py-1">
                Size: {size.name}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => toggleSize(sizeId)}
                />
              </Badge>
            ) : null;
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 px-2 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Main content */}
      <div className="flex gap-8">
        {/* Product grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="rounded-full bg-muted p-4">
                <Search className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No products found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3">
                {products.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {paginationMeta.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(5, paginationMeta.totalPages) },
                      (_, i) => {
                        let pageNum = i + 1;
                        if (paginationMeta.totalPages > 5) {
                          if (page > 3) {
                            pageNum = page - 3 + i;
                          }
                          if (page > paginationMeta.totalPages - 2) {
                            pageNum = paginationMeta.totalPages - 4 + i;
                          }
                        }

                        if (
                          pageNum <= paginationMeta.totalPages &&
                          pageNum > 0
                        ) {
                          return (
                            <Button
                              key={pageNum}
                              variant={page === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPage(pageNum)}
                              className="w-9"
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                        return null;
                      },
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === paginationMeta.totalPages}
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
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}