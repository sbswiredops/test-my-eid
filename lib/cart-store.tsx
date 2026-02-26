"use client"

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react"
import { cartService } from "@/lib/api/cart"
import { toast } from "sonner"
import type { CartItem } from "@/lib/types"
import { useAuth } from "@/lib/auth-store"

interface CartState {
  items: CartItem[]
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { productId: string; size: string } }
  | {
      type: "UPDATE_QUANTITY"
      payload: { productId: string; size: string; quantity: number }
    }
  | { type: "CLEAR_CART" }
  | { type: "SET_CART"; payload: any }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (item) =>
          item.productId === action.payload.productId &&
          item.size === action.payload.size
      )
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.productId === action.payload.productId &&
            item.size === action.payload.size
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        }
      }
      return { items: [...state.items, action.payload] }
    }
    case "REMOVE_ITEM":
      return {
        items: state.items.filter(
          (item) =>
            !(
              item.productId === action.payload.productId &&
              item.size === action.payload.size
            )
        ),
      }
    case "UPDATE_QUANTITY":
      return {
        items: state.items.map((item) =>
          item.productId === action.payload.productId &&
          item.size === action.payload.size
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        ),
      }
    case "CLEAR_CART":
      return { items: [] }
    case "SET_CART":
      // Normalize payload: accept array or object with `items` and
      // ensure each item has the expected CartItem shape so UI calculations
      // (like price * quantity) don't produce NaN.
      const payload = action.payload
      const rawItems = Array.isArray(payload)
        ? payload
        : payload && Array.isArray(payload.items)
        ? payload.items
        : []
      const normalized = rawItems.map((i: any) => ({
        productId: i.productId || (i.product && i.product.id) || "",
        name: i.name || (i.product && i.product.name) || "",
        // prefer numeric price, fallback to nested product.price or 0
        price:
          typeof i.price === "number"
            ? i.price
            : i.price
            ? Number(i.price) || 0
            : i.product && i.product.price
            ? Number(i.product.price) || 0
            : 0,
        size: i.size || (i.sizeName || "") ,
        quantity: Number(i.quantity) || 1,
        image:
          i.image || (i.product && i.product.images && i.product.images[0]) || "/images/placeholder.png",
        slug: i.slug || (i.product && i.product.slug) || "",
      }))
      return { items: normalized }
    default:
      return state
  }
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => Promise<void>
  removeItem: (productId: string, size: string) => Promise<void>
  updateQuantity: (productId: string, size: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  itemCount: number
  subtotal: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })
  const { user } = useAuth()

  useEffect(() => {
    try {
      const saved = localStorage.getItem("eid-cart")
      if (saved) {
        dispatch({ type: "SET_CART", payload: JSON.parse(saved) })
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("eid-cart", JSON.stringify(state.items))
  }, [state.items])

  const addItem = async (item: CartItem) => {
    // optimistic update locally
    dispatch({ type: "ADD_ITEM", payload: item })
    // If user is not logged in, keep cart local only
    if (!user) return
    try {
      // send only expected fields to API (backend AddToCartDto expects productId, size, quantity)
      await cartService.addItem({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
      })
      // refresh server cart if available
      const res = await cartService.getCart()
      if (res && res.data) dispatch({ type: "SET_CART", payload: res.data })
    } catch (err) {
      toast.error("Failed to add item to cart")
    }
  }

  const removeItem = async (productId: string, size: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { productId, size } })
    if (!user) return
    try {
      // request server to remove by setting quantity to 0
      await cartService.updateCart({ productId, size, quantity: 0 })
      const res = await cartService.getCart()
      if (res && res.data) dispatch({ type: "SET_CART", payload: res.data })
    } catch (err) {
      toast.error("Failed to remove item")
    }
  }

  const updateQuantity = async (
    productId: string,
    size: string,
    quantity: number
  ) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, size, quantity } })
    if (!user) return
    try {
      await cartService.updateCart({ productId, size, quantity })
      const res = await cartService.getCart()
      if (res && res.data) dispatch({ type: "SET_CART", payload: res.data })
    } catch (err) {
      toast.error("Failed to update cart")
    }
  }

  const clearCart = async () => {
    dispatch({ type: "CLEAR_CART" })
    if (!user) return
    try {
      await cartService.clearCart()
    } catch (err) {
      toast.error("Failed to clear cart")
    }
  }

  const itemCount = state.items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0
  )
  const subtotal = state.items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  )

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within CartProvider")
  return context
}
