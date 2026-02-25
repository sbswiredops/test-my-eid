// Category creation request
export interface CreateCategoryRequest {
  name: string;
  description?: string;
  image?: File | string;
  slug?: string;
  featured?: boolean;
  status?: string;
  parentId?: string;
  icon?: File | string;
  order?: number;
}

// Category update request
export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> { }

// Product creation request
export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  images?: (File | string)[];
  category: string;
  sizes?: string[];
  stockPerSize?: Record<string, number>;
  featured?: boolean;
  tags?: string[];
}

// Product update request
export interface UpdateProductRequest extends Partial<CreateProductRequest> { }

// Pagination query
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
// Generic API error type
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Generic API response type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: any;
}
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  categoryId: string;
  sizes: ProductSize[];
  faqs?: string[];
  createdAt: string;
  featured?: boolean;
  tags?: string[];
  originalPrice?: number;
}

export interface ProductSize {
  id?: string;
  size: string;
  productId?: string;
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
  index?: number
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
  address?: string
  district?: string
  createdAt: string
  role?: "USER" | "ADMIN"
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
  role?: "USER" | "ADMIN"
}
