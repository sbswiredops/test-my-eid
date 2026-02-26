"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { Order, OrderStatus, CartItem, Customer } from "@/lib/types";
import { defaultSettings } from "@/lib/data";
import { orderService } from "@/lib/api/orders";
import { useAuth } from "./auth-store";

interface OrderContextType {
  orders: Order[];
  createOrder: (
    items: CartItem[],
    customer: Customer,
    subtotal: number,
  ) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  getOrdersByEmail: (email: string) => Order[];
  getOrderById: (id: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | null>(null);

function loadOrders(): Order[] {
  try {
    const saved = localStorage.getItem("eid-orders");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveOrders(orders: Order[]) {
  localStorage.setItem("eid-orders", JSON.stringify(orders));
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
          // If the logged-in user is an admin, fetch all orders, otherwise fetch only their orders
          const apiOrdersResp =
            (user as any)?.role === "ADMIN"
              ? await orderService.getAll()
              : await orderService.getMyOrders();
          const apiOrdersRaw = apiOrdersResp?.data ?? [];
          // Support multiple response shapes:
          // - Array of orders: []
          // - Paginated object: { items: [], total, page }
          // - Wrapped data object: { data: [] }
          const apiOrders = Array.isArray(apiOrdersRaw)
            ? apiOrdersRaw
            : Array.isArray((apiOrdersRaw as any).items)
            ? (apiOrdersRaw as any).items
            : Array.isArray((apiOrdersRaw as any).data)
            ? (apiOrdersRaw as any).data
            : [];
          const normalize = (o: any) => {
            const customer = {
              name: o.customer?.name ?? o.user?.name ?? o.name ?? "",
              email: o.customer?.email ?? o.user?.email ?? o.email ?? "",
              phone: o.customer?.phone ?? o.user?.phone ?? o.phone ?? "",
              address:
                o.customer?.address ?? o.user?.address ?? o.address ?? o.addr ?? "",
              district: o.customer?.district ?? o.user?.district ?? o.district ?? "",
              notes: o.customer?.notes ?? o.user?.notes ?? o.notes ?? "",
            } as any;
            const subtotal = Number(o.subtotal ?? o.subTotal ?? 0) || 0;
            const deliveryCharge = Number(o.deliveryCharge ?? o.delivery_charge ?? 0) || 0;
            const total = Number(o.totalAmount ?? o.total ?? o.total_amount ?? subtotal + deliveryCharge) || 0;
            const items = Array.isArray(o.items)
              ? o.items.map((it: any) => ({
                  ...it,
                  price: Number(it.price) || 0,
                }))
              : [];
            return {
              ...o,
              customer,
              subtotal,
              deliveryCharge,
              total,
              items,
            } as Order;
          };

          setOrders(apiOrders.map(normalize));
        } catch {
          setOrders(loadOrders());
        }
      } else {
        setOrders(loadOrders());
      }
    };
    fetchOrders();
  }, [user]);

  const createOrder = async (
    items: CartItem[],
    customer: Customer,
    subtotal: number,
  ): Promise<Order> => {
    try {
      // Backend expects only the customer fields for order creation
      const payload: any = {
        name: String(customer.name || "").trim(),
        email: customer.email ? String(customer.email).trim() : undefined,
        phone: String(customer.phone || "").trim(),
        address: String(customer.address || "").trim(),
        district: String(customer.district || "").trim(),
        notes: customer.notes ? String(customer.notes).trim() : undefined,
      };

      // Include items in payload if available so backend receives full order info.
      if (Array.isArray(items) && items.length > 0) {
        payload.items = items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: Number(i.price) || 0,
          quantity: Number(i.quantity) || 1,
          size: i.size,
          image: i.image,
          slug: i.slug,
        }));
      }

      const newOrderResp = await orderService.create(payload);
        const newOrder = newOrderResp?.data;
      if (newOrder) {
        // normalize incoming order
        const normalized = {
          ...newOrder,
          customer: {
            name:
              newOrder.customer?.name ?? newOrder.user?.name ?? newOrder.name ?? "",
            email:
              newOrder.customer?.email ?? newOrder.user?.email ?? newOrder.email ?? "",
            phone:
              newOrder.customer?.phone ?? newOrder.user?.phone ?? newOrder.phone ?? "",
            address:
              newOrder.customer?.address ?? newOrder.user?.address ?? newOrder.address ?? "",
            district:
              newOrder.customer?.district ?? newOrder.user?.district ?? newOrder.district ?? "",
            notes: newOrder.customer?.notes ?? newOrder.user?.notes ?? newOrder.notes ?? "",
          },
          subtotal: Number(newOrder.subtotal ?? newOrder.subTotal ?? 0) || 0,
          deliveryCharge: Number(newOrder.deliveryCharge ?? newOrder.delivery_charge ?? 0) || 0,
          total: Number(newOrder.totalAmount ?? newOrder.total ?? 0) || 0,
          items: Array.isArray(newOrder.items)
            ? newOrder.items.map((it: any) => ({ ...it, price: Number(it.price) || 0 }))
            : [],
        } as Order;
        setOrders((prev) => [normalized, ...prev]);
        return normalized;
      }
      throw new Error("Failed to create order");
    } catch {
      const deliveryCharge =
        subtotal >= defaultSettings.freeDeliveryThreshold
          ? 0
          : defaultSettings.deliveryCharge;

      const order: Order = {
        id: `ORD-${Date.now().toString(36).toUpperCase()}`,
        items,
        customer,
        status: "pending",
        subtotal,
        deliveryCharge,
        total: subtotal + deliveryCharge,
        paymentMethod: "Cash on Delivery",
        createdAt: new Date().toISOString(),
      };

      const updated = [order, ...orders];
      setOrders(updated);
      saveOrders(updated);
      return order;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await orderService.updateStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
      );
    } catch {
      const updated = orders.map((o) =>
        o.id === orderId ? { ...o, status } : o,
      );
      setOrders(updated);
      saveOrders(updated);
    }
  };

  const getOrdersByEmail = (email: string) =>
    orders.filter((o) => {
      // Support multiple shapes returned from the API: `customer`, `user`, or top-level email
      const custEmail =
        // preferred normalized shape
        (o as any).customer?.email ||
        // some backends return `user` nested
        (o as any).user?.email ||
        // or have email/name at top-level
        (o as any).email ||
        null;
      return custEmail === email;
    });

  const getOrderById = (id: string) => orders.find((o) => o.id === id);

  return (
    <OrderContext.Provider
      value={{
        orders,
        createOrder,
        updateOrderStatus,
        getOrdersByEmail,
        getOrderById,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrders must be used within OrderProvider");
  return context;
}
