import type { User, LoginCredentials, RegisterData } from "@/lib/types"
import axiosInstance from "./axios-instance"

const authApi = {
  register: (data: RegisterData) =>
    axiosInstance.post("/auth/register", data).then((res) => {
      // normalize response shape: prefer res.data.data but fall back to res.data
      const payload = res.data?.data ?? res.data ?? {}
      if (payload.accessToken) localStorage.setItem("eid-token", payload.accessToken)
      return {
        user: payload.user ?? payload.user,
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        raw: res.data,
      }
    }),

  login: (credentials: LoginCredentials) =>
    axiosInstance.post("/auth/login", credentials).then((res) => {
      const payload = res.data?.data ?? res.data ?? {}
      if (payload.accessToken) localStorage.setItem("eid-token", payload.accessToken)
      return {
        user: payload.user,
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        raw: res.data,
      }
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
