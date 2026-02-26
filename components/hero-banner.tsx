"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useHeroBanners } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(0);
  const { data: bannersData } = useHeroBanners();

  // Normalize and memoize banners data
  const banners = useMemo(() => {
    if (!bannersData) return [];
    
    const normalizeBanners = (data: any): any[] => {
      if (Array.isArray(data)) return data;
      if (data?.items && Array.isArray(data.items)) return data.items;
      if (data?.data && Array.isArray(data.data)) return data.data;
      return [];
    };

    return normalizeBanners(bannersData)
      .map((b, idx) => ({
        id: b.id ?? b._id ?? b.slug ?? `banner-${idx}`,
        title: b.title ?? b.name ?? "",
        subtitle: b.subtitle ?? b.desc ?? b.description ?? "",
        image: b.image ?? b.img ?? b.imageUrl ?? "",
        ctaText: b.ctaText ?? b.cta ?? b.buttonText ?? "Learn More",
        ctaLink: b.ctaLink ?? b.ctaLinkUrl ?? b.link ?? "/",
        index: b.index ?? b.order ?? b.priority ?? 0,
        active: typeof b.active === "boolean" ? b.active : !!b.isActive || !!b.enabled,
      }))
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  }, [bannersData]);

  const activeBanners = banners;

  const next = useCallback(() => {
    if (activeBanners.length === 0) return;
    setDirection(1);
    setCurrent((prev) => (prev + 1) % activeBanners.length);
  }, [activeBanners.length]);

  const prev = useCallback(() => {
    if (activeBanners.length === 0) return;
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  }, [activeBanners.length]);

  const goToSlide = useCallback((index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  }, [current]);

  useEffect(() => {
    if (activeBanners.length === 0 || isHovered) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, activeBanners.length, isHovered]);

  if (activeBanners.length === 0) return null;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  return (
    <section 
      className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      aria-label="Hero banner"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-[55vh] sm:h-[70vh] min-h-[350px] sm:min-h-[600px] max-h-[900px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.4 },
            }}
            className="absolute inset-0"
          >
            {/* Background Image with Proper Object Fit */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="relative h-full w-full">
                <Image
                  src={activeBanners[current]?.image || "/images/placeholder.png"}
                  alt={activeBanners[current]?.title || "banner"}
                  fill
                  className="object-contain sm:object-cover object-center"
                  priority={current === 0}
                  sizes="100vw"
                  quality={85}
                />
                {/* Dynamic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            </div>

            {/* Animated Particles Effect */}
            <div className="absolute inset-0 opacity-30 hidden sm:block">
              <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            {/* Content */}
            <div className="absolute inset-0 flex items-start sm:items-center">
              <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="max-w-2xl pt-8 sm:pt-0"
                >
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4 sm:mb-6">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                    <span className="text-xs sm:text-sm font-medium text-white/90">
                      Featured Collection
                    </span>
                  </div>

                  {/* Title - Fixed Responsive Text */}
                  <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-3 sm:mb-4 text-balance leading-tight">
                    {activeBanners[current]?.title}
                  </h1>

                  {/* Subtitle - Fixed Responsive Text */}
                  <p className="text-base sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-8 max-w-xl text-balance">
                    {activeBanners[current]?.subtitle}
                  </p>

                  {/* CTA Button */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      className="relative group overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-600/25 text-sm sm:text-base px-6 sm:px-8 py-4 sm:py-6 h-auto"
                      asChild
                    >
                      <Link href={activeBanners[current]?.ctaLink}>
                        <span className="relative z-10 flex items-center gap-2">
                          {activeBanners[current]?.ctaText}
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-white/20 to-transparent transition-transform duration-500" />
                      </Link>
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows - Better positioned for mobile */}
        <button
          onClick={prev}
          className="absolute left-3 sm:left-4 top-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Previous banner"
        >
          <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
        </button>
        <button
          onClick={next}
          className="absolute right-3 sm:right-4 top-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Next banner"
        >
          <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
        </button>

        {/* Enhanced Dots - Better touch targets */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:gap-3">
          {activeBanners.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={cn(
                "group relative h-2 sm:h-3 rounded-full transition-all duration-300",
                i === current ? "w-8 sm:w-12" : "w-2 sm:w-3 hover:w-4 sm:hover:w-6"
              )}
              aria-label={`Go to slide ${i + 1}`}
            >
              <span
                className={cn(
                  "absolute inset-0 rounded-full transition-all duration-300",
                  i === current 
                    ? "bg-gradient-to-r from-purple-400 to-pink-400" 
                    : "bg-white/40 group-hover:bg-white/60"
                )}
              />
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <motion.div
            key={current}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 6, ease: "linear" }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 origin-left"
          />
        </div>
      </div>
    </section>
  );
}