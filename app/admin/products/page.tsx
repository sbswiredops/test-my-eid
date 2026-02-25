"use client";

import { useState } from "react";
import {
  products as staticProducts,
  categories as staticCategories,
  formatPrice,
} from "@/lib/data";
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
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function AdminProducts() {
  const {
    data: productsData,
    mutate: mutateProducts,
    isLoading: loadingProducts,
  } = useProducts();
  const { data: categoriesData } = useCategories();
  const productsList = Array.isArray(productsData)
    ? productsData
    : staticProducts;
  const categories = Array.isArray(categoriesData)
    ? categoriesData
    : staticCategories;

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<FileList | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    slug: "",
    price: "",
    originalPrice: "",
    stock: "",
    stockPerSize: "",
    categoryId: "",
    sizes: "",
    images: [] as string[],
    featured: false,
    tags: "",
  });

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      slug: "",
      price: "",
      originalPrice: "",
      stock: "",
      stockPerSize: "",
      categoryId: "",
      sizes: "",
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
      description: product.description || "",
      slug: (product as any).slug || "",
      price: product.price?.toString() || "",
      originalPrice: (product as any).originalPrice?.toString() || "",
      stock: product.stock?.toString() || "",
      stockPerSize: (product as any).stockPerSize ? JSON.stringify((product as any).stockPerSize) : "",
      categoryId: product.categoryId || "",
      sizes: Array.isArray(product.sizes) ? product.sizes.map((s: any) => s.size).join(", ") : "",
      images: product.images || [],
      featured: !!(product as any).featured,
      tags: Array.isArray((product as any).tags) ? (product as any).tags.join(", ") : "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.description || !form.stock || !form.categoryId || !form.sizes) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      const sizes = form.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const tags = form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
      const stockPerSize = form.stockPerSize ? JSON.parse(form.stockPerSize) : undefined;

      // Require at least one image for new products
      if (!editingProduct && (!selectedImages || selectedImages.length === 0)) {
        toast.error("Please upload at least one image");
        setLoading(false);
        return;
      }

      // Build multipart FormData to send files + fields in one request
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      if (form.slug) formData.append("slug", form.slug);
      formData.append("price", form.price);
      if (form.originalPrice) formData.append("originalPrice", form.originalPrice);
      formData.append("stock", form.stock);
      if (stockPerSize) formData.append("stockPerSize", JSON.stringify(stockPerSize));
      formData.append("categoryId", form.categoryId);
      // Append sizes and tags as repeated fields so Nest parses them as arrays
      sizes.forEach((s) => formData.append("sizes", s));
      formData.append("featured", String(form.featured));
      tags.forEach((t) => formData.append("tags", t));

      // Append images: if user selected files, append File objects under 'images'
      if (selectedImages && selectedImages.length > 0) {
        for (let i = 0; i < selectedImages.length; i++) {
          formData.append("images", selectedImages[i]);
        }
      } else if (editingProduct && Array.isArray(form.images) && form.images.length > 0) {
        // No new files selected — keep existing image URLs so DTO validation passes
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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
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
    const matchesCategory =
      filterCategory === "all" || p.categoryId === filterCategory;
    return matchesSearch && matchesCategory;
  });

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
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Product name"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Product description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="price">Price (BDT) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    placeholder="0"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={form.stock}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, stock: e.target.value }))
                    }
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="categoryId">Category *</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(val) =>
                    setForm((f) => ({ ...f, categoryId: val }))
                  }
                >
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: { id: string; name: string }) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="sizes">Sizes (comma-separated)</Label>
                <Input
                  id="sizes"
                  value={form.sizes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sizes: e.target.value }))
                  }
                  placeholder="S, M, L, XL"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="product-slug"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="originalPrice">Original Price (BDT)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  value={form.originalPrice}
                  onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="stockPerSize">Stock Per Size (JSON)</Label>
                <Input
                  id="stockPerSize"
                  value={form.stockPerSize}
                  onChange={(e) => setForm((f) => ({ ...f, stockPerSize: e.target.value }))}
                  placeholder='{"S":10,"M":5}'
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  placeholder="eid, formal, embroidered"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="images">Product Images</Label>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setSelectedImages(e.target.files)}
                />
                <p className="text-xs text-muted-foreground">
                  Upload up to 10 images. First image will be the cover.
                </p>
              </div>
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
                <Label htmlFor="featured">Featured product</Label>
              </div>
              <Button
                onClick={handleSave}
                className="w-full"
                disabled={loading}
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
            <SelectValue />
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
                    Category
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
                {filtered.map((product: Product) => (
                  <tr
                    key={product.id}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.sizes.join(", ")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 capitalize text-muted-foreground">
                      {(() => {
                        const cat = categories.find((c: any) => c.id === product.categoryId);
                        return cat ? cat.name : product.categoryId;
                      })()}
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-foreground">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="ml-1 text-xs text-muted-foreground line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
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
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
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
