import type { User, LoginCredentials, RegisterData } from "@/lib/types"
import axiosInstance from "./axios-instance"

const authApi = {
  register: (data: RegisterData) => 
    axiosInstance.post("/auth/register", data),
  
  login: (credentials: LoginCredentials) => 
    axiosInstance.post("/auth/login", credentials).then(res => {
      if (res.data.accessToken) {
        localStorage.setItem("eid-token", res.data.accessToken)
      }
      return res.data
    }),
  
  refresh: (refreshToken: string) => 
    axiosInstance.post("/auth/refresh", { refreshToken }),
  
  getProfile: () => 
    axiosInstance.get("/auth/profile").then(res => res.data),
  
  logout: () => {
    localStorage.removeItem("eid-token")
    localStorage.removeItem("eid-current-user")
    return axiosInstance.post("/auth/logout")
  },
}

export default authApi
