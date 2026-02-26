"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useHeroBanners } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const { data: bannersData } = useHeroBanners();

  // Normalize API shapes: array, { items: [] }, { data: [] }
  const banners = (() => {
    if (!bannersData) return [] as any[];
    if (Array.isArray(bannersData)) return bannersData as any[];
    if (
      typeof bannersData === "object" &&
      bannersData !== null &&
      "items" in bannersData &&
      Array.isArray((bannersData as any).items)
    )
      return (bannersData as any).items as any[];
    if (
      typeof bannersData === "object" &&
      bannersData !== null &&
      "data" in bannersData &&
      Array.isArray((bannersData as any).data)
    )
      return (bannersData as any).data as any[];
    return [] as any[];
  })()
    // map common field names to expected ones
    .map((b, idx) => ({
      id: b.id ?? b._id ?? b.slug ?? `banner-${idx}`,
      title: b.title ?? b.name ?? "",
      subtitle: b.subtitle ?? b.desc ?? b.description ?? "",
      image: b.image ?? b.img ?? b.imageUrl ?? "",
      ctaText: b.ctaText ?? b.cta ?? b.buttonText ?? "",
      ctaLink: b.ctaLink ?? b.ctaLinkUrl ?? b.link ?? "/",
      index: b.index ?? b.order ?? b.priority ?? 0,
      active:
        typeof b.active === "boolean" ? b.active : !!b.isActive || !!b.enabled,
    }))
    // sort by index if provided
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  const activeBanners = banners; // show all returned banners

  const next = useCallback(() => {
    if (activeBanners.length === 0) return;
    setCurrent((prev) => (prev + 1) % activeBanners.length);
  }, [activeBanners.length]);

  const prev = useCallback(() => {
    if (activeBanners.length === 0) return;
    setCurrent(
      (prev) => (prev - 1 + activeBanners.length) % activeBanners.length,
    );
  }, [activeBanners.length]);

  useEffect(() => {
    if (activeBanners.length === 0) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, activeBanners.length]);

  // If there are no banners, don't render
  if (activeBanners.length === 0) return null;

  return (
    <section className="relative overflow-hidden" aria-label="Hero banner">
      <div className="relative h-100 sm:h-125 lg:h-140">
        {activeBanners.map((banner, i) => (
          <div
            key={banner.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              i === current ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="mx-auto w-full max-w-7xl px-4">
                <div className="max-w-lg">
                  <h1 className="font-serif text-3xl font-bold text-white sm:text-4xl lg:text-5xl text-balance">
                    {banner.title}
                  </h1>
                  <p className="mt-3 text-sm text-white/90 sm:text-base">
                    {banner.subtitle}
                  </p>
                  <Button
                    size="lg"
                    className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90"
                    asChild
                  >
                    <Link href={banner.ctaLink}>{banner.ctaText}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
        aria-label="Previous banner"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/40"
        aria-label="Next banner"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {activeBanners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              "h-2 rounded-full transition-all",
              i === current ? "w-6 bg-white" : "w-2 bg-white/50",
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
