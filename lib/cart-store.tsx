"use client"

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react"
import type { CartItem } from "@/lib/types"

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
  | { type: "SET_CART"; payload: CartItem[] }

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
      return { items: action.payload }
    default:
      return state
  }
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string, size: string) => void
  updateQuantity: (productId: string, size: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

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

  const addItem = (item: CartItem) =>
    dispatch({ type: "ADD_ITEM", payload: item })

  const removeItem = (productId: string, size: string) =>
    dispatch({ type: "REMOVE_ITEM", payload: { productId, size } })

  const updateQuantity = (
    productId: string,
    size: string,
    quantity: number
  ) => dispatch({ type: "UPDATE_QUANTITY", payload: { productId, size, quantity } })

  const clearCart = () => dispatch({ type: "CLEAR_CART" })

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
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
