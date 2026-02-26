"use client";

import { useEffect, useState } from "react";
import { faqService } from "@/lib/api/faq";
import { productService } from "@/lib/api/products";
import { categoryService } from "@/lib/api/categories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Search,
  Plus,
  Pencil,
  Trash2,
  Check,
  ChevronsUpDown,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminFAQs() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any | null>(null);

  // Popover states
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  const [productPopoverOpen, setProductPopoverOpen] = useState(false);

  const [form, setForm] = useState({
    question: "",
    answer: "",
    type: "GENERAL",
    status: "ACTIVE",
    tags: "",
    productIds: [] as string[],
    categoryIds: [] as string[],
  });

  const [productsList, setProductsList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);

  useEffect(() => {
    fetchFaqs();
    fetchProductsAndCategories();
  }, []);

  const fetchFaqs = () => {
    setLoading(true);
    faqService
      .getAll()
      .then((res) => {
        if (!res || res.success !== true) {
          toast.error("Failed to load FAQs");
          return;
        }

        const d: any = res.data;
        const items = Array.isArray(d)
          ? d
          : d && Array.isArray(d.items)
            ? d.items
            : d && d.data && Array.isArray(d.data.items)
              ? d.data.items
              : [];

        setFaqs(items);
      })
      .catch(() => {
        toast.error("Failed to load FAQs");
      })
      .finally(() => setLoading(false));
  };

  const extractItems = (res: any) => {
    if (!res) return [];
    const d: any = res.data ?? res;
    return Array.isArray(d)
      ? d
      : d && Array.isArray(d.items)
        ? d.items
        : d && d.data && Array.isArray(d.data.items)
          ? d.data.items
          : [];
  };

  const fetchProductsAndCategories = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
      ]);
      setProductsList(extractItems(pRes));
      setCategoriesList(extractItems(cRes));
    } catch (e) {
      // silent fail
    }
  };

  const handleDialogOpen = (faq?: any) => {
    if (faq) {
      setEditingFaq(faq);
      setForm({
        question: faq.question,
        answer: faq.answer,
        type: faq.type,
        status: faq.status,
        tags: faq.tags || "",
        productIds: Array.isArray(faq.products)
          ? faq.products.map((p: any) => p.id)
          : [],
        categoryIds: Array.isArray(faq.categories)
          ? faq.categories.map((c: any) => c.id)
          : [],
      });
    } else {
      setEditingFaq(null);
      setForm({
        question: "",
        answer: "",
        type: "GENERAL",
        status: "ACTIVE",
        tags: "",
        productIds: [],
        categoryIds: [],
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.question || !form.answer) {
      toast.error("Question and answer are required");
      return;
    }

    try {
      const data = {
        question: form.question,
        answer: form.answer,
        type: form.type,
        status: form.status,
        tags: form.tags,
        productIds: form.productIds,
        categoryIds: form.categoryIds,
      };

      if (editingFaq) {
        await faqService.update(editingFaq.id, data);
        toast.success("FAQ updated successfully");
      } else {
        await faqService.create(data);
        toast.success("FAQ created successfully");
      }

      setDialogOpen(false);
      fetchFaqs();
    } catch {
      toast.error("Failed to save FAQ");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      await faqService.delete(id);
      toast.success("FAQ deleted");
      fetchFaqs();
    } catch {
      toast.error("Failed to delete FAQ");
    }
  };

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    const matchesType = type && type !== "ALL" ? faq.type === type : true;
    return matchesSearch && matchesType;
  });

  const faqTypes = [
    "GENERAL",
    "PRODUCT",
    "ORDER",
    "PAYMENT",
    "SHIPPING",
    "RETURN",
    "ACCOUNT",
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            FAQs
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage all frequently asked questions ({faqs.length} FAQs)
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleDialogOpen()}>
              <Plus className="mr-2 h-4 w-4" /> Add FAQ
            </Button>
          </DialogTrigger>

          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif">
                {editingFaq ? "Edit FAQ" : "Add New FAQ"}
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-6 pt-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
                  Basic Information
                </h3>

                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="question"
                    className="after:content-['*'] after:ml-0.5 after:text-red-500"
                  >
                    Question
                  </Label>
                  <Input
                    id="question"
                    value={form.question}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, question: e.target.value }))
                    }
                    placeholder="e.g., How do I track my order?"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="answer"
                    className="after:content-['*'] after:ml-0.5 after:text-red-500"
                  >
                    Answer
                  </Label>
                  <Textarea
                    id="answer"
                    value={form.answer}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, answer: e.target.value }))
                    }
                    placeholder="Provide a detailed answer..."
                    rows={5}
                  />
                </div>
              </div>

              {/* Classification */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
                  Classification
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="type">FAQ Type</Label>
                    <Select
                      value={form.type}
                      onValueChange={(value) =>
                        setForm((f) => ({ ...f, type: value }))
                      }
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {faqTypes.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(value) =>
                        setForm((f) => ({ ...f, status: value }))
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={form.tags}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, tags: e.target.value }))
                    }
                    placeholder="shipping, delivery, tracking"
                  />
                  <p className="text-xs text-muted-foreground">
                    Add tags to help organize and search FAQs
                  </p>
                </div>
              </div>

              {/* Related Content - Only show for PRODUCT type */}
              {form.type === "PRODUCT" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
                    Related Content
                  </h3>

                  {/* Categories Selection */}
                  <div className="flex flex-col gap-2">
                    <Label>Related Categories</Label>
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
                                  (c) => c.id === id,
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
                            {categoriesList.map((category) => (
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

                  {/* Products Selection */}
                  <div className="flex flex-col gap-2">
                    <Label>Related Products</Label>
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
                                  (p) => p.id === id,
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
                                Select products...
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
                            {productsList.map((product) => (
                              <CommandItem
                                key={product.id}
                                onSelect={() => {
                                  setForm((f) => ({
                                    ...f,
                                    productIds: f.productIds.includes(
                                      product.id,
                                    )
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
              )}

              {/* Summary */}
              {(form.categoryIds.length > 0 || form.productIds.length > 0) && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h4 className="text-sm font-medium">Summary</h4>
                  <ul className="text-xs list-disc list-inside space-y-1 text-muted-foreground">
                    {form.categoryIds.length > 0 && (
                      <li>{form.categoryIds.length} related categories</li>
                    )}
                    {form.productIds.length > 0 && (
                      <li>{form.productIds.length} related products</li>
                    )}
                    <li>Type: {form.type}</li>
                    <li>Status: {form.status}</li>
                  </ul>
                </div>
              )}

              {/* Required Fields Note */}
              <p className="text-xs text-muted-foreground">
                <span className="text-red-500">*</span> Required fields
              </p>

              {/* Submit Button */}
              <Button onClick={handleSave} className="w-full" size="lg">
                {editingFaq ? "Update FAQ" : "Create FAQ"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search FAQs by question or answer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {faqTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* FAQ List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No FAQs found.</p>
              <Button
                variant="link"
                onClick={() => handleDialogOpen()}
                className="mt-2"
              >
                Create your first FAQ
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredFaqs.map((faq) => (
            <Card
              key={faq.id}
              className="border hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="font-serif text-lg text-foreground">
                    {faq.question}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDialogOpen(faq)}
                      aria-label="Edit FAQ"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(faq.id)}
                      aria-label="Delete FAQ"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge
                    variant={faq.type === "GENERAL" ? "default" : "secondary"}
                  >
                    {faq.type}
                  </Badge>
                  <Badge
                    variant={
                      faq.status === "ACTIVE"
                        ? "default"
                        : faq.status === "DRAFT"
                          ? "outline"
                          : "secondary"
                    }
                  >
                    {faq.status}
                  </Badge>
                  {faq.tags &&
                    faq.tags.split(",").map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag.trim()}
                      </Badge>
                    ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none text-sm text-muted-foreground">
                  {faq.answer}
                </div>

                {(faq.categories?.length > 0 || faq.products?.length > 0) && (
                  <div className="mt-4 space-y-2">
                    {faq.categories?.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium">Categories:</span>
                        <div className="flex flex-wrap gap-1">
                          {faq.categories.slice(0, 3).map((cat: any) => (
                            <Badge
                              key={cat.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {cat.name}
                            </Badge>
                          ))}
                          {faq.categories.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{faq.categories.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {faq.products?.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium">Products:</span>
                        <div className="flex flex-wrap gap-1">
                          {faq.products.slice(0, 3).map((prod: any) => (
                            <Badge
                              key={prod.id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {prod.name}
                            </Badge>
                          ))}
                          {faq.products.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{faq.products.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                  {faq.helpfulCount > 0 && (
                    <span>👍 {faq.helpfulCount} found helpful</span>
                  )}
                  {faq.viewCount > 0 && <span>👁️ {faq.viewCount} views</span>}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
