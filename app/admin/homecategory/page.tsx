"use client";

import { useState, useEffect } from "react";
import { useCategories, useProducts } from "@/hooks/use-api";
import { homeCategoryService } from "@/lib/api/homecategory";
import useSWR from "swr";
import type { Category, Product } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Check,
  ChevronsUpDown,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const HomeCategoryPage = () => {
  const {
    data: homeCategoriesData,
    mutate: mutateHomeCategories,
    isLoading: loadingHomeCategories,
  } = useSWR("/homecategory", async () => {
    const res = await homeCategoryService.getAll();
    return res?.data || [];
  });

  const { data: categoriesData } = useCategories();
  const { data: productsData } = useProducts();

  // Extract items from paginated responses (support raw array, { items }, or { data: { items } })
  const categoriesList: Category[] = Array.isArray(categoriesData)
    ? categoriesData
    : categoriesData && Array.isArray((categoriesData as any).items)
      ? (categoriesData as any).items
      : categoriesData &&
          (categoriesData as any).data &&
          Array.isArray((categoriesData as any).data.items)
        ? (categoriesData as any).data.items
        : [];

  const productsList: Product[] = Array.isArray(productsData)
    ? productsData
    : productsData && Array.isArray((productsData as any).items)
      ? (productsData as any).items
      : productsData &&
          (productsData as any).data &&
          Array.isArray((productsData as any).data.items)
        ? (productsData as any).data.items
        : [];

  const homeCategoriesList = Array.isArray(homeCategoriesData)
    ? homeCategoriesData
    : homeCategoriesData && Array.isArray((homeCategoriesData as any).items)
      ? (homeCategoriesData as any).items
      : homeCategoriesData &&
          (homeCategoriesData as any).data &&
          Array.isArray((homeCategoriesData as any).data.items)
        ? (homeCategoriesData as any).data.items
        : [];

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHomeCategory, setEditingHomeCategory] = useState<any | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  // Popover states
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  const [productPopoverOpen, setProductPopoverOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    priority: "",
    categoryIds: [] as string[],
    productIds: [] as string[],
  });

  const resetForm = () => {
    setForm({
      name: "",
      priority: "",
      categoryIds: [],
      productIds: [],
    });
    setEditingHomeCategory(null);
  };

  const openEdit = (homeCategory: any) => {
    setEditingHomeCategory(homeCategory);
    setForm({
      name: homeCategory.name,
      priority: homeCategory.priority?.toString() || "",
      categoryIds: homeCategory.categories?.map((c: Category) => c.id) || [],
      productIds: homeCategory.products?.map((p: Product) => p.id) || [],
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      const data = {
        name: form.name,
        priority: form.priority ? Number(form.priority) : undefined,
        categoryIds: form.categoryIds,
        productIds: form.productIds,
      };

      if (editingHomeCategory) {
        await homeCategoryService.update(editingHomeCategory.id, data);
        toast.success("Home category updated successfully");
      } else {
        await homeCategoryService.create(data);
        toast.success("Home category created successfully");
      }

      mutateHomeCategories?.();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to save home category");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this home category?")) return;

    try {
      await homeCategoryService.delete(id);
      mutateHomeCategories?.();
      toast.success("Home category deleted");
    } catch (error) {
      toast.error("Failed to delete home category");
    }
  };

  const filtered = homeCategoriesList.filter((c: any) => {
    return c.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Home Categories
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your home categories ({homeCategoriesList.length} items)
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
              Add Home Category
            </Button>
          </DialogTrigger>

          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif">
                {editingHomeCategory
                  ? "Edit Home Category"
                  : "Add New Home Category"}
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-6 pt-4">
              {/* Basic Information */}
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
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="Summer Collection"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="priority">Priority (Lower = Higher)</Label>
                    <Input
                      id="priority"
                      type="number"
                      min="0"
                      value={form.priority}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, priority: e.target.value }))
                      }
                      placeholder="1"
                    />
                  </div>
                </div>

                {/* Description removed */}
              </div>

              {/* Categories Selection */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
                  Select Categories
                </h3>

                <div className="flex flex-col gap-2">
                  <Label>Categories to Display</Label>
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
                              const category = categoriesList.find(
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
                              Select categories to display...
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
                          {categoriesList.map((category: any) => (
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
                              <div className="flex flex-col">
                                <span>{category.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {category.products?.length || 0} products
                                </span>
                              </div>
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

              {/* Products Selection */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
                  Select Products
                </h3>

                <div className="flex flex-col gap-2">
                  <Label>Featured Products (Optional)</Label>
                  <Popover
                    open={productPopoverOpen}
                    onOpenChange={setProductPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={productPopoverOpen}
                        className="justify-between h-auto min-h-10"
                      >
                        <div className="flex flex-wrap gap-1">
                          {form.productIds.length > 0 ? (
                            form.productIds.map((id) => {
                              const product = productsList.find(
                                (p: any) => p.id === id,
                              );
                              return product ? (
                                <Badge
                                  key={id}
                                  variant="secondary"
                                  className="mr-1"
                                >
                                  {product.name}
                                  <X
                                    className="ml-1 h-3 w-3 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setForm((f) => ({
                                        ...f,
                                        productIds: f.productIds.filter(
                                          (pId) => pId !== id,
                                        ),
                                      }));
                                    }}
                                  />
                                </Badge>
                              ) : null;
                            })
                          ) : (
                            <span className="text-muted-foreground">
                              Select featured products...
                            </span>
                          )}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search products..." />
                        <CommandEmpty>No product found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {productsList.map((product: any) => (
                            <CommandItem
                              key={product.id}
                              onSelect={() => {
                                setForm((f) => ({
                                  ...f,
                                  productIds: f.productIds.includes(product.id)
                                    ? f.productIds.filter(
                                        (id) => id !== product.id,
                                      )
                                    : [...f.productIds, product.id],
                                }));
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  form.productIds.includes(product.id)
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{product.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  ৳{product.price}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">
                    Selected: {form.productIds.length} products
                  </p>
                </div>
              </div>

              {/* Summary */}
              {form.categoryIds.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h4 className="text-sm font-medium">Summary</h4>
                  <p className="text-xs text-muted-foreground">
                    This home category will display:
                  </p>
                  <ul className="text-xs list-disc list-inside space-y-1">
                    <li>{form.categoryIds.length} categories</li>
                    <li>{form.productIds.length} featured products</li>
                    <li>Priority: {form.priority || "Not set"}</li>
                  </ul>
                </div>
              )}

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
                  : editingHomeCategory
                    ? "Update Home Category"
                    : "Create Home Category"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search home categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Home Categories Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-4 font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    Priority
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    Categories
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    Products
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((homeCategory: any) => {
                  const categories = homeCategory.categories || [];
                  const products = homeCategory.products || [];

                  return (
                    <tr
                      key={homeCategory.id}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {homeCategory.name}
                          </p>
                          {homeCategory.description &&
                            {
                              /* description removed from display */
                            }}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            homeCategory.priority <= 3 ? "default" : "secondary"
                          }
                        >
                          {homeCategory.priority || "-"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {categories.slice(0, 3).map((cat: Category) => (
                            <Badge
                              key={cat.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {cat.name}
                            </Badge>
                          ))}
                          {categories.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{categories.length - 3} more
                            </Badge>
                          )}
                          {categories.length === 0 && (
                            <span className="text-xs text-muted-foreground">
                              No categories
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {products.slice(0, 3).map((prod: Product) => (
                            <Badge
                              key={prod.id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {prod.name}
                            </Badge>
                          ))}
                          {products.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{products.length - 3} more
                            </Badge>
                          )}
                          {products.length === 0 && (
                            <span className="text-xs text-muted-foreground">
                              No products
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(homeCategory)}
                            aria-label={`Edit ${homeCategory.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(homeCategory.id)}
                            aria-label={`Delete ${homeCategory.name}`}
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
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No home categories found.
              </p>
              <Button
                variant="link"
                onClick={() => setDialogOpen(true)}
                className="mt-2"
              >
                Create your first home category
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HomeCategoryPage;
