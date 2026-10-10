"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, PhoneCall, ShieldAlert, User, Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Medical Cross Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
            {/* Simple Medical Cross */}
            <div className="relative w-5 h-5 flex items-center justify-center">
              <div className="absolute w-1.5 h-4.5 bg-white rounded-xs"></div>
              <div className="absolute w-4.5 h-1.5 bg-white rounded-xs"></div>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg text-slate-900 tracking-tight leading-tight">
              QueueLess <span className="text-blue-600 font-black">AI</span>
            </span>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none">
              Smart Hospital System
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/#how-it-works" className="hover:text-blue-600 transition-colors">
            How It Works
          </Link>
          <Link href="/#features" className="hover:text-blue-600 transition-colors">
            Features
          </Link>
          <Link href="/#benefits" className="hover:text-blue-600 transition-colors">
            Benefits
          </Link>
          <Link
            href="/emergency"
            className="flex items-center gap-1.5 text-red-600 hover:text-red-700 font-semibold px-2.5 py-1 rounded-md bg-red-50 hover:bg-red-100 transition-colors"
          >
            <ShieldAlert className="w-4 h-4 animate-pulse" />
            Emergency Intake (24x7)
          </Link>
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="font-semibold text-slate-700">
              <User className="w-4 h-4 mr-1 text-slate-500" />
              Sign In
            </Button>
          </Link>

          <Link href="/register">
            <Button variant="primary" size="sm" className="font-semibold shadow-xs">
              Book a Token
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 py-1.5"
          >
            How It Works
          </Link>
          <Link
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 py-1.5"
          >
            Features
          </Link>
          <Link
            href="/emergency"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-sm font-bold text-red-600 py-1.5"
          >
            <ShieldAlert className="w-4 h-4" />
            Emergency Intake (No Login Needed)
          </Link>
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full">
                Portal Sign In
              </Button>
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" className="w-full">
                Register & Book Token
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
