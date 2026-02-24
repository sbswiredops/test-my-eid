"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: Omit<User, "password"> | null
  login: (email: string, password: string) => { success: boolean; error?: string }
  register: (data: Omit<User, "id" | "createdAt">) => { success: boolean; error?: string }
  logout: () => void
  updateProfile: (data: Partial<User>) => void
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

  const login = (email: string, password: string) => {
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
    if (!found) return { success: false, error: "Invalid email or password" }

    const { password: _, ...userData } = found
    setUser(userData)
    localStorage.setItem("eid-current-user", JSON.stringify(userData))
    return { success: true }
  }

  const register = (data: Omit<User, "id" | "createdAt">) => {
    const users = getUsers()
    if (users.some((u) => u.email === data.email)) {
      return { success: false, error: "Email already registered" }
    }
    const newUser: User = {
      ...data,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    saveUsers([...users, newUser])

    const { password: _, ...userData } = newUser
    setUser(userData)
    localStorage.setItem("eid-current-user", JSON.stringify(userData))
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("eid-current-user")
  }

  const updateProfile = (data: Partial<User>) => {
    if (!user) return
    const updated = { ...user, ...data }
    setUser(updated)
    localStorage.setItem("eid-current-user", JSON.stringify(updated))

    const users = getUsers()
    const idx = users.findIndex((u) => u.id === user.id)
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...data }
      saveUsers(users)
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
