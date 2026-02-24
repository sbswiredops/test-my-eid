"use client"

import { useState } from "react"
import { products as initialProducts, categories, formatPrice } from "@/lib/data"
import type { Product } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

export default function AdminProducts() {
  const [productsList, setProductsList] = useState<Product[]>(initialProducts)
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    sizes: "",
    featured: false,
    tags: "",
    image: "/images/prod-1.jpg",
  })

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      category: "",
      sizes: "",
      featured: false,
      tags: "",
      image: "/images/prod-1.jpg",
    })
    setEditingProduct(null)
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || "",
      category: product.category,
      sizes: product.sizes.join(", "),
      featured: product.featured,
      tags: product.tags.join(", "),
      image: product.images[0] || "/images/prod-1.jpg",
    })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.name || !form.price || !form.category) {
      toast.error("Please fill in required fields")
      return
    }

    const sizes = form.sizes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    const stockPerSize: Record<string, number> = {}
    sizes.forEach((s) => {
      stockPerSize[s] = 10
    })

    if (editingProduct) {
      setProductsList((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: form.name,
                slug: form.name.toLowerCase().replace(/\s+/g, "-"),
                description: form.description,
                price: parseFloat(form.price),
                originalPrice: form.originalPrice
                  ? parseFloat(form.originalPrice)
                  : undefined,
                category: form.category,
                sizes,
                stockPerSize,
                featured: form.featured,
                tags: form.tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
                images: [form.image],
              }
            : p
        )
      )
      toast.success("Product updated successfully")
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: form.name,
        slug: form.name.toLowerCase().replace(/\s+/g, "-"),
        description: form.description,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice
          ? parseFloat(form.originalPrice)
          : undefined,
        category: form.category,
        sizes,
        stockPerSize,
        featured: form.featured,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        images: [form.image],
        createdAt: new Date().toISOString(),
      }
      setProductsList((prev) => [newProduct, ...prev])
      toast.success("Product created successfully")
    }

    setDialogOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    setProductsList((prev) => prev.filter((p) => p.id !== id))
    toast.success("Product deleted")
  }

  const filtered = productsList.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      filterCategory === "all" || p.category === filterCategory
    return matchesSearch && matchesCategory
  })

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
            setDialogOpen(open)
            if (!open) resetForm()
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
                  <Label htmlFor="price">Price (Rs.) *</Label>
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
                  <Label htmlFor="originalPrice">Original Price (Rs.)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={form.originalPrice}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        originalPrice: e.target.value,
                      }))
                    }
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(val) =>
                    setForm((f) => ({ ...f, category: val }))
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="sizes">
                  Sizes (comma-separated)
                </Label>
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
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={form.tags}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tags: e.target.value }))
                  }
                  placeholder="eid, formal, embroidered"
                />
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
              <Button onClick={handleSave} className="w-full">
                {editingProduct ? "Update Product" : "Create Product"}
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
            {categories.map((cat) => (
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
                {filtered.map((product) => (
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
                      {product.category.replace("-", " ")}
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
  )
}
