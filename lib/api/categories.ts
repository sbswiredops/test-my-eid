import axiosInstance from "./axios-instance"

const categoriesApi = {
  getAll: () => 
    axiosInstance.get("/categories").then(res => res.data),
  
  getById: (id: string) => 
    axiosInstance.get(`/categories/${id}`).then(res => res.data),
  
  getBySlug: (slug: string) => 
    axiosInstance.get(`/categories/slug/${slug}`).then(res => res.data),
  
  create: (data: FormData) => 
    axiosInstance.post("/categories", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(res => res.data),
  
  update: (id: string, data: any) => 
    axiosInstance.patch(`/categories/${id}`, data).then(res => res.data),
  
  delete: (id: string) => 
    axiosInstance.delete(`/categories/${id}`).then(res => res.data),
}

export default categoriesApi
