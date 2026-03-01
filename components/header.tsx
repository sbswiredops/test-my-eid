"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShoppingBag, 
  User, 
  Menu, 
  Search, 
  X, 
  ChevronDown,
  Heart,
  Sparkles,
  Moon,
  Sun,
  Home,
  Store,
  Sparkle,
  Tag,
  Scissors,
  Shirt,
  Handbag,
  Footprints,
  Flower2,
  Package,
  LayoutDashboard,
  LogOut,
  Star,
  Gift,
  Bell,
  Settings,
  ShoppingCart,
  Truck,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-store";
import { useCategories } from "@/hooks/use-api";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { CartSheet } from "@/components/cart-sheet";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: Store },
  { href: "/new-arrivals", label: "New", icon: Sparkle, badge: "HOT" },
];

const categoryIcons: Record<string, React.ElementType> = {
  "unstitched": Scissors,
  "ready-to-wear": Shirt,
  "accessories": Handbag,
  "footwear": Footprints,
  "fragrances": Flower2,
  "bags": Handbag,
  "jewelry": Star,
  "gifts": Gift,
};

export function Header() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const { data: categoriesData } = useCategories();
  const categories = categoriesData || [];
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle dark mode (you'll need to implement actual theme switching)
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          isScrolled
            ? "bg-background/95 backdrop-blur-md shadow-lg"
            : "bg-background/80 backdrop-blur-sm",
          "border-b border-border/40"
        )}
      >
        {/* Top announcement bar with animation */}
        <AnimatePresence>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-linear-to-r from-primary via-primary/90 to-primary text-primary-foreground overflow-hidden"
          >
            <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
              <p className="text-xs font-medium tracking-wide sm:text-sm">
                🎉 Free Delivery on Orders Above BDT. 5,000 — Eid Mubarak! 
                <Sparkle className="ml-2 h-3 w-3 inline-block animate-bounce" />
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          {/* Mobile menu trigger with animation */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="Open menu"
                className="hover:bg-primary/10 hover:text-primary transition-all"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="p-6 border-b bg-linear-to-r from-primary/5 to-transparent">
                <SheetTitle className="font-serif text-xl flex items-center gap-2">
                  {!logoError ? (
                    <img
                      src="/logo.jpeg"
                      alt="Eid Collection"
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      EC
                    </div>
                  )}
                  <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Eid Collection
                  </span>
                </SheetTitle>
              </SheetHeader>
              
              <nav className="flex flex-col p-4">
                {/* Quick Links */}
                <div className="space-y-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all",
                          "hover:bg-primary/10 hover:text-primary hover:pl-4",
                          pathname === link.href
                            ? "bg-primary/15 text-primary border-l-2 border-primary"
                            : "text-foreground"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {link.label}
                        {link.badge && (
                          <Badge variant="secondary" className="ml-auto text-[10px]">
                            {link.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>

                <div className="my-4 border-t border-border" />

                {/* Categories with icons */}
                <div className="space-y-1">
                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Package className="h-3 w-3" />
                    Shop by Category
                  </p>
                  {categories.map((cat) => {
                    const CategoryIcon = categoryIcons[cat.slug] || Package;
                    return (
                      <Link
                        key={cat.slug}
                        href={`/shop?category=${cat.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-all hover:bg-accent/20 hover:pl-4"
                      >
                        <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                        {cat.name}
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo with hover effect */}
          <Link href="/" className="group flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              {!logoError ? (
                <img
                  src="/logo.jpeg"
                  alt="Eid Collection"
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20 transition-all group-hover:ring-primary/40"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/80 text-primary-foreground font-bold shadow-lg">
                  EC
                </div>
              )}
            </motion.div>
            <motion.span 
              className="hidden font-serif text-xl font-bold tracking-tight sm:block bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
              whileHover={{ x: 2 }}
            >
              EID COLLECTION
            </motion.span>
          </Link>

          {/* Desktop nav with enhanced styling */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative rounded-md px-4 py-2 text-sm font-medium transition-all",
                    "hover:bg-primary/10 hover:text-primary",
                    pathname === link.href
                      ? "text-primary after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-4 after:-translate-x-1/2 after:bg-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <Icon className="h-4 w-4" />
                    {link.label}
                    {link.badge && (
                      <Badge variant="secondary" className="ml-1 text-[8px] px-1">
                        {link.badge}
                      </Badge>
                    )}
                  </span>
                </Link>
              );
            })}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
                >
                  <Package className="h-4 w-4" />
                  Categories
                  <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 p-2">
                {categories.map((cat) => {
                  const CategoryIcon = categoryIcons[cat.slug] || Package;
                  return (
                    <DropdownMenuItem key={cat.slug} asChild>
                      <Link 
                        href={`/shop?category=${cat.slug}`}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <CategoryIcon className="h-4 w-4" />
                        {cat.name}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Actions with enhanced styling */}
          <div className="flex items-center gap-1">
            {/* Search button with animation */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Search products"
                className="relative hover:bg-primary/10 hover:text-primary"
                onClick={() => setShowSearch(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* Wishlist */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Wishlist"
                className="hidden sm:flex hover:bg-primary/10 hover:text-primary"
              >
                <Heart className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* Cart with animation */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-primary/10 hover:text-primary"
                aria-label="Shopping cart"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Badge className="flex h-5 w-5 items-center justify-center rounded-full bg-primary p-0 text-[10px] text-primary-foreground">
                      {itemCount}
                    </Badge>
                  </motion.div>
                )}
              </Button>
            </motion.div>

            {/* User menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      aria-label="Account menu"
                      className="hover:bg-primary/10 hover:text-primary"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2">
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {(user.role === "ADMIN" || user.email === "mridoy031@gmail.com") && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="cursor-pointer flex items-center gap-2">
                      <User className="h-4 w-4" />
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account?tab=orders" className="cursor-pointer flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist" className="cursor-pointer flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Wishlist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/account/login">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    aria-label="Sign in"
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
            )}

            {/* Dark mode toggle */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle theme"
                className="hidden md:flex hover:bg-primary/10 hover:text-primary"
                onClick={toggleDarkMode}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Search overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowSearch(false)}
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="container mx-auto max-w-2xl px-4 pt-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full rounded-lg border border-border bg-background py-4 pl-10 pr-12 text-lg outline-none ring-primary/20 focus:ring-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowSearch(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              {/* Quick suggestions */}
              <div className="mt-4 flex flex-wrap gap-2">
                {["Eid dresses", "Unstitched", "Ready to wear", "Sale"].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      setSearchQuery(suggestion);
                      // Handle search
                    }}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {suggestion}
                  </Button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}