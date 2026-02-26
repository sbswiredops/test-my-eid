"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(async () => {
      const result = await login(email, password);
      if (result.success) {
        toast.success("Welcome back!");
        // After login, redirect to `next` if provided, otherwise to account/admin
        try {
          const params = new URLSearchParams(window.location.search);
          const next = params.get("next");
          if (next) {
            router.push(next);
            return;
          }
        } catch {}

        try {
          const saved = localStorage.getItem("current-user");
          const current = saved ? JSON.parse(saved) : null;
          if (current?.role === "ADMIN") {
            router.push("/admin");
          } else {
            router.push("/account");
          }
        } catch {
          router.push("/account");
        }
      } else {
        setError(result.error || "Login failed");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center">
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Welcome Back
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to your Eid Collection account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        {error && (
          <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1"
            required
          />
        </div>
        <Button type="submit" className="mt-2" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/account/register"
          className="font-medium text-primary hover:underline"
        >
          Create one
        </Link>
      </p>

      <div className="mt-8 rounded-lg border border-border/60 bg-muted/50 p-4">
        <p className="text-xs font-medium text-muted-foreground">
          Demo Accounts:
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Admin: admin@eidcollection.pk / admin123
        </p>
        <p className="text-xs text-muted-foreground">
          Or create a new customer account
        </p>
      </div>
    </div>
  );
}
