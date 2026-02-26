"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useHeroBanners,
  useMiddleBanners,
  useBottomBanners,
  useGiveBanners,
} from "@/hooks/use-api";
import { bannerService } from "@/lib/api/banners";
import type { Banner } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function AdminBanners() {
  // Tab state
  const [activeTab, setActiveTab] = useState("hero");

  // Banner APIs (stubbed, to be replaced with real hooks)
  const { data: heroBanners, mutate: mutateHero } = useHeroBanners();
  const heroList = Array.isArray(heroBanners)
    ? heroBanners
    : heroBanners && Array.isArray((heroBanners as { data?: Banner[] })?.data)
      ? (heroBanners as { data: Banner[] }).data
      : null;
  const { data: middleBanners, mutate: mutateMiddle } = useMiddleBanners();
  const middleList = Array.isArray(middleBanners)
    ? middleBanners
    : middleBanners &&
        Array.isArray((middleBanners as { data?: Banner[] })?.data)
      ? (middleBanners as { data: Banner[] }).data
      : null;

  const { data: bottomBanners, mutate: mutateBottom } = useBottomBanners();
  const bottomList = Array.isArray(bottomBanners)
    ? bottomBanners
    : bottomBanners &&
        Array.isArray((bottomBanners as { data?: Banner[] })?.data)
      ? (bottomBanners as { data: Banner[] }).data
      : null;

  const { data: giveBanners, mutate: mutateGive } = useGiveBanners();
  const giveList = Array.isArray(giveBanners)
    ? giveBanners
    : giveBanners && Array.isArray((giveBanners as { data?: Banner[] })?.data)
      ? (giveBanners as { data: Banner[] }).data
      : null;

  const normalize = (item: any) => ({ ...item, image: item.image || item.img });

  // Ensure each list is always an array to simplify rendering and improve
  // responsiveness on small screens (avoid rendering null/objects)
  const bannerLists = {
    hero: Array.isArray(heroList) ? heroList.map(normalize) : [],
    middle: Array.isArray(middleList) ? middleList.map(normalize) : [],
    bottom: Array.isArray(bottomList) ? bottomList.map(normalize) : [],
    give: Array.isArray(giveList) ? giveList.map(normalize) : [],
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState<Record<string, boolean>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    ctaText: "",
    ctaLink: "",
    index: "",
    active: true,
  });

  const resetForm = () => {
    setForm({
      title: "",
      subtitle: "",
      ctaText: "",
      ctaLink: "",
      index: "",
      active: true,
    });
    setEditingBanner(null);
    setSelectedFile(null);
  };

  const openEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle,
      ctaText: banner.ctaText,
      ctaLink: banner.ctaLink,
      index: banner.index?.toString() || "",
      active: banner.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.ctaLink) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("subtitle", form.subtitle);
      formData.append("ctaText", form.ctaText);
      formData.append("ctaLink", form.ctaLink);
      formData.append("index", form.index);
      formData.append("active", String(form.active));

      if (selectedFile) {
        // Some backends validate a body 'img' field; include filename text plus file
        formData.append("img", selectedFile.name);
        formData.append("img", selectedFile);
      }

      // Per-banner-type API
      let createFn, updateFn, mutateFn;
      if (activeTab === "hero") {
        createFn = bannerService.createHeroBanner;
        updateFn = bannerService.updateHeroBanner;
        mutateFn = mutateHero;
      } else if (activeTab === "middle") {
        createFn = bannerService.createMiddleBanner;
        updateFn = bannerService.updateMiddleBanner;
        mutateFn = mutateMiddle;
      } else if (activeTab === "bottom") {
        createFn = bannerService.createBottomBanner;
        updateFn = bannerService.updateBottomBanner;
        mutateFn = mutateBottom;
      } else if (activeTab === "give") {
        createFn = bannerService.createGiveBanner;
        updateFn = bannerService.updateGiveBanner;
        mutateFn = mutateGive;
      }

      if (editingBanner) {
        if (updateFn) {
          await updateFn(editingBanner.id, formData);
          toast.success("Banner updated successfully");
        } else {
          toast.error("Update function is not defined");
        }
      } else {
        if (createFn) {
          await createFn(formData);
          toast.success("Banner created successfully");
        } else {
          toast.error("Create function is not defined");
        }
      }
      if (mutateFn) mutateFn();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to save banner");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      let deleteFn, mutateFn;
      if (activeTab === "hero") {
        deleteFn = bannerService.deleteHeroBanner;
        mutateFn = mutateHero;
      } else if (activeTab === "middle") {
        deleteFn = bannerService.deleteMiddleBanner;
        mutateFn = mutateMiddle;
      } else if (activeTab === "bottom") {
        deleteFn = bannerService.deleteBottomBanner;
        mutateFn = mutateBottom;
      } else if (activeTab === "give") {
        deleteFn = bannerService.deleteGiveBanner;
        mutateFn = mutateGive;
      }
      if (deleteFn) {
        await deleteFn(id);
        if (mutateFn) mutateFn();
        toast.success("Banner deleted");
      } else {
        toast.error("Delete function is not defined");
      }
    } catch (error) {
      toast.error("Failed to delete banner");
    }
  };

  const toggleActive = async (banner: Banner) => {
    const id = banner.id;
    const newActive = !banner.active;
    let toggleFn: ((id: string, active: boolean) => Promise<any>) | undefined;
    let mutateFn:
      | ((data?: any, shouldRevalidate?: boolean) => Promise<any>)
      | undefined;

    if (activeTab === "hero") {
      toggleFn = bannerService.setHeroBannerActive;
      mutateFn = mutateHero;
    } else if (activeTab === "middle") {
      toggleFn = bannerService.setMiddleBannerActive;
      mutateFn = mutateMiddle;
    } else if (activeTab === "bottom") {
      toggleFn = bannerService.setBottomBannerActive;
      mutateFn = mutateBottom;
    } else if (activeTab === "give") {
      toggleFn = bannerService.setGiveBannerActive;
      mutateFn = mutateGive;
    }

    if (!toggleFn || !mutateFn) {
      toast.error("Toggle function is not defined");
      return;
    }

    // optimistic UI: set toggling state and update local cache
    setToggling((s) => ({ ...s, [id]: true }));

    // capture previous snapshot (for revert)
    let previous: any = undefined;
    try {
      previous = await mutateFn();
    } catch {
      previous = undefined;
    }

    // Apply optimistic update (without revalidation)
    await mutateFn((curr: any) => {
      if (!curr) return curr;
      return Array.isArray(curr)
        ? curr.map((b: Banner) =>
            b.id === id ? { ...b, active: newActive } : b,
          )
        : curr;
    }, false as any);

    try {
      await toggleFn(id, newActive);
      // revalidate to get authoritative data
      await mutateFn();
      toast.success("Status updated");
    } catch (err) {
      // revert optimistic change
      if (previous !== undefined) {
        await mutateFn(previous, false as any);
      }
      toast.error("Failed to update status");
    } finally {
      setToggling((s) => {
        const copy = { ...s };
        delete copy[id];
        return copy;
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 overflow-x-hidden min-w-0">
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
            setDialogOpen(open);
            if (!open) resetForm();
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
                  <Label htmlFor="banner-index">Index</Label>
                  <Input
                    id="banner-index"
                    type="number"
                    value={form.index}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, index: e.target.value }))
                    }
                    placeholder="Banner order/index"
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
              <Button
                onClick={handleSave}
                className="w-full"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : editingBanner
                    ? "Update Banner"
                    : "Create Banner"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs for banner types */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-4 sm:px-0 overflow-x-auto max-w-full">
          <TabsList className="flex gap-2 whitespace-nowrap min-w-0">
            <TabsTrigger value="hero">Hero Banner</TabsTrigger>
            <TabsTrigger value="middle">Middle Banner</TabsTrigger>
            <TabsTrigger value="bottom">Bottom Banner</TabsTrigger>
            <TabsTrigger value="give">Give Banner</TabsTrigger>
          </TabsList>
        </div>
        {/* Banner grids for each tab */}
        {Object.entries(bannerLists).map(([type, banners]) => (
          <TabsContent key={type} value={type}>
            <div className="px-4 sm:px-0">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
                {banners.map((banner: Banner) => (
                  <Card
                    key={banner.id}
                    className="overflow-hidden min-w-0 w-full"
                  >
                    <div className="relative aspect-video overflow-hidden max-w-full min-w-0">
                      <Image
                        src={banner.image}
                        alt={banner.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover w-full h-full max-w-full min-w-0"
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
                    <CardContent className="flex flex-col gap-2 p-4 min-w-0">
                      <h3 className="font-serif font-semibold text-foreground">
                        {banner.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {banner.subtitle}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={banner.active}
                            onCheckedChange={() => toggleActive(banner)}
                            aria-label={`Toggle ${banner.title}`}
                            disabled={!!toggling[banner.id]}
                          />
                        </div>

                        <div className="ml-auto flex w-full justify-end gap-2 sm:w-auto">
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {Array.isArray(banners) && banners.length === 0 && (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No banners yet. Add a banner to display on the homepage
                  carousel.
                </p>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
