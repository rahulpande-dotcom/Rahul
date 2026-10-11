"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UserRole } from "@/lib/types";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { RememberMeSuggestions } from "@/components/auth/RememberMeSuggestions";
import {
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialRole = (searchParams.get("role") as UserRole) || "patient";
  const [activeRole, setActiveRole] = useState<UserRole>(initialRole);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get("role") as UserRole;
    if (roleParam && ["admin", "staff", "doctor", "patient"].includes(roleParam)) {
      setActiveRole(roleParam);
    }
  }, [searchParams]);

  const handleSelectAccount = (acc: { email: string; role: UserRole; password?: string }) => {
    setActiveRole(acc.role);
    setEmail(acc.email);
    if (acc.password) {
      setPassword(acc.password);
    }
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role: activeRole,
          rememberMe,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Login failed. Please check credentials.");
        setIsLoading(false);
        return;
      }

      // Redirect based on role
      const userRole = data.user.role;
      if (userRole === "admin") {
        window.location.href = "/admin/dashboard";
      } else if (userRole === "staff" || userRole === "doctor") {
        window.location.href = "/staff/dashboard";
      } else {
        window.location.href = "/patient/dashboard";
      }
    } catch (err: any) {
      setErrorMessage("Network error while logging in. Please retry.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20 font-bold">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Hospital Portal Sign In
        </h1>
        <p className="text-xs text-slate-500">
          Select your role and authenticate with your password
        </p>
      </div>

      <Card className="shadow-lg border-slate-200">
        <CardContent className="p-6 space-y-5">
          {/* Role Selection Tabs */}
          <div className="grid grid-cols-4 p-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
            {(["patient", "staff", "doctor", "admin"] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setActiveRole(r);
                  setErrorMessage("");
                }}
                className={`py-1.5 rounded-md capitalize transition-all ${
                  activeRole === r
                    ? "bg-white text-blue-700 shadow-xs font-bold"
                    : "hover:text-slate-900 text-slate-500"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`${activeRole}@queueless.ai`}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Forgot?
                </Link>
              </div>
              <PasswordInput
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Remember this device (30 days)</span>
              </label>
            </div>

            <Button type="submit" size="lg" className="w-full font-bold" isLoading={isLoading}>
              Sign In to {activeRole.toUpperCase()} Portal
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          {/* Previously Used Account Suggestions */}
          <RememberMeSuggestions
            onSelectAccount={handleSelectAccount}
            activeRole={activeRole}
          />
        </CardContent>
      </Card>

      {/* Registration link */}
      <div className="text-center text-xs text-slate-500">
        Don&apos;t have a patient account yet?{" "}
        <Link href="/register" className="font-bold text-blue-600 hover:underline">
          Register now to book tokens →
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<div className="text-center py-12 text-xs text-slate-400">Loading portal...</div>}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
