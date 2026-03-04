"use client";

import { useEffect, useState } from "react";
import { productService } from "@/lib/api/products";
import type { ProductSize } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  X,
  ArrowUpDown,
  Ruler,
  Shirt,
  Tag,
  Check,
  ChevronsUpDown,
  Copy,
  Save,
  Layers,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Info,
  Hash,
  Scissors,
  Ruler as RulerIcon,
  Shirt as ShirtIcon,
  User,
  ArrowLeftRight,
  Circle,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Measurement field configuration for better organization
const measurementFields = {
  primary: [
    { key: "length", label: "Length", icon: Ruler, tooltip: "Overall length" },
    { key: "chest", label: "Chest", icon: ShirtIcon, tooltip: "Chest circumference" },
    { key: "waist", label: "Waist", icon: User, tooltip: "Waist circumference" },
    { key: "hip", label: "Hip", icon: User, tooltip: "Hip circumference" },
  ],
  secondary: [
    { key: "shoulder", label: "Shoulder", icon: ArrowLeftRight, tooltip: "Shoulder width" },
    { key: "sleeve", label: "Sleeve", icon: Scissors, tooltip: "Sleeve length" },
    { key: "thigh", label: "Thigh", icon: Circle, tooltip: "Thigh circumference" },
    { key: "legOpening", label: "Leg Opening", icon: Circle, tooltip: "Leg opening width" },
  ],
  additional: [
    { key: "thighRound", label: "Thigh Round", icon: Circle, tooltip: "Thigh round measurement" },
    { key: "halfThigh", label: "Half Thigh", icon: Circle, tooltip: "Half thigh measurement" },
  ],
};

// Interface for multiple size entries
interface SizeFormEntry {
  id: string;
  size: string;
  order?: string;
  length?: string;
  chest?: string;
  legOpening?: string;
  thighRound?: string;
  waist?: string;
  sleeve?: string;
  shoulder?: string;
  halfThigh?: string;
  hip?: string;
  thigh?: string;
  sizeType: string[];
}

