"use client";

import { useEffect, useState } from "react";
import { productService } from "@/lib/api/products";
import type { ProductSize } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export default function AdminSizesPage() {
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProductSize | null>(null);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({
    size: "",
    sizeDescription: "",
    order: "",
    length: "",
    chest: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await productService.getSizes();
      if (res && res.data) setSizes(res.data as ProductSize[]);
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
    setForm({ size: "", sizeDescription: "", order: "", length: "", chest: "" });
    setDialogOpen(true);
  };

  const openEdit = (s: ProductSize) => {
    setEditing(s);
    setForm({
      size: s.size,
      sizeDescription: s.sizeDescription || "",
      order: s.order !== undefined && s.order !== null ? String(s.order) : "",
      length:
        s.length !== undefined && s.length !== null ? String(s.length) : "",
      chest: s.chest !== undefined && s.chest !== null ? String(s.chest) : "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.size || form.size.trim().length === 0) {
      toast.error("Please provide a size");
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        size: form.size.trim(),
        sizeDescription: form.sizeDescription.trim(),
      };
      if (form.order && form.order.toString().trim().length > 0) {
        const parsed = Number(form.order);
        payload.order = Number.isNaN(parsed) ? 0 : parsed;
      }
      if (form.length && form.length.toString().trim().length > 0) {
        const parsed = Number(form.length);
        payload.length = Number.isNaN(parsed) ? 0 : parsed;
      }
      if (form.chest && form.chest.toString().trim().length > 0) {
        const parsed = Number(form.chest);
        payload.chest = Number.isNaN(parsed) ? 0 : parsed;
      }
      if (editing) {
        await productService.updateSize(editing.id as string, payload);
        toast.success("Size updated");
      } else {
        await productService.createSize(payload);
        toast.success("Size created");
      }
      setDialogOpen(false);
      await load();
    } catch (err) {
      toast.error("Failed to save size");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Delete this size?")) return;
    setLoading(true);
    try {
      await productService.deleteSize(id);
      toast.success("Size deleted");
      await load();
    } catch (err) {
      toast.error("Failed to delete size");
    } finally {
      setLoading(false);
    }
  };

  const filtered = sizes.filter((s) =>
    s.size.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">Product Sizes</h1>
          <p className="text-sm text-muted-foreground">
            Manage product sizes ({sizes.length})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search sizes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => setDialogOpen(o)}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" /> Add Size
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Size" : "Add Size"}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3 pt-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="size">Size</Label>
                  <Input
                    id="size"
                    value={form.size}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, size: e.target.value }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="sizeDescription">Description</Label>
                  <Input
                    id="sizeDescription"
                    value={form.sizeDescription}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        sizeDescription: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    value={(form as any).order || ""}
                    onChange={(e) =>
                      setForm((f: any) => ({ ...f, order: e.target.value }))
                    }
                    placeholder="0"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="length">Length</Label>
                  <Input
                    id="length"
                    value={(form as any).length || ""}
                    onChange={(e) =>
                      setForm((f: any) => ({ ...f, length: e.target.value }))
                    }
                    placeholder="0"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="chest">Chest</Label>
                  <Input
                    id="chest"
                    value={(form as any).chest || ""}
                    onChange={(e) =>
                      setForm((f: any) => ({ ...f, chest: e.target.value }))
                    }
                    placeholder="0"
                  />
                </div>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full"
                >
                  {loading
                    ? "Saving..."
                    : editing
                      ? "Update Size"
                      : "Create Size"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-4 font-medium text-muted-foreground">
                    Size
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    Order
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    Length
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    Chest
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    Description
                  </th>
                  <th className="p-4 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="p-4">{s.size}</td>
                    <td className="p-4">{s.order ?? ""}</td>
                    <td className="p-4">{s.length ?? ""}</td>
                    <td className="p-4">{s.chest ?? ""}</td>
                    <td className="p-4">{s.sizeDescription}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(s)}
                          aria-label={`Edit ${s.size}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(s.id)}
                          className="text-destructive hover:text-destructive"
                          aria-label={`Delete ${s.size}`}
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
              No sizes found.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
