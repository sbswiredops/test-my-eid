export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  sizes: string[]
  stockPerSize: Record<string, number>
  featured: boolean
  tags: string[]
  createdAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
}

export interface Banner {
  id: string
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  image: string
  active: boolean
}

export interface CartItem {
  productId: string
  name: string
  price: number
  size: string
  quantity: number
  image: string
  slug: string
}

export interface Customer {
  name: string
  email: string
  phone: string
  address: string
  district: string
  notes?: string
}

export interface Order {
  id: string
  items: CartItem[]
  customer: Customer
  status: OrderStatus
  subtotal: number
  deliveryCharge: number
  total: number
  paymentMethod: string
  createdAt: string
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"

export interface User {
  id: string
  name: string
  email: string
  phone: string
  password: string
  address: string
  district: string
  createdAt: string
}

export interface StoreSettings {
  storeName: string
  storePhone: string
  storeEmail: string
  deliveryCharge: number
  freeDeliveryThreshold: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
  address?: string
  district?: string
  notes?: string
}
