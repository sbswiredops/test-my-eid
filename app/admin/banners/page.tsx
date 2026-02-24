"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { banners as staticBanners } from "@/lib/data"
import { useHeroBanners } from "@/hooks/use-api"
import api from "@/lib/api"
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
  // Tab state
  const [activeTab, setActiveTab] = useState("hero")

  // Banner APIs (stubbed, to be replaced with real hooks)
  const { data: heroBanners, mutate: mutateHero } = useHeroBanners()
  // TODO: Replace with real hooks for other banner types
  const { data: middleBanners, mutate: mutateMiddle } = { data: [], mutate: () => {} }
  const { data: bottomBanners, mutate: mutateBottom } = { data: [], mutate: () => {} }
  const { data: giveBanners, mutate: mutateGive } = { data: [], mutate: () => {} }

  const bannerLists = {
    hero: heroBanners || staticBanners,
    middle: middleBanners,
    bottom: bottomBanners,
    give: giveBanners,
  }

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    ctaText: "",
    ctaLink: "",
    active: true,
  })

  const resetForm = () => {
    setForm({
      title: "",
      subtitle: "",
      ctaText: "",
      ctaLink: "",
      active: true,
    })
    setEditingBanner(null)
    setSelectedFile(null)
  }

  const openEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setForm({
      title: banner.title,
      subtitle: banner.subtitle,
      ctaText: banner.ctaText,
      ctaLink: banner.ctaLink,
      active: banner.active,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.ctaLink) {
      toast.error("Please fill in required fields")
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("title", form.title)
      formData.append("subtitle", form.subtitle)
      formData.append("ctaText", form.ctaText)
      formData.append("ctaLink", form.ctaLink)
      formData.append("active", String(form.active))

      if (selectedFile) {
        formData.append("img", selectedFile)
      }

      if (editingBanner) {
        await api.banners.updateHeroBanner(editingBanner.id, formData)
        toast.success("Banner updated successfully")
      } else {
        await api.banners.createHeroBanner(formData)
        toast.success("Banner created successfully")
      }
      // TODO: Use correct mutate function based on activeTab
      mutateHero()
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      toast.error("Failed to save banner")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.banners.deleteHeroBanner(id)
      mutateHero()
      toast.success("Banner deleted")
    } catch (error) {
      toast.error("Failed to delete banner")
    }
  }

  const toggleActive = async (banner: Banner) => {
    try {
      const formData = new FormData()
      formData.append("active", String(!banner.active))
      await api.banners.updateHeroBanner(banner.id, formData)
      mutateHero()
      toast.success("Status updated")
    } catch {
      toast.error("Failed to update status")
    }
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
                
                <div className="flex flex-col gap-2">
                  <Label htmlFor="banner-image">Image</Label>
                  <Input
                    id="banner-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                  />
                  {/* TODO: Display image size here */}
                  <p className="text-xs text-muted-foreground">
                    Upload a high-quality banner image
                  </p>
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
              <Button onClick={handleSave} className="w-full" disabled={loading}>
                {loading ? "Saving..." : editingBanner ? "Update Banner" : "Create Banner"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs for banner types */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="hero">Hero Banner</TabsTrigger>
          <TabsTrigger value="middle">Middle Banner</TabsTrigger>
          <TabsTrigger value="bottom">Bottom Banner</TabsTrigger>
          <TabsTrigger value="give">Give Banner</TabsTrigger>
        </TabsList>
        {/* Banner grids for each tab */}
        {Object.entries(bannerLists).map(([type, banners]) => (
          <TabsContent key={type} value={type}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {banners.map((banner: Banner) => (
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
                        onCheckedChange={() => toggleActive(banner)}
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
            {banners.length === 0 && (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No banners yet. Add a banner to display on the homepage carousel.
              </p>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
