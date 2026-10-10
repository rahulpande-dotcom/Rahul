import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { ShieldX, ArrowLeft, LogIn, KeyRound } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-lg text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <ShieldX className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Access Restricted (403)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              You do not have the required role privileges to access this portal. Hospital administrative and clinical corridors are protected by server-side role validation.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link href="/login">
              <Button size="md" className="w-full font-bold flex items-center justify-center gap-2">
                <KeyRound className="w-4 h-4" />
                Switch to Authorized Portal Account
              </Button>
            </Link>

            <Link href="/">
              <Button variant="ghost" size="md" className="w-full text-slate-600 font-medium flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Return to Public Homepage
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
