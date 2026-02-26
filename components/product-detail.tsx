"use client"

import { useState, useEffect } from "react"
import type { Product, ProductSize } from "@/lib/types"
import { productService } from "@/lib/api/products"
import { formatPrice } from "@/lib/data"
import { useCart } from "@/lib/cart-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Minus, 
  Plus, 
  ShoppingBag, 
  Check, 
  Truck, 
  MessageSquare, 
  CreditCard,
  Heart,
  Share2,
  Shield,
  RotateCcw,
  Star,
  ChevronRight,
  Package,
  Clock,
  Sparkles
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const { addItem } = useCart()
  const [sizeGuide, setSizeGuide] = useState<ProductSize[]>([])
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  useEffect(() => {
    let mounted = true
    const fetchSizes = async () => {
      try {
        const res = await productService.getSizes()
        const raw = res?.data
        const arr = Array.isArray(raw) ? raw : raw?.items || []
        if (mounted) setSizeGuide(arr as ProductSize[])
      } catch (err) {
        // fail silently
      }
    }
    fetchSizes()
    return () => {
      mounted = false
    }
  }, [])

  // Normalize category and sizes to strings to match UI expectations
  const categoryText = product.categories && product.categories.length > 0
    ? (product.categories[0].slug || product.categories[0].name || "").replace(/-/g, " ")
    : "Uncategorized"

  const sizes = (product.sizes || []).map((s: any) => (typeof s === "string" ? s : s.size))

  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.originalPrice! - product.price) / product.originalPrice!) *
          100
      )
    : 0

  // `stock` is number when known, `null` when stock info is not provided for sizes
  const stock = selectedSize
    ? product.stockPerSize
      ? (product.stockPerSize[selectedSize] ?? 0)
      : null
    : 0

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error("Please select a size")
      return
    }
    setIsAddingToCart(true)
    try {
      await addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        size: selectedSize,
        quantity,
        image: product.images?.[0] || '/images/placeholder.png',
        slug: product.slug,
      })
      toast.success(`${product.name} added to cart`, {
        description: `Size: ${selectedSize}, Qty: ${quantity}`,
        icon: <ShoppingBag className="h-4 w-4" />,
      })
      
      // Reset quantity after successful add
      setQuantity(1)
      setSelectedSize(null)
    } catch (err) {
      toast.error("Failed to add to cart")
    } finally {
      setIsAddingToCart(false)
    }
  }

  const router = useRouter()

  const handleBuyWhatsApp = () => {
    if (!selectedSize) {
      toast.error("Please select a size")
      return
    }
    const msg = `Hi, I'd like to buy ${product.name} - Size: ${selectedSize}, Qty: ${quantity}`
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`
    window.open(url, "_blank")
  }

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast.error("Please select a size")
      return
    }
    // For Buy Now, don't add to global cart. Save a temporary buy-now item and navigate to checkout.
    const item = {
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity,
      image: product.images?.[0] || '/images/placeholder.png',
      slug: product.slug,
    }
    try {
      sessionStorage.setItem('eid-buy-now', JSON.stringify(item))
    } catch (e) {
      // ignore
    }
    router.push('/checkout?buyNow=1')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        })
      } catch (err) {
        // User cancelled share
      }
    } else {
      // Fallback to copy link
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard!")
    }
  }

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="flex flex-col gap-8 lg:flex-row lg:gap-12"
    >
      {/* Image Gallery */}
      <motion.div 
        variants={fadeInUp}
        className="lg:w-1/2 space-y-4"
      >
        {/* Main Image */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gradient-to-br from-muted/50 to-muted group">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeImage}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative h-full w-full"
            >
              <Image
                src={product.images && product.images.length > 0 
                  ? product.images[activeImage] 
                  : '/images/placeholder.png'
                }
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </motion.div>
          </AnimatePresence>
          
          {/* Discount Badge */}
          {hasDiscount && (
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute top-4 left-4 z-10"
            >
              <Badge className="bg-destructive text-destructive-foreground text-sm px-3 py-1 shadow-lg">
                -{discountPercent}% OFF
              </Badge>
            </motion.div>
          )}

          {/* Wishlist Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors shadow-lg"
          >
            <Heart 
              className={cn(
                "h-5 w-5 transition-colors",
                isWishlisted ? "fill-destructive text-destructive" : "text-foreground"
              )} 
            />
          </motion.button>

          {/* Share Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="absolute top-4 right-16 z-10 p-2.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors shadow-lg"
          >
            <Share2 className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Thumbnail Gallery */}
        {product.images && product.images.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {product.images.map((image, index) => (
              <motion.button
                key={index}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveImage(index)}
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                  activeImage === index 
                    ? "border-primary ring-2 ring-primary/20" 
                    : "border-transparent hover:border-primary/50"
                )}
              >
                <Image
                  src={image}
                  alt={`${product.name} - View ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 20vw, 10vw"
                />
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Details */}
      <motion.div 
        variants={fadeInUp}
        className="flex flex-col lg:w-1/2 space-y-6"
      >
        {/* Breadcrumb-like category */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors">
            Products
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-primary font-medium capitalize">
            {categoryText}
          </span>
        </div>

        {/* Title and Rating */}
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl text-balance">
            {product.name}
          </h1>
          
          {/* Rating Placeholder - Replace with actual rating */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className="h-4 w-4 fill-yellow-400 text-yellow-400" 
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              (4.8) · 128 reviews
            </span>
          </div>
        </div>

        {/* Price */}
        <motion.div 
          variants={fadeInUp}
          className="flex items-center gap-3"
        >
          <span className="text-3xl font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.originalPrice!)}
              </span>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                Save {formatPrice(product.originalPrice! - product.price)}
              </Badge>
            </>
          )}
        </motion.div>

        {/* Short Description */}
        <p className="text-muted-foreground leading-relaxed">
          {product.description?.substring(0, 150)}
          {product.description?.length > 150 && "..."}
        </p>

        <Separator className="my-2" />

        {/* Size selector */}
        <motion.div variants={fadeInUp}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              Select Size
            </span>
            <AnimatePresence mode="wait">
              {selectedSize && (
                <motion.span
                  key="stock"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    stock === null ? "bg-muted text-muted-foreground" :
                    stock > 0 ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"
                  )}
                >
                  {stock === null
                    ? "Stock available"
                    : stock > 0
                      ? `${stock} in stock`
                      : "Out of stock"}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {sizes.map((size, index) => {
              const sizeStock = product.stockPerSize ? (product.stockPerSize[size] ?? 0) : null
              return (
                <motion.button
                  key={size}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedSize(size)
                    setQuantity(1)
                  }}
                  disabled={sizeStock === 0}
                  className={cn(
                    "relative rounded-lg border px-5 py-3 text-sm font-medium transition-all min-w-[60px]",
                    selectedSize === size
                      ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : sizeStock === 0
                        ? "border-border bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                        : "border-border bg-card text-foreground hover:border-primary/60 hover:shadow-md"
                  )}
                >
                  {size}
                  {sizeStock === 0 && (
                    <span className="absolute -top-2 -right-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                      </span>
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Quantity */}
        <motion.div variants={fadeInUp}>
          <span className="mb-3 block text-sm font-semibold text-foreground">
            Quantity
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-border bg-card">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-12 w-12 items-center justify-center text-foreground transition-colors hover:bg-muted rounded-l-lg"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </motion.button>
              <span className="flex h-12 w-16 items-center justify-center border-x border-border text-sm font-medium">
                {quantity}
              </span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setQuantity(Math.min(stock || 10, quantity + 1))}
                className="flex h-12 w-12 items-center justify-center text-foreground transition-colors hover:bg-muted rounded-r-lg"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </motion.button>
            </div>
            
            {/* Stock indicator */}
            {selectedSize && stock !== null && stock <= 5 && stock > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg"
              >
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium">Only {stock} left</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          variants={fadeInUp}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <Button
            variant="outline"
            size="lg"
            className="w-full h-14 border-2 hover:bg-green-50 hover:border-green-500 hover:text-green-700 transition-all"
            onClick={handleBuyWhatsApp}
            disabled={!selectedSize}
          >
            <MessageSquare className="mr-2 h-5 w-5" /> 
            <span className="hidden sm:inline">WhatsApp</span>
            <span className="sm:hidden">WhatsApp</span>
          </Button>
          
          <Button
            size="lg"
            className="w-full h-14 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all"
            onClick={handleBuyNow}
            disabled={!selectedSize || stock === 0}
          >
            <CreditCard className="mr-2 h-5 w-5" /> 
            <span className="hidden sm:inline">Buy Now</span>
            <span className="sm:hidden">Buy</span>
          </Button>
          
          <Button
            size="lg"
            variant="secondary"
            className="w-full h-14 bg-secondary hover:bg-secondary/80 shadow-lg transition-all"
            onClick={handleAddToCart}
            disabled={!selectedSize || stock === 0 || isAddingToCart}
          >
            {isAddingToCart ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Package className="h-5 w-5" />
              </motion.div>
            ) : (
              <ShoppingBag className="mr-2 h-5 w-5" />
            )}
            <span className="hidden sm:inline">
              {isAddingToCart ? "Adding..." : "Add to Cart"}
            </span>
            <span className="sm:hidden">Cart</span>
          </Button>
        </motion.div>

        {/* Shipping & Returns */}
        <motion.div 
          variants={fadeInUp}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4 hover:bg-muted/70 transition-colors">
            <div className="p-2 rounded-full bg-primary/10">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Free Delivery</p>
              <p className="text-xs text-muted-foreground">On orders above Rs. 5,000</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4 hover:bg-muted/70 transition-colors">
            <div className="p-2 rounded-full bg-primary/10">
              <RotateCcw className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Easy Returns</p>
              <p className="text-xs text-muted-foreground">30-day return policy</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4 hover:bg-muted/70 transition-colors">
            <div className="p-2 rounded-full bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Secure Payment</p>
              <p className="text-xs text-muted-foreground">100% secure transactions</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4 hover:bg-muted/70 transition-colors">
            <div className="p-2 rounded-full bg-primary/10">
              <Check className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Cash on Delivery</p>
              <p className="text-xs text-muted-foreground">Available in your area</p>
            </div>
          </div>
        </motion.div>

        <Separator className="my-2" />

        {/* Tabs */}
        <motion.div variants={fadeInUp}>
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full grid grid-cols-2 h-12">
              <TabsTrigger value="description" className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Description
              </TabsTrigger>
              <TabsTrigger value="size-guide" className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Size Guide
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
                
                {/* Features */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Key Features
                  </h4>
                  <ul className="grid grid-cols-2 gap-2">
                    <li className="text-xs text-muted-foreground flex items-center gap-1">
                      <Check className="h-3 w-3 text-primary" /> Premium Quality
                    </li>
                    <li className="text-xs text-muted-foreground flex items-center gap-1">
                      <Check className="h-3 w-3 text-primary" /> Comfort Fit
                    </li>
                    <li className="text-xs text-muted-foreground flex items-center gap-1">
                      <Check className="h-3 w-3 text-primary" /> Durable Fabric
                    </li>
                    <li className="text-xs text-muted-foreground flex items-center gap-1">
                      <Check className="h-3 w-3 text-primary" /> Easy Care
                    </li>
                  </ul>
                </div>

                {/* Tags */}
                {(product.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {(product.tags || []).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs px-3 py-1">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </motion.div>
            </TabsContent>
            
            <TabsContent value="size-guide" className="mt-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-foreground">Size</th>
                        <th className="px-4 py-3 text-left font-medium text-foreground">Chest (inches)</th>
                        <th className="px-4 py-3 text-left font-medium text-foreground">Length (inches)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {sizeGuide && sizeGuide.length > 0 ? (
                        sizeGuide.map((s, index) => (
                          <motion.tr 
                            key={s.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-4 py-3 font-medium">{s.size}</td>
                            <td className="px-4 py-3 text-muted-foreground">{s.chest ? `${s.chest}"` : "-"}</td>
                            <td className="px-4 py-3 text-muted-foreground">{s.length ? `${s.length}"` : "-"}</td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-4 py-8 text-center text-muted-foreground" colSpan={3}>
                            No size guide available for this product.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Size Guide Note */}
                <p className="text-xs text-muted-foreground mt-3">
                  * Measurements may vary slightly between different styles and fabrics.
                </p>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}