import axiosInstance from "./axios-instance"

const ordersApi = {
  create: (data: any) => 
    axiosInstance.post("/orders", data).then(res => res.data),
  
  getAll: () => 
    axiosInstance.get("/orders").then(res => res.data),
  
  getMyOrders: () => 
    axiosInstance.get("/orders/my").then(res => res.data),
  
  getMyStats: () => 
    axiosInstance.get("/orders/my/stats").then(res => res.data),
  
  getById: (id: string) => 
    axiosInstance.get(`/orders/${id}`).then(res => res.data),
  
  getByOrderId: (orderId: string) => 
    axiosInstance.get(`/orders/order-id/${orderId}`).then(res => res.data),
  
  updateStatus: (id: string, status: string) => 
    axiosInstance.patch(`/orders/${id}/status`, { status }).then(res => res.data),
  
  cancel: (id: string) => 
    axiosInstance.post(`/orders/${id}/cancel`).then(res => res.data),
  
  getDashboardStats: () => 
    axiosInstance.get("/admin/dashboard").then(res => res.data),
}

export default ordersApi
