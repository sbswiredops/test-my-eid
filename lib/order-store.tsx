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
          const apiOrdersResp = await orderService.getMyOrders();
          const apiOrders = apiOrdersResp?.data || [];
          setOrders(apiOrders);
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
      const newOrderResp = await orderService.create({
        items,
        customer,
        subtotal,
      });
      const newOrder = newOrderResp?.data;
      if (newOrder) {
        setOrders((prev) => [newOrder, ...prev]);
        return newOrder;
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
    orders.filter((o) => o.customer.email === email);

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
