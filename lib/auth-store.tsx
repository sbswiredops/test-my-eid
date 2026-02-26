"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User } from "@/lib/types";
import { authService } from "@/lib/api/auth";

// Ensure api.auth refers to the instance, not the class

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

// Helper: decode JWT and check expiry
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return null;
  try {
    // Correct usage: call authService.refresh(refreshToken)
    const res = await authService.refresh(refreshToken);
    const payload = res?.data ?? {};
    const accessToken = payload.accessToken;
    const newRefreshToken = payload.refreshToken;
    const userData = payload.user;
    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
    }
    if (newRefreshToken) {
      localStorage.setItem("refresh_token", newRefreshToken);
    }
    if (userData) {
      localStorage.setItem("current-user", JSON.stringify(userData));
    }
    return accessToken;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, "password"> | null>(null);

  // On mount, load user
  useEffect(() => {
    try {
      const saved = localStorage.getItem("current-user");
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Token auto-refresh effect
  useEffect(() => {
    const interval = setInterval(async () => {
      const accessToken = localStorage.getItem("access_token");
      if (accessToken && isTokenExpired(accessToken)) {
        const newToken = await refreshAccessToken();
        if (!newToken) {
          // If refresh fails, logout
          logout();
        }
      }
    }, 60 * 1000); // Check every 1 min
    return () => clearInterval(interval);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      const userData =
        response?.user ?? response?.data?.user ?? response?.raw?.data?.user;
      const accessToken =
        response?.accessToken ??
        response?.data?.accessToken ??
        response?.raw?.data?.accessToken;
      const refreshToken =
        response?.refreshToken ??
        response?.data?.refreshToken ??
        response?.raw?.data?.refreshToken;
      if (userData) {
        setUser(userData);
        localStorage.setItem("current-user", JSON.stringify(userData));
        if (accessToken) {
          localStorage.setItem("access_token", accessToken);
        }
        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        }
        return { success: true };
      } else {
        // Try to extract error message
        const errorMsg =
          response?.raw?.data?.error ||
          response?.raw?.data?.message ||
          response?.raw?.message ||
          "Login failed";
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      return { success: false, error: "Unexpected error, please try again." };
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
      const response = await authService.register(payloadAny as any);
      // response may be normalized or wrapped
      const resp: any = response || {};
      let userData = resp?.user ?? resp?.data?.user ?? resp?.raw?.data?.user;
      let accessToken =
        resp?.accessToken ??
        resp?.data?.accessToken ??
        resp?.raw?.data?.accessToken;
      let refreshToken =
        resp?.refreshToken ??
        resp?.data?.refreshToken ??
        resp?.raw?.data?.refreshToken;

      // If backend doesn't return an accessToken/user on register, attempt login
      if (
        (!userData || !accessToken) &&
        payloadAny.email &&
        payloadAny.password
      ) {
        try {
          const loginRes: any = await authService.login({
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
          refreshToken =
            refreshToken ??
            loginRes.refreshToken ??
            loginRes?.data?.refreshToken ??
            loginRes?.raw?.data?.refreshToken;
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
        localStorage.setItem("current-user", JSON.stringify(userData));
      if (accessToken) {
        localStorage.setItem("access_token", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }
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
    authService.logout().catch(() => {});
    setUser(null);
    localStorage.removeItem("current-user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    try {
      const res = await authService.getProfile(); // just example to check profile
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem("current-user", JSON.stringify(updated));
    } catch (error) {
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem("current-user", JSON.stringify(updated));
    }
  };

  const isAdmin = user?.role === "ADMIN";

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
