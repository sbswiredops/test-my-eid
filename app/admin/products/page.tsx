"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/data";
import { useProducts, useCategories } from "@/hooks/use-api";
import { productService } from "@/lib/api/products";
import { apiClient } from "@/lib/api";
import type { Product } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Check,
  ChevronsUpDown,
  X,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminProducts() {
  const {
    data: productsData,
    mutate: mutateProducts,
    isLoading: loadingProducts,
  } = useProducts();
  const { data: categoriesData } = useCategories();
  const productsList = Array.isArray(productsData)
    ? productsData
    : productsData && Array.isArray((productsData as any).items)
      ? (productsData as any).items
      : productsData &&
          productsData.data &&
          Array.isArray(productsData.data.items)
        ? productsData.data.items
        : [];
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  // Sizes state
  const [sizes, setSizes] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    async function loadSizes() {
      try {
        const res = await productService.getSizes();
        if (res && res.data && Array.isArray(res.data)) {
          // Normalize size objects: API may return { size } field instead of { name }
          setSizes(
            res.data.map((s: any) => ({ id: s.id, name: s.name ?? s.size })),
          );
        }
      } catch {
        setSizes([]);
      }
    }
    loadSizes();
  }, []);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<FileList | null>(null);

  // Popover states
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  const [sizePopoverOpen, setSizePopoverOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    originalPrice: "",
    stock: "",
    stockPerSize: "",
    categoryIds: [] as string[], // Changed to array for multiple categories
    sizeIds: [] as string[], // Changed to array for multiple sizes
    images: [] as string[],
    featured: false,
    tags: "",
  });

  const resetForm = () => {
    setForm({
      name: "",
      slug: "",
      description: "",
      price: "",
      originalPrice: "",
      stock: "",
      stockPerSize: "",
      categoryIds: [],
      sizeIds: [],
      images: [],
      featured: false,
      tags: "",
    });
    setEditingProduct(null);
    setSelectedImages(null);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: (product as any).slug || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      originalPrice: (product as any).originalPrice?.toString() || "",
      stock: product.stock?.toString() || "",
      stockPerSize: (product as any).stockPerSize
        ? JSON.stringify((product as any).stockPerSize)
        : "",
      categoryIds: Array.isArray(product.categories)
        ? product.categories.map((c: any) => c.id)
        : (product as any).categoryId
          ? [(product as any).categoryId]
          : [],
      sizeIds: Array.isArray(product.sizes)
        ? product.sizes.map((s: any) => s.id)
        : [],
      images: product.images || [],
      featured: !!(product as any).featured,
      tags: Array.isArray((product as any).tags)
        ? (product as any).tags.join(", ")
        : "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    // Required fields validation
    if (
      !form.name ||
      !form.price ||
      !form.description ||
      !form.stock ||
      !form.categoryIds.length ||
      !form.sizeIds.length
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const tags = form.tags
        ? form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];
      const stockPerSize = form.stockPerSize
        ? JSON.parse(form.stockPerSize)
        : undefined;

      // Require at least one image for new products
      if (!editingProduct && (!selectedImages || selectedImages.length === 0)) {
        toast.error("Please upload at least one image");
        setLoading(false);
        return;
      }

      // Build multipart FormData
      const formData = new FormData();

      // Basic info
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      formData.append("featured", String(form.featured));

      // Optional fields
      if (form.slug) formData.append("slug", form.slug);
      if (form.originalPrice)
        formData.append("originalPrice", form.originalPrice);
      if (stockPerSize)
        formData.append("stockPerSize", JSON.stringify(stockPerSize));

      // Categories (multiple)
      form.categoryIds.forEach((id) => formData.append("categoryIds", id));

      // Sizes (multiple)
      form.sizeIds.forEach((id) => formData.append("sizeIds", id));

      // Tags (multiple)
      tags.forEach((t) => formData.append("tags", t));

      // Images
      if (selectedImages && selectedImages.length > 0) {
        for (let i = 0; i < selectedImages.length; i++) {
          formData.append("images", selectedImages[i]);
        }
      } else if (
        editingProduct &&
        Array.isArray(form.images) &&
        form.images.length > 0
      ) {
        form.images.forEach((url) => formData.append("images", url));
      }

      if (editingProduct) {
        await productService.update(editingProduct.id, formData);
        toast.success("Product updated successfully");
      } else {
        await productService.create(formData);
        toast.success("Product created successfully");
      }

      mutateProducts();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to save product");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await productService.delete(id);
      mutateProducts();
      toast.success("Product deleted");
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const filtered = productsList.filter((p: Product) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const productCategories = Array.isArray(p.categories)
      ? p.categories.map((c: any) => c.slug || c.id)
      : [(p as any).categoryId].filter(Boolean);

    const matchesCategory =
      filterCategory === "all" || productCategories.includes(filterCategory);
    return matchesSearch && matchesCategory;
  });

  // Helper functions to get display names
  const getCategoryNames = (categoryIds: string[]) => {
    return categoryIds
      .map((id) => categories.find((c: any) => c.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  const getSizeNames = (sizeIds: string[]) => {
    return sizeIds
      .map((id) => sizes.find((s) => s.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Products
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your product catalog ({productsList.length} products)
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-6 pt-4">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
                  Basic Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="name"
                      className="after:content-['*'] after:ml-0.5 after:text-red-500"
                    >
                      Product Name
                    </Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="Enter product name"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="slug">Slug (URL)</Label>
                    <Input
                      id="slug"
                      value={form.slug}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, slug: e.target.value }))
                      }
                      placeholder="product-url-slug"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="description"
                    className="after:content-['*'] after:ml-0.5 after:text-red-500"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="Product description"
                    rows={4}
                  />
                </div>
              </div>

              {/* Pricing & Stock Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
                  Pricing & Stock
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="price"
                      className="after:content-['*'] after:ml-0.5 after:text-red-500"
                    >
                      Price (BDT)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, price: e.target.value }))
                      }
                      placeholder="0.00"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="originalPrice">Original Price (BDT)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.originalPrice}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          originalPrice: e.target.value,
                        }))
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="stock"
                      className="after:content-['*'] after:ml-0.5 after:text-red-500"
                    >
                      Stock Quantity
                    </Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, stock: e.target.value }))
                      }
                      placeholder="0"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="stockPerSize">Stock Per Size (JSON)</Label>
                    <Input
                      id="stockPerSize"
                      value={form.stockPerSize}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, stockPerSize: e.target.value }))
                      }
                      placeholder='{"S": 10, "M": 5, "L": 8}'
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional: Override stock for specific sizes
                    </p>
                  </div>
                </div>
              </div>

              {/* Categories Section - Multiple Select */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
                  Categories
                </h3>

                <div className="flex flex-col gap-2">
                  <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                    Select Categories
                  </Label>
                  <Popover
                    open={categoryPopoverOpen}
                    onOpenChange={setCategoryPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={categoryPopoverOpen}
                        className="justify-between h-auto min-h-10"
                      >
                        <div className="flex flex-wrap gap-1">
                          {form.categoryIds.length > 0 ? (
                            form.categoryIds.map((id) => {
                              const category = categories.find(
                                (c: any) => c.id === id,
                              );
                              return category ? (
                                <Badge
                                  key={id}
                                  variant="secondary"
                                  className="mr-1"
                                >
                                  {category.name}
                                  <X
                                    className="ml-1 h-3 w-3 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setForm((f) => ({
                                        ...f,
                                        categoryIds: f.categoryIds.filter(
                                          (cId) => cId !== id,
                                        ),
                                      }));
                                    }}
                                  />
                                </Badge>
                              ) : null;
                            })
                          ) : (
                            <span className="text-muted-foreground">
                              Select categories...
                            </span>
                          )}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search categories..." />
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {categories.map((category: any) => (
                            <CommandItem
                              key={category.id}
                              onSelect={() => {
                                setForm((f) => ({
                                  ...f,
                                  categoryIds: f.categoryIds.includes(
                                    category.id,
                                  )
                                    ? f.categoryIds.filter(
                                        (id) => id !== category.id,
                                      )
                                    : [...f.categoryIds, category.id],
                                }));
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  form.categoryIds.includes(category.id)
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {category.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">
                    Selected: {form.categoryIds.length} categories
                  </p>
                </div>
              </div>

              {/* Sizes Section - Multiple Select */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
                  Available Sizes
                </h3>

                <div className="flex flex-col gap-2">
                  <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                    Select Sizes
                  </Label>
                  <Popover
                    open={sizePopoverOpen}
                    onOpenChange={setSizePopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={sizePopoverOpen}
                        className="justify-between h-auto min-h-10"
                      >
                        <div className="flex flex-wrap gap-1">
                          {form.sizeIds.length > 0 ? (
                            form.sizeIds.map((id) => {
                              const size = sizes.find((s) => s.id === id);
                              return size ? (
                                <Badge
                                  key={id}
                                  variant="secondary"
                                  className="mr-1"
                                >
                                  {size.name}
                                  <X
                                    className="ml-1 h-3 w-3 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setForm((f) => ({
                                        ...f,
                                        sizeIds: f.sizeIds.filter(
                                          (sId) => sId !== id,
                                        ),
                                      }));
                                    }}
                                  />
                                </Badge>
                              ) : null;
                            })
                          ) : (
                            <span className="text-muted-foreground">
                              Select sizes...
                            </span>
                          )}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search sizes..." />
                        <CommandEmpty>No size found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {sizes.map((size) => (
                            <CommandItem
                              key={size.id}
                              onSelect={() => {
                                setForm((f) => ({
                                  ...f,
                                  sizeIds: f.sizeIds.includes(size.id)
                                    ? f.sizeIds.filter((id) => id !== size.id)
                                    : [...f.sizeIds, size.id],
                                }));
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  form.sizeIds.includes(size.id)
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {size.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">
                    Selected: {form.sizeIds.length} sizes
                  </p>
                </div>
              </div>

              {/* Media Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
                  Media & Tags
                </h3>

                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="images"
                    className="after:content-['*'] after:ml-0.5 after:text-red-500"
                  >
                    Product Images
                  </Label>
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setSelectedImages(e.target.files)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload up to 10 images. First image will be the cover.{" "}
                    {editingProduct && "Leave empty to keep existing images."}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={form.tags}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, tags: e.target.value }))
                    }
                    placeholder="eid, formal, embroidered, summer"
                  />
                </div>
              </div>

              {/* Settings Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
                  Settings
                </h3>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, featured: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor="featured" className="text-sm">
                    Mark as featured product (appears on homepage)
                  </Label>
                </div>
              </div>

              {/* Required Fields Note */}
              <p className="text-xs text-muted-foreground">
                <span className="text-red-500">*</span> Required fields
              </p>

              {/* Submit Button */}
              <Button
                onClick={handleSave}
                className="w-full"
                disabled={loading}
                size="lg"
              >
                {loading
                  ? "Saving..."
                  : editingProduct
                    ? "Update Product"
                    : "Create Product"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat: { slug: string; name: string }) => (
              <SelectItem key={cat.slug} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-4 font-medium text-muted-foreground">
                    Product
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    Categories
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    Sizes
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    Price
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product: Product) => {
                  const productCategories = Array.isArray(product.categories)
                    ? product.categories
                    : [];
                  const productSizes = Array.isArray(product.sizes)
                    ? product.sizes
                    : [];

                  return (
                    <tr
                      key={product.id}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                            {product.images?.[0] && (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Stock: {product.stock}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {productCategories.map((cat: any) => (
                            <Badge
                              key={cat.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {cat.name}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {productSizes.map((size: any) => (
                            <Badge
                              key={size.id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {size.name ?? size.size}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {product.featured ? (
                          <Badge className="bg-accent text-accent-foreground">
                            Featured
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Standard</Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(product)}
                            aria-label={`Edit ${product.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                            aria-label={`Delete ${product.name}`}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No products found.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
