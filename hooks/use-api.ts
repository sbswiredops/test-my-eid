import useSWR from "swr"
import type { SWRConfiguration } from "swr"
import { apiClient } from "../lib/api"

const fetcher = async (url: string) => {
  const res = await apiClient.get<any>(url)
  if (!res || !res.success) {
    throw new Error(res?.message || 'API error')
  }
  return res.data
}

export function useApi<T>(url: string | null, config?: SWRConfiguration) {
  return useSWR<T>(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
    ...config,
  })
}

// Products hooks
export function useProducts(params?: any) {
  const query = params ? `?${new URLSearchParams(params).toString()}` : ""
  return useApi<any>(`/products${query}`)
}

export function useProduct(slug: string) {
  return useApi<any>(slug ? `/products/slug/${slug}` : null)
}

// Categories hooks
export function useCategories() {
  return useApi<any[]>("/categories")
}

// Banners hooks
export function useHeroBanners() {
  return useApi<any[]>("/herobanner")
}

// Additional banner hooks
export function useMiddleBanners() {
  return useApi<any[]>("/herobanner/middle")
}

export function useBottomBanners() {
  return useApi<any[]>("/herobanner/bottom")
}

export function useGiveBanners() {
  return useApi<any[]>("/herobanner/give")
}

// Admin hooks
export function useAdminDashboard() {
  return useApi<any>("/admin/dashboard")
}

// User Profile hook
export function useProfile() {
  return useApi<any>("/auth/profile")
}

// Orders hooks
export function useMyOrders() {
  return useApi<any[]>("/orders/my")
}
