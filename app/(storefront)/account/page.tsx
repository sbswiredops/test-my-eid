"use client"

import { Suspense } from "react"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { User, Package, LogOut } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
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

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <User className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Sign In Required
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please sign in to view your account
        </p>
        <Button className="mt-6" asChild>
          <Link href="/account/login">Sign In</Link>
        </Button>
      </div>
    )
  }

  const orders = getOrdersByEmail(user.email)

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile({ name, phone, address })
    toast.success("Profile updated")
  }

  const handleLogout = () => {
    logout()
    router.push("/")
    toast.success("Logged out successfully")
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
            My Account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {user.name}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="mr-1 h-4 w-4" />
          Log Out
        </Button>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="orders">
            <Package className="mr-1.5 h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="mr-1.5 h-4 w-4" />
            Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-6">
          {orders.length === 0 ? (
            <div className="rounded-lg border border-border/60 bg-card p-8 text-center">
              <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">
                No orders yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Start shopping to see your orders here
              </p>
              <Button className="mt-4" size="sm" asChild>
                <Link href="/shop">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs font-medium">
                        {order.id}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-sm">
                        {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {formatPrice(order.total)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[order.status] || ""}`}
                        >
                          {order.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <form
            onSubmit={handleUpdateProfile}
            className="max-w-md rounded-lg border border-border/60 bg-card p-6"
          >
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">
              Profile Information
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="p-name">Full Name</Label>
                <Input
                  id="p-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="p-email">Email</Label>
                <Input
                  id="p-email"
                  value={user.email}
                  disabled
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="p-phone">Phone</Label>
                <Input
                  id="p-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="p-address">Address</Label>
                <Input
                  id="p-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-fit">
                Save Changes
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center">Loading...</div>}>
      <AccountContent />
    </Suspense>
  )
}
