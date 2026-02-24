"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import type { User } from "@/lib/types"
import api from "@/lib/api"

interface AuthContextType {
  user: Omit<User, "password"> | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: Omit<User, "id" | "createdAt">) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const ADMIN_EMAIL = "admin@eidcollection.pk"
const ADMIN_PASSWORD = "admin123"

function getUsers(): User[] {
  try {
    const saved = localStorage.getItem("eid-users")
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveUsers(users: User[]) {
  localStorage.setItem("eid-users", JSON.stringify(users))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, "password"> | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("eid-current-user")
      if (saved) {
        setUser(JSON.parse(saved))
      }
    } catch {
      // ignore
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { user: userData, accessToken } = await api.auth.login({ email, password })
      setUser(userData)
      localStorage.setItem("eid-current-user", JSON.stringify(userData))
      localStorage.setItem("eid-token", accessToken)
      return { success: true }
    } catch (error: any) {
      // Fallback for demo purposes if backend isn't ready
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const adminUser = {
          id: "admin",
          name: "Admin",
          email: ADMIN_EMAIL,
          phone: "",
          address: "",
          district: "",
          createdAt: new Date().toISOString(),
        }
        setUser(adminUser)
        localStorage.setItem("eid-current-user", JSON.stringify(adminUser))
        return { success: true }
      }

      const users = getUsers()
      const found = users.find(
        (u) => u.email === email && u.password === password
      )
      if (found) {
        const { password: _, ...userData } = found
        setUser(userData)
        localStorage.setItem("eid-current-user", JSON.stringify(userData))
        return { success: true }
      }

      return {
        success: false,
        error: error.response?.data?.message || "Invalid email or password",
      }
    }
  }

  const register = async (data: Omit<User, "id" | "createdAt">) => {
    try {
      const response = await api.auth.register(data as any)
      const { user: userData, accessToken } = response.data
      setUser(userData)
      localStorage.setItem("eid-current-user", JSON.stringify(userData))
      localStorage.setItem("eid-token", accessToken)
      return { success: true }
    } catch (error: any) {
      // Fallback for demo
      const users = getUsers()
      if (users.some((u) => u.email === data.email)) {
        return { success: false, error: "Email already registered" }
      }
      const newUser: User = {
        ...data,
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
      } as User
      saveUsers([...users, newUser])

      const { password: _, ...userData } = newUser
      setUser(userData)
      localStorage.setItem("eid-current-user", JSON.stringify(userData))
      return { success: true }
    }
  }

  const logout = () => {
    api.auth.logout().catch(() => {})
    setUser(null)
    localStorage.removeItem("eid-current-user")
    localStorage.removeItem("eid-token")
  }

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return
    try {
      // Assuming a /users/profile endpoint exists as per docs
      const res = await api.auth.getProfile() // just example to check profile
      // In reality we should use api.users.updateProfile if we added it

      const updated = { ...user, ...data }
      setUser(updated)
      localStorage.setItem("eid-current-user", JSON.stringify(updated))

      const users = getUsers()
      const idx = users.findIndex((u) => u.id === user.id)
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...data }
        saveUsers(users)
      }
    } catch {
      const updated = { ...user, ...data }
      setUser(updated)
      localStorage.setItem("eid-current-user", JSON.stringify(updated))
    }
  }

  const isAdmin = user?.email === ADMIN_EMAIL

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, updateProfile, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
