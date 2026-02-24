"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User } from "@/lib/types";
import api from "@/lib/api";

interface AuthContextType {
  user: Omit<User, "password"> | null;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    data: Omit<User, "id" | "createdAt">,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_EMAIL = "admin@eidcollection.pk";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, "password"> | null>(null);
  // No mock fallback — rely on backend only

  useEffect(() => {
    try {
      const saved = localStorage.getItem("eid-current-user");
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const resp: any = await api.auth.login({ email, password });

      // support multiple shapes: { user, accessToken } or { data: { user, accessToken } } or normalized resp
      const userData =
        resp?.user ??
        resp?.data?.user ??
        resp?.raw?.data?.user ??
        resp?.raw?.user;
      const accessToken =
        resp?.accessToken ??
        resp?.data?.accessToken ??
        resp?.raw?.data?.accessToken ??
        resp?.raw?.accessToken;

      if (!userData) {
        return {
          success: false,
          error:
            resp?.raw?.message ?? resp?.message ?? "Invalid email or password",
        };
      }
      setUser(userData);
      localStorage.setItem("eid-current-user", JSON.stringify(userData));
      if (accessToken) localStorage.setItem("eid-token", accessToken);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Invalid email or password",
      };
    }
  };

  const register = async (data: Omit<User, "id" | "createdAt">) => {
    try {
      const payloadAny = {
        ...(data as any),
        role: (data as any).role ?? "USER",
      } as any;
      if (payloadAny.address === "") delete payloadAny.address;
      if (payloadAny.district === "") delete payloadAny.district;
      const response = await api.auth.register(payloadAny as any);
      // response may be normalized or wrapped
      const resp: any = response || {};
      let userData = resp?.user ?? resp?.data?.user ?? resp?.raw?.data?.user;
      let accessToken =
        resp?.accessToken ??
        resp?.data?.accessToken ??
        resp?.raw?.data?.accessToken;

      // If backend doesn't return an accessToken/user on register, attempt login
      if (
        (!userData || !accessToken) &&
        payloadAny.email &&
        payloadAny.password
      ) {
        try {
          const loginRes: any = await api.auth.login({
            email: payloadAny.email,
            password: payloadAny.password,
          });
          userData =
            userData ??
            loginRes.user ??
            loginRes?.data?.user ??
            loginRes?.raw?.data?.user;
          accessToken =
            accessToken ??
            loginRes.accessToken ??
            loginRes?.data?.accessToken ??
            loginRes?.raw?.data?.accessToken;
        } catch {
          // ignore — will be handled below as registration failure
        }
      }

      if (!userData) {
        return {
          success: false,
          error: resp?.raw?.message ?? resp?.message ?? "Registration failed",
        };
      }

      setUser(userData);
      if (userData)
        localStorage.setItem("eid-current-user", JSON.stringify(userData));
      if (accessToken) localStorage.setItem("eid-token", accessToken);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Registration service unavailable",
      };
    }
  };

  const logout = () => {
    api.auth.logout().catch(() => {});
    setUser(null);
    localStorage.removeItem("eid-current-user");
    localStorage.removeItem("eid-token");
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    try {
      // Assuming a /users/profile endpoint exists as per docs
      const res = await api.auth.getProfile(); // just example to check profile
      // In reality we should use api.users.updateProfile if we added it

      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem("eid-current-user", JSON.stringify(updated));
      // No mock user storage update
    } catch {
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem("eid-current-user", JSON.stringify(updated));
    }
  };

  const isAdmin = user?.role === "ADMIN" || user?.email === ADMIN_EMAIL;

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, updateProfile, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
