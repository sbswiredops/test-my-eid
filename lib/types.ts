// types.ts or lib/types.ts

// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  featured?: boolean;
  status?: string;
  parentId?: string;
  icon?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
  products?: Product[];
  faqs?: FAQ[];
  homeCategories?: HomeCategory[];
}

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
export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

// Product size types
export interface ProductSize {
  id: string;
  size: string; // Changed from 'size' to 'name' for consistency
  sizeDescription?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Product types - UPDATED for multiple categories
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  stockPerSize?: Record<string, number>;
  images: string[];
  categories: Category[]; // Changed from single category to array
  sizes: ProductSize[];
  faqs?: FAQ[];
  featured?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
  cart?: Cart[];
  orderItems?: OrderItem[];
}

// Product creation request - UPDATED for multiple categories
export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  images?: (File | string)[];
  categoryIds: string[]; // Changed from single category to array
  sizeIds: string[]; // Changed from sizes to sizeIds for clarity
  stockPerSize?: Record<string, number>;
  stock: number;
  featured?: boolean;
  tags?: string[];
  slug?: string;
}

// Product update request
export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

// Home Category types - NEW
export interface HomeCategory {
  id: string;
  name: string;
  priority?: number;
  categories: Category[];
  products: Product[];
  createdAt: string;
  updatedAt: string;
}

// Home Category creation request - NEW
export interface CreateHomeCategoryRequest {
  name: string;
  priority?: number;
  categoryIds?: string[];
  productIds?: string[];
}

// Home Category update request - NEW
export interface UpdateHomeCategoryRequest extends Partial<CreateHomeCategoryRequest> {}

// FAQ types - UPDATED
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  products?: Product[];
  categories?: Category[];
  createdAt: string;
  updatedAt: string;
}

// FAQ creation request - NEW
export interface CreateFAQRequest {
  question: string;
  answer: string;
  order?: number;
  isActive?: boolean;
  productIds?: string[];
  categoryIds?: string[];
}

// FAQ update request - NEW
export interface UpdateFAQRequest extends Partial<CreateFAQRequest> {}

// Banner types
export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  active: boolean;
  index?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Cart types
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
  slug: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  userId?: string;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
}

// Order types
export interface OrderItem {
  id: string;
  product: Product;
  productId: string;
  order: Order;
  orderId: string;
  quantity: number;
  price: number;
  size?: string;
  createdAt: string;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  notes?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  customer: Customer;
  status: OrderStatus;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: string;
  paymentStatus?: PaymentStatus;
  transactionId?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  userId?: string;
}

export type OrderStatus = 
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = 
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string; // Optional for responses
  address?: string;
  district?: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt?: string;
  orders?: Order[];
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  district?: string;
  role?: "USER" | "ADMIN";
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

// Store settings
export interface StoreSettings {
  storeName: string;
  storePhone: string;
  storeEmail: string;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  address?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  about?: string;
  terms?: string;
  privacy?: string;
}

// API types
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp?: string;
  path?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string | ApiError;
  meta?: any;
  timestamp?: string;
}

// Dashboard types
export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  recentOrders: Order[];
  lowStockProducts: Product[];
  popularProducts: Product[];
  ordersByStatus: Record<OrderStatus, number>;
  revenueByDay: Array<{ date: string; revenue: number }>;
}

// Filter types
export interface ProductFilter {
  categories?: string[];
  sizes?: string[];
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  tags?: string[];
  search?: string;
  inStock?: boolean;
}