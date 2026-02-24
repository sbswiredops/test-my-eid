"use client";

import { useOrders } from "@/lib/order-store";
import { products as staticProducts, formatPrice } from "@/lib/data";
import { useAdminDashboard } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminDashboard() {
  const { orders: localOrders } = useOrders();
  const { data: dashboardData } = useAdminDashboard();

  // Use dashboard data if available, otherwise fall back to local store calculation
  const totalRevenue =
    dashboardData?.totalRevenue ??
    localOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders =
    dashboardData?.pendingOrders ??
    localOrders.filter((o) => o.status === "pending").length;
  const deliveredOrders =
    dashboardData?.deliveredOrders ??
    localOrders.filter((o) => o.status === "delivered").length;
  const totalOrdersCount = dashboardData?.totalOrders ?? localOrders.length;
  const productsCount = dashboardData?.totalProducts ?? staticProducts.length;

  // Define the type for an order (adjust fields as needed)
  type Order = {
    id: string;
    customer: { name: string };
    total: number;
    status: string;
    createdAt: string | number | Date;
  };

  const recentOrders: Order[] =
    dashboardData?.recentOrders ?? localOrders.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Overview of your store performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatPrice(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {localOrders.filter((o) => o.status !== "cancelled").length}{" "}
              orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalOrdersCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingOrders} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {productsCount}
            </div>
            <p className="text-xs text-muted-foreground">Manage your catalog</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Delivered
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {deliveredOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully fulfilled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-serif text-lg">Recent Orders</CardTitle>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-primary hover:underline"
          >
            View All
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No orders yet. Orders placed on the store will appear here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium text-muted-foreground">
                      Order ID
                    </th>
                    <th className="pb-2 font-medium text-muted-foreground">
                      Customer
                    </th>
                    <th className="pb-2 font-medium text-muted-foreground">
                      Total
                    </th>
                    <th className="pb-2 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="pb-2 font-medium text-muted-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order: Order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-3 font-mono text-xs">{order.id}</td>
                      <td className="py-3">{order.customer.name}</td>
                      <td className="py-3">{formatPrice(order.total)}</td>
                      <td className="py-3">
                        <Badge
                          variant="secondary"
                          className={statusColors[order.status]}
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-PK")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
