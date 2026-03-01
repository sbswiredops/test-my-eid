"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-store"
import { useOrders } from "@/lib/order-store"
import { formatPrice } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  User,
  Package,
  LogOut,
  Settings,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  Clock,
  TrendingUp,
  ChevronRight,
  Edit2,
  Save,
  X,
  Loader2,
  Heart,
  CreditCard,
  Truck,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-indigo-50 text-indigo-700 border-indigo-200",
  shipped: "bg-purple-50 text-purple-700 border-purple-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
}

const statusIcons: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Loader2,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: AlertCircle,
}

function AccountContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, logout, updateProfile } = useAuth()
  const { getOrdersByEmail } = useOrders()
  const defaultTab = searchParams.get("tab") || "orders"

  const [name, setName] = useState(user?.name || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [address, setAddress] = useState(user?.address || "")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setPhone(user.phone || "")
      setAddress(user.address || "")
    }
  }, [user])

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-md px-4 py-16 text-center"
      >
        <div className="rounded-2xl bg-linear-to-b from-muted/50 to-muted p-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Sign In Required
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please sign in to view your account and manage your orders
          </p>
          <Button className="mt-6" size="lg" asChild>
            <Link href="/account/login">Sign In to Your Account</Link>
          </Button>
        </div>
      </motion.div>
    )
  }

  const orders = getOrdersByEmail(user.email)
  const recentOrders = orders.slice(0, 3)
  
  // Calculate statistics
  const totalOrders = orders.length
  const completedOrders = orders.filter(o => o.status === "delivered").length
  const pendingOrders = orders.filter(o => ["pending", "confirmed", "processing"].includes(o.status)).length
  const totalSpent = orders.reduce((sum, order) => sum + (order.total ?? order.totalAmount ?? 0), 0)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      await updateProfile({ name, phone, address })
      toast.success("Profile updated successfully", {
        description: "Your changes have been saved."
      })
      setIsEditing(false)
    } catch (error) {
      toast.error("Failed to update profile", {
        description: "Please try again later."
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
    toast.success("Logged out successfully", {
      description: "Come back soon!"
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-7xl px-4 py-8"
    >
      {/* Header Section */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-lg text-primary">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
              Welcome back, {user.name.split(" ")[0]}!
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Member since {new Date().toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/shop">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Package className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedOrders}</p>
              </div>
              <div className="rounded-full bg-emerald-500/10 p-3">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingOrders}</p>
              </div>
              <div className="rounded-full bg-amber-500/10 p-3">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">{formatPrice(totalSpent)}</p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6">
          {orders.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted p-4">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No orders yet</h3>
                <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                  Start shopping to see your orders here. We have a great selection of products waiting for you!
                </p>
                <Button className="mt-6" asChild>
                  <Link href="/shop">Browse Products</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Recent Orders Preview */}
              {recentOrders.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>
                      Your latest orders and their status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentOrders.map((order) => {
                        const StatusIcon = statusIcons[order.status] || Package
                        return (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`rounded-full p-2 ${statusColors[order.status]?.split(' ')[0] || 'bg-muted'}`}>
                                <StatusIcon className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  Order #{order.orderId ?? order.id.slice(0, 8)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleDateString("en-PK", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })} • {order.items.length} items
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-medium">{formatPrice(order.total ?? order.totalAmount ?? 0)}</p>
                                <Badge variant="secondary" className={statusColors[order.status]}>
                                  {order.status}
                                </Badge>
                              </div>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/account/orders/${order.id}`}>
                                  <ChevronRight className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </CardContent>
                  {orders.length > 3 && (
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/account/orders">View All Orders</Link>
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              )}

              {/* Orders Table for larger screens */}
              {orders.length > 3 && (
                <Card className="hidden md:block">
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>
                      Complete list of all your orders
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.id} className="group">
                              <TableCell className="font-mono text-xs font-medium">
                                {order.orderId ?? order.id.slice(0, 8)}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString("en-PK", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </TableCell>
                              <TableCell className="text-sm">
                                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                              </TableCell>
                              <TableCell className="text-sm font-medium">
                                {formatPrice(order.total ?? order.totalAmount ?? 0)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className={statusColors[order.status]}>
                                  {order.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Link href={`/account/orders/${order.id}`}>
                                    View Details
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile Information */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Manage your personal information
                    </CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false)
                        setName(user.name)
                        setPhone(user.phone || "")
                        setAddress(user.address || "")
                      }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {isEditing ? (
                    <motion.form
                      key="edit"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      onSubmit={handleUpdateProfile}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={user.email}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                          Email cannot be changed
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Delivery Address</Label>
                        <Input
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Enter your delivery address"
                        />
                      </div>
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="view"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-start gap-3 rounded-lg border p-3">
                        <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Full Name</p>
                          <p className="text-sm text-muted-foreground">{user.name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-lg border p-3">
                        <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Email Address</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-lg border p-3">
                        <Phone className="mt-0.5 h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Phone Number</p>
                          <p className="text-sm text-muted-foreground">
                            {user.phone || "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-lg border p-3">
                        <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Delivery Address</p>
                          <p className="text-sm text-muted-foreground">
                            {user.address || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Useful links and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/wishlist">
                    <Heart className="mr-2 h-4 w-4" />
                    Wishlist
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/account/orders">
                    <Package className="mr-2 h-4 w-4" />
                    All Orders
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/account/addresses">
                    <MapPin className="mr-2 h-4 w-4" />
                    Saved Addresses
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/account/payment">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payment Methods
                  </Link>
                </Button>
                <Separator className="my-4" />
                <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive" asChild>
                  <Link href="/account/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    }>
      <AccountContent />
    </Suspense>
  )
}