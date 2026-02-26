"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Image as ImageIcon,
  ArrowLeft,
  Menu,
  X,
  ShoppingBag,
  List,
  FileText,
  Home,
  Users,
  ChevronRight,
  Layers,
  Tag,
  HelpCircle,
  Grid,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// নেভিগেশন আইটেমগুলো ক্যাটাগরি অনুযায়ী সাজানো
const navCategories = [
  {
    name: "Main",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    ]
  },
  {
    name: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: Layers },
      { href: "/admin/sizes", label: "Sizes", icon: Tag },
    ]
  },
  {
    name: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { href: "/admin/cart", label: "Cart", icon: ShoppingBag },
    ]
  },
  {
    name: "Content",
    items: [
      { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
      { href: "/admin/banners", label: "Banners", icon: ImageIcon },
      { href: "/admin/homecategory", label: "Home Categories", icon: Home },
    ]
  },
  {
    name: "Management",
    items: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ]
  }
];

// ফ্ল্যাট নেভিগেশন আইটেম (মোবাইলের জন্য)
const navItems = navCategories.flatMap(cat => cat.items);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // মোবাইলে সাইডবার অটো ক্লোজ
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // পাথ চেঞ্জ হলে মোবাইলে সাইডবার ক্লোজ
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center bg-linear-to-br from-background to-muted">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <LogOut className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Admin Access Required
          </h1>
          <p className="text-sm text-muted-foreground">
            Please sign in with an admin account to access this panel.
          </p>
          <Button className="mt-6 min-w-50" size="lg" asChild>
            <Link href="/account/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex min-h-screen min-w-0 bg-background">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground shadow-xl transition-all duration-300 lg:static lg:shadow-none",
            collapsed ? "w-20" : "w-64",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
        >
          {/* Sidebar Header */}
          <div className={cn(
            "flex h-16 items-center border-b border-sidebar-border px-4",
            collapsed ? "justify-center" : "justify-between"
          )}>
            {!collapsed ? (
              <>
                <Link
                  href="/admin"
                  className="font-serif text-lg font-bold text-sidebar-primary truncate"
                >
                  Admin Panel
                </Link>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCollapsed(true)}
                    className="hidden lg:block p-1.5 rounded-md hover:bg-sidebar-accent/50 transition-colors"
                    aria-label="Collapse sidebar"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden p-1.5 rounded-md hover:bg-sidebar-accent/50 transition-colors"
                    aria-label="Close sidebar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/admin"
                  className="font-serif text-lg font-bold text-sidebar-primary"
                >
                  AP
                </Link>
                <button
                  onClick={() => setCollapsed(false)}
                  className="hidden lg:block p-1.5 rounded-md hover:bg-sidebar-accent/50 transition-colors"
                  aria-label="Expand sidebar"
                >
                  <Menu className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* Navigation - ক্যাটাগরি অনুযায়ী সাজানো */}
          <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-sidebar-border">
            {navCategories.map((category, idx) => (
              <div key={category.name} className="mb-4">
                {!collapsed && (
                  <div className="px-4 mb-1">
                    <span className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                      {category.name}
                    </span>
                  </div>
                )}
                <div className="space-y-0.5 px-2">
                  {category.items.map((item) => {
                    const isActive =
                      item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname.startsWith(item.href);
                    
                    const Icon = item.icon;
                    
                    return collapsed ? (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center justify-center rounded-md p-2.5 text-sm font-medium transition-all duration-200",
                              isActive
                                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-sidebar text-sidebar-foreground border-sidebar-border">
                          <p>{item.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" />
                        <span className="truncate">{item.label}</span>
                        {isActive && (
                          <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs bg-sidebar-primary/20 text-sidebar-primary">
                            Active
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>
                {idx < navCategories.length - 1 && !collapsed && (
                  <Separator className="my-3 bg-sidebar-border/50" />
                )}
              </div>
            ))}
          </nav>

          {/* User Info & Back to Store */}
          <div className={cn(
            "border-t border-sidebar-border p-3 space-y-2",
            collapsed && "px-2"
          )}>
            {!collapsed ? (
              <>
                <div className="flex items-center gap-3 rounded-md bg-sidebar-accent/30 p-2">
                  <Avatar className="h-8 w-8 border border-sidebar-border">
                    <AvatarFallback className="bg-sidebar-primary text-sidebar text-xs">
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{user.name}</p>
                    <p className="text-xs text-sidebar-foreground/50 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground group"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  <span>Back to Store</span>
                </Link>
              </>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/"
                    className="flex items-center justify-center rounded-md p-2 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-sidebar text-sidebar-foreground">
                  <p>Back to Store</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4 lg:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="mr-3 lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Breadcrumb - optional */}
            <div className="hidden lg:flex items-center text-sm text-muted-foreground">
              <span>Admin</span>
              <ChevronRight className="h-4 w-4 mx-2" />
              <span className="text-foreground font-medium">
                {navItems.find(item => pathname.startsWith(item.href))?.label || "Dashboard"}
              </span>
            </div>

            <div className="flex-1" />
            
            {/* User menu - mobile friendly */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.name}
              </span>
              <Avatar className="h-8 w-8 border border-border sm:hidden">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 min-w-0 bg-linear-to-br from-background via-background to-muted/30">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}