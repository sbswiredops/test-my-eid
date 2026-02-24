"use client"

import { useState } from "react"
import { banners as initialBanners } from "@/lib/data"
import type { Banner } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2 } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

export default function AdminBanners() {
  const [bannerList, setBannerList] = useState<Banner[]>(initialBanners)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    ctaText: "",
    ctaLink: "",
    image: "/images/banner-1.jpg",
    active: true,
  })

  const resetForm = () => {
    setForm({
      title: "",
      subtitle: "",
      ctaText: "",
      ctaLink: "",
      image: "/images/banner-1.jpg",
      active: true,
    })
    setEditingBanner(null)
  }

  const openEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setForm({
      title: banner.title,
      subtitle: banner.subtitle,
      ctaText: banner.ctaText,
      ctaLink: banner.ctaLink,
      image: banner.image,
      active: banner.active,
    })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.title || !form.ctaLink) {
      toast.error("Please fill in required fields")
      return
    }

    if (editingBanner) {
      setBannerList((prev) =>
        prev.map((b) =>
          b.id === editingBanner.id ? { ...b, ...form } : b
        )
      )
      toast.success("Banner updated successfully")
    } else {
      const newBanner: Banner = {
        id: `banner-${Date.now()}`,
        ...form,
      }
      setBannerList((prev) => [...prev, newBanner])
      toast.success("Banner created successfully")
    }

    setDialogOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    setBannerList((prev) => prev.filter((b) => b.id !== id))
    toast.success("Banner deleted")
  }

  const toggleActive = (id: string) => {
    setBannerList((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Banners
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage homepage carousel banners
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
              Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif">
                {editingBanner ? "Edit Banner" : "Add New Banner"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="banner-title">Title *</Label>
                <Input
                  id="banner-title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="Banner headline"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="banner-subtitle">Subtitle</Label>
                <Input
                  id="banner-subtitle"
                  value={form.subtitle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, subtitle: e.target.value }))
                  }
                  placeholder="Supporting text"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="banner-cta">CTA Text</Label>
                  <Input
                    id="banner-cta"
                    value={form.ctaText}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, ctaText: e.target.value }))
                    }
                    placeholder="Shop Now"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="banner-link">CTA Link *</Label>
                  <Input
                    id="banner-link"
                    value={form.ctaLink}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, ctaLink: e.target.value }))
                    }
                    placeholder="/shop"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="banner-active"
                  checked={form.active}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, active: checked }))
                  }
                />
                <Label htmlFor="banner-active">Active</Label>
              </div>
              <Button onClick={handleSave} className="w-full">
                {editingBanner ? "Update Banner" : "Create Banner"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Banners Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bannerList.map((banner) => (
          <Card key={banner.id} className="overflow-hidden">
            <div className="relative aspect-video">
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-cover"
              />
              <div className="absolute right-2 top-2">
                <Badge
                  variant="secondary"
                  className={
                    banner.active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {banner.active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <CardContent className="flex flex-col gap-2 p-4">
              <h3 className="font-serif font-semibold text-foreground">
                {banner.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {banner.subtitle}
              </p>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={banner.active}
                  onCheckedChange={() => toggleActive(banner.id)}
                  aria-label={`Toggle ${banner.title}`}
                />
                <div className="flex-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(banner)}
                  aria-label={`Edit ${banner.title}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(banner.id)}
                  aria-label={`Delete ${banner.title}`}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {bannerList.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No banners yet. Add a banner to display on the homepage carousel.
        </p>
      )}
    </div>
  )
}