export default function AdminSizesPage() {
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProductSize | null>(null);
  const [query, setQuery] = useState("");
  const [sizeTypes, setSizeTypes] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ProductSize;
    direction: "asc" | "desc";
  } | null>(null);
  const [typePopoverOpen, setTypePopoverOpen] = useState<{
    [key: string]: boolean;
  }>({});
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({});

  const createEmptyEntry = (): SizeFormEntry => ({
    id: crypto.randomUUID(),
    size: "",
    order: "",
    length: "",
    chest: "",
    legOpening: "",
    thighRound: "",
    waist: "",
    sleeve: "",
    shoulder: "",
    halfThigh: "",
    hip: "",
    thigh: "",
    sizeType: [],
  });

  // Multiple size entries state
  const [sizeEntries, setSizeEntries] = useState<SizeFormEntry[]>([
    createEmptyEntry(),
  ]);

  const load = async () => {
    setLoading(true);
    try {
      const [sizesRes, typesRes] = await Promise.all([
        productService.getSizes(),
        productService.getSizeTypes(),
      ]);

      if (sizesRes && sizesRes.data) setSizes(sizesRes.data as ProductSize[]);
      if (typesRes && typesRes.data) setSizeTypes(typesRes.data as string[]);
    } catch (err) {
      toast.error("Failed to load sizes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setSizeEntries([createEmptyEntry()]);
    setDialogOpen(true);
  };

  const openEdit = (s: ProductSize) => {
    setEditing(s);
    setSizeEntries([
      {
        id: crypto.randomUUID(),
        size: s.size,
        order: s.order !== undefined && s.order !== null ? String(s.order) : "",
        length: s.length !== undefined && s.length !== null ? String(s.length) : "",
        chest: s.chest !== undefined && s.chest !== null ? String(s.chest) : "",
        legOpening: s.legOpening !== undefined && s.legOpening !== null ? String(s.legOpening) : "",
        thighRound: s.thighRound !== undefined && s.thighRound !== null ? String(s.thighRound) : "",
        waist: s.waist !== undefined && s.waist !== null ? String(s.waist) : "",
        sleeve: s.sleeve !== undefined && s.sleeve !== null ? String(s.sleeve) : "",
        shoulder: s.shoulder !== undefined && s.shoulder !== null ? String(s.shoulder) : "",
        halfThigh: s.halfThigh !== undefined && s.halfThigh !== null ? String(s.halfThigh) : "",
        hip: s.hip !== undefined && s.hip !== null ? String(s.hip) : "",
        thigh: s.thigh !== undefined && s.thigh !== null ? String(s.thigh) : "",
        sizeType: s.sizeType || [],
      },
    ]);
    setDialogOpen(true);
  };

  const buildPayload = (entry: SizeFormEntry) => {
    const payload: Record<string, any> = { size: entry.size.trim() };

    const numericFields: Array<keyof Pick<SizeFormEntry, "order" | "length" | "chest" | "legOpening" | "thighRound" | "waist" | "sleeve" | "shoulder" | "halfThigh" | "hip" | "thigh">> = [
      "order",
      "length",
      "chest",
      "legOpening",
      "thighRound",
      "waist",
      "sleeve",
      "shoulder",
      "halfThigh",
      "hip",
      "thigh",
    ];

    numericFields.forEach((field) => {
      const value = entry[field];
      if (value !== undefined && value !== null && value.toString().trim().length > 0) {
        const parsed = Number(value);
        payload[field] = Number.isNaN(parsed) ? 0 : parsed;
      }
    });

    if (entry.sizeType && entry.sizeType.length > 0) {
      payload.sizeType = entry.sizeType;
    }

    return payload;
  };

  const handleSave = async () => {
    const invalidEntries = sizeEntries.filter(
      (entry) => !entry.size || entry.size.trim().length === 0,
    );

    if (invalidEntries.length > 0) {
      toast.error("Please provide a size for all entries");
      return;
    }

    setLoading(true);
    try {
      if (editing) {
        const entry = sizeEntries[0];
        const payload = buildPayload(entry);
        await productService.updateSize(editing.id as string, payload);
        toast.success("Size updated successfully");
      } else {
        const payloads = sizeEntries.map((entry) => buildPayload(entry));
        await productService.createSize(payloads);
        toast.success(
          `${sizeEntries.length} size${sizeEntries.length > 1 ? "s" : ""} created successfully`,
        );
      }

      setDialogOpen(false);
      await load();
    } catch (err) {
      toast.error("Failed to save sizes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (
      !confirm(
        "Are you sure you want to delete this size? This action cannot be undone.",
      )
    )
      return;
    setLoading(true);
    try {
      await productService.deleteSize(id);
      toast.success("Size deleted successfully");
      await load();
    } catch (err) {
      toast.error("Failed to delete size");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: keyof ProductSize) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const filteredAndSortedSizes = () => {
    let filtered = sizes.filter(
      (s) => s.size.toLowerCase().includes(query.toLowerCase()),
    );

    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;

        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  };

  const addNewEntry = () => {
    setSizeEntries((prev) => [...prev, createEmptyEntry()]);
  };

  const removeEntry = (id: string) => {
    if (sizeEntries.length === 1) {
      toast.error("At least one entry is required");
      return;
    }
    setSizeEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const duplicateEntry = (index: number) => {
    const entryToDuplicate = sizeEntries[index];
    setSizeEntries((prev) => [
      ...prev,
      {
        ...entryToDuplicate,
        id: crypto.randomUUID(),
      },
    ]);
  };

  const updateEntry = (id: string, field: keyof SizeFormEntry, value: any) => {
    setSizeEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry,
      ),
    );
  };

  const setSizeType = (entryId: string, value: string) => {
    setSizeEntries((prev) =>
      prev.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              sizeType:
                (entry.sizeType?.length ?? 0) === 1 && entry.sizeType?.[0] === value
                  ? []
                  : [value],
            }
          : entry,
      ),
    );
  };

  const clearFilters = () => {
    setQuery("");
  };

  const toggleSection = (entryId: string, section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [`${entryId}-${section}`]: !prev[`${entryId}-${section}`],
    }));
  };

  // Format size type for display
  const formatSizeType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Get initials for avatar
  const getInitials = (size: string) => {
    return size.substring(0, 2).toUpperCase();
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
        <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
          {/* Header Section with Glassmorphism */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 p-6 md:p-8">
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Ruler className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="font-serif text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent">
                      Product Sizes
                    </h1>
                    <p className="text-sm text-muted-foreground/80">
                      Manage and organize product sizes and measurements
                    </p>
                  </div>
                </div>
              </div>

              {/* Search and Add Bar */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-11 w-full pl-9 pr-8 sm:w-[300px] bg-background/50 backdrop-blur-sm border-primary/20 focus:border-primary/40"
                    placeholder="Search sizes..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  {query && (
                    <button
                      onClick={clearFilters}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button 
                  onClick={openCreate} 
                  className="h-11 gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                  Add New Size
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards with Hover Effects */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-3 group-hover:scale-110 transition-transform">
                    <Tag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sizes</p>
                    <p className="text-2xl font-bold">{sizes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 p-3 group-hover:scale-110 transition-transform">
                    <Shirt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Size Types</p>
                    <p className="text-2xl font-bold">{sizeTypes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Table Card with Modern Design */}
          <Card className="overflow-hidden border-primary/10 shadow-xl">
            <CardHeader className="border-b bg-gradient-to-r from-muted/50 via-muted/30 to-background px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base font-medium">
                    Size List
                  </CardTitle>
                  <Badge variant="secondary" className="rounded-full px-3">
                    {filteredAndSortedSizes().length} items
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/30 text-left text-sm">
                      <th className="px-6 py-4 font-medium text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-transparent">
                              <Hash className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </th>
                      <th
                        className="cursor-pointer px-6 py-4 font-medium text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => handleSort("size")}
                      >
                        <div className="flex items-center gap-2">
                          Size
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer px-6 py-4 font-medium text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => handleSort("order")}
                      >
                        <div className="flex items-center gap-2">
                          Order
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      {measurementFields.primary.map((field) => (
                        <th key={field.key} className="px-6 py-4 font-medium text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <field.icon className="h-3 w-3" />
                            {field.label}
                          </div>
                        </th>
                      ))}
                      <th className="px-6 py-4 font-medium text-muted-foreground">
                        Types
                      </th>
                      <th className="px-6 py-4 font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedSizes().map((s, index) => (
                      <tr
                        key={s.id}
                        className={cn(
                          "group border-b last:border-0 transition-all duration-200 hover:bg-muted/50",
                          index % 2 === 0 ? "bg-background" : "bg-muted/20",
                        )}
                      >
                        <td className="px-6 py-4">
                          <Avatar className="h-8 w-8 border-2 border-primary/10 group-hover:border-primary/30 transition-colors">
                            <AvatarFallback className="bg-primary/5 text-xs">
                              {getInitials(s.size)}
                            </AvatarFallback>
                          </Avatar>
                        </td>
                        <td className="px-6 py-4 font-medium">{s.size}</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="font-mono bg-background/50">
                            {s.order ?? "—"}
                          </Badge>
                        </td>
                        {measurementFields.primary.map((field) => (
                          <td key={field.key} className="px-6 py-4">
                            {s[field.key as keyof ProductSize] ? (
                              <Badge variant="secondary" className="font-mono">
                                {s[field.key as keyof ProductSize]} cm
                              </Badge>
                            ) : (
                              "—"
                            )}
                          </td>
                        ))}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {s.sizeType && s.sizeType.length > 0 ? (
                              s.sizeType.map((type: string) => (
                                <Badge
                                  key={type}
                                  variant="outline"
                                  className="capitalize bg-primary/5 border-primary/20"
                                >
                                  {formatSizeType(type)}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEdit(s)}
                                  className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">Edit size</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(s.id)}
                                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">Delete size</TooltipContent>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredAndSortedSizes().length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="rounded-full bg-gradient-to-br from-muted to-muted/50 p-6 mb-4">
                    <Search className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-semibold">No sizes found</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    {query
                      ? "Try adjusting your search or clear filters"
                      : "Get started by creating your first size to manage your product measurements"}
                  </p>
                  {!query && (
                    <Button onClick={openCreate} className="mt-6 gap-2">
                      <Plus className="h-4 w-4" />
                      Add Size
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Modal with Modern Design */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent
            overlayClassName="lg:left-64 bg-black/50 backdrop-blur-sm"
            className="w-[calc(100vw-2rem)] lg:w-[calc(100vw-18rem)] max-w-[1400px] h-[90vh] overflow-hidden p-0 sm:max-w-[calc(100vw-2rem)] lg:left-[calc(50%+8rem)] lg:translate-x-[-50%] border-primary/20 shadow-2xl flex flex-col"
          >
            <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-secondary/5 overflow-hidden">
              <DialogHeader className="px-6 py-5 border-b bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {editing ? <Pencil className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-2xl font-serif">
                      {editing ? "Edit Size" : "Create Multiple Sizes"}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground/80">
                      {editing
                        ? "Update the size details below. Click save when you're done."
                        : "Add multiple sizes at once. Each card represents a separate size entry."}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Scrollable content area */}
              <div className="flex-1 overflow-hidden px-6 py-4 pb-8">
                <ScrollArea className="h-full">
                  <div className="space-y-6 pb-8">
                  {sizeEntries.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="group relative rounded-xl border border-primary/10 bg-gradient-to-br from-background via-background to-secondary/5 p-5 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {/* Entry Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-primary/20">
                            <AvatarFallback className="bg-primary/5 text-xs">
                              #{index + 1}
                            </AvatarFallback>
                          </Avatar>
                          <Badge variant="outline" className="border-primary/20 bg-primary/5">
                            Entry {index + 1}
                          </Badge>
                        </div>
                        {!editing && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => duplicateEntry(index)}
                                  className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Duplicate entry</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeEntry(entry.id)}
                                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Remove entry</TooltipContent>
                            </Tooltip>
                          </div>
                        )}
                      </div>

                      {/* Basic Info Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            Size *
                          </Label>
                          <Input
                            value={entry.size}
                            onChange={(e) => updateEntry(entry.id, "size", e.target.value)}
                            placeholder="e.g., S, M, L, XL"
                            className="h-10 bg-background/50 border-primary/20 focus:border-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            Order
                          </Label>
                          <Input
                            type="number"
                            value={entry.order}
                            onChange={(e) => updateEntry(entry.id, "order", e.target.value)}
                            placeholder="Display order"
                            className="h-10 bg-background/50 border-primary/20 focus:border-primary"
                          />
                        </div>
                        <div className="space-y-2 lg:col-span-2">
                          <Label className="text-xs font-medium flex items-center gap-1">
                            <Shirt className="h-3 w-3" />
                            Size Type
                          </Label>
                          <Popover
                            open={typePopoverOpen[entry.id]}
                            onOpenChange={(open) =>
                              setTypePopoverOpen((prev) => ({
                                ...prev,
                                [entry.id]: open,
                              }))
                            }
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full h-10 justify-between text-sm bg-background/50 border-primary/20 hover:bg-primary/5"
                              >
                                <span className="truncate">
                                  {entry.sizeType && entry.sizeType.length > 0
                                    ? formatSizeType(entry.sizeType[0])
                                    : "Select a size type..."}
                                </span>
                                <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Search types..." className="h-9" />
                                <CommandEmpty>No types found.</CommandEmpty>
                                <CommandGroup className="max-h-48 overflow-auto">
                                  {sizeTypes.map((type) => (
                                    <CommandItem
                                      key={type}
                                      value={type}
                                      onSelect={() => setSizeType(entry.id, type)}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-3 w-3",
                                          entry.sizeType?.[0] === type
                                            ? "opacity-100"
                                            : "opacity-0",
                                        )}
                                      />
                                      <span className="text-sm">{formatSizeType(type)}</span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      {/* Measurements Sections with Tabs */}
                      <Tabs defaultValue="primary" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
                          <TabsTrigger value="primary" className="text-xs">
                            Primary Measurements
                          </TabsTrigger>
                          <TabsTrigger value="secondary" className="text-xs">
                            Secondary
                          </TabsTrigger>
                          <TabsTrigger value="additional" className="text-xs">
                            Additional
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="primary" className="mt-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {measurementFields.primary.map((field) => (
                              <div key={field.key} className="space-y-2">
                                <Label className="text-xs font-medium flex items-center gap-1">
                                  <field.icon className="h-3 w-3" />
                                  {field.label}
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top">{field.tooltip}</TooltipContent>
                                  </Tooltip>
                                </Label>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    value={entry[field.key as keyof SizeFormEntry]}
                                    onChange={(e) =>
                                      updateEntry(entry.id, field.key as keyof SizeFormEntry, e.target.value)
                                    }
                                    placeholder="0"
                                    className="h-9 text-sm pr-7 bg-background/50 border-primary/20 focus:border-primary"
                                  />
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                    cm
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="secondary" className="mt-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {measurementFields.secondary.map((field) => (
                              <div key={field.key} className="space-y-2">
                                <Label className="text-xs font-medium flex items-center gap-1">
                                  <field.icon className="h-3 w-3" />
                                  {field.label}
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top">{field.tooltip}</TooltipContent>
                                  </Tooltip>
                                </Label>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    value={entry[field.key as keyof SizeFormEntry]}
                                    onChange={(e) =>
                                      updateEntry(entry.id, field.key as keyof SizeFormEntry, e.target.value)
                                    }
                                    placeholder="0"
                                    className="h-9 text-sm pr-7 bg-background/50 border-primary/20 focus:border-primary"
                                  />
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                    cm
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="additional" className="mt-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {measurementFields.additional.map((field) => (
                              <div key={field.key} className="space-y-2">
                                <Label className="text-xs font-medium flex items-center gap-1">
                                  <field.icon className="h-3 w-3" />
                                  {field.label}
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top">{field.tooltip}</TooltipContent>
                                  </Tooltip>
                                </Label>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    value={entry[field.key as keyof SizeFormEntry]}
                                    onChange={(e) =>
                                      updateEntry(entry.id, field.key as keyof SizeFormEntry, e.target.value)
                                    }
                                    placeholder="0"
                                    className="h-9 text-sm pr-7 bg-background/50 border-primary/20 focus:border-primary"
                                  />
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                    cm
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Add More Button */}
              {!editing && (
                <div className="px-6 py-3 border-t border-primary/10">
                  <Button
                    variant="outline"
                    onClick={addNewEntry}
                    className="w-full gap-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    Add Another Size
                  </Button>
                </div>
              )}

              <DialogFooter className="px-6 py-4 border-t bg-gradient-to-r from-muted/30 via-muted/20 to-background">
                <div className="flex items-center gap-2 mr-auto">
                  {!editing && sizeEntries.length > 0 && (
                    <Badge variant="secondary" className="px-3 py-1 rounded-full">
                      <Layers className="h-3 w-3 mr-1" />
                      {sizeEntries.length} size{sizeEntries.length > 1 ? "s" : ""} to create
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={loading}
                    className="border-primary/20 hover:bg-primary/5"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="gap-2 min-w-[120px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg"
                  >
                    {loading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        {editing ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {editing
                          ? "Update Size"
                          : `Create ${sizeEntries.length > 1 ? "All" : "Size"}`}
                      </>
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}