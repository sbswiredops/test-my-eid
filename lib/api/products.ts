import axiosInstance from "./axios-instance"
import type { Product } from "@/lib/types"

const productsApi = {
  getAll: (params?: any) => 
    axiosInstance.get("/products", { params }).then(res => res.data),
  
  getById: (id: string) => 
    axiosInstance.get(`/products/${id}`).then(res => res.data),
  
  getBySlug: (slug: string) => 
    axiosInstance.get(`/products/slug/${slug}`).then(res => res.data),
  
  create: (data: FormData) => 
    axiosInstance.post("/products", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(res => res.data),
  
  update: (id: string, data: any) => 
    axiosInstance.patch(`/products/${id}`, data).then(res => res.data),
  
  delete: (id: string) => 
    axiosInstance.delete(`/products/${id}`).then(res => res.data),

  getLowStock: () => 
    axiosInstance.get("/admin/products/low-stock").then(res => res.data),
}

export default productsApi
