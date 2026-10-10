"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  UserRole,
  UserProfile,
} from "@/lib/types";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Stethoscope,
  Building2,
  Calendar,
  Ticket,
  ClipboardList,
  ShieldAlert,
  FileText,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Database,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { playHospitalChime } from "@/lib/sound";

interface PortalLayoutProps {
  role: UserRole;
  user?: UserProfile | null;
  children: React.ReactNode;
}

export function PortalLayout({ role, user, children }: PortalLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ supabaseConnected: boolean; mode: string } | null>(null);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(user || null);

  useEffect(() => {
    // Fetch current user if not passed from server
    if (!activeUser) {
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated) {
            setActiveUser(data.user);
          }
        })
        .catch(() => {});
    }

    // Check DB status
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.databaseStatus) {
          setDbStatus(data.databaseStatus);
        }
      })
      .catch(() => {});
  }, [activeUser]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  // Nav items per role
  const getNavLinks = () => {
    if (role === "admin") {
      return [
        { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Patients Directory", href: "/admin/patients", icon: Users },
        { label: "Hospital Staff", href: "/admin/staff", icon: UserCheck },
        { label: "Doctors & OPD", href: "/admin/doctors", icon: Stethoscope },
        { label: "Departments", href: "/admin/departments", icon: Building2 },
        { label: "Appointments", href: "/admin/appointments", icon: Calendar },
        { label: "Live Token Queue", href: "/admin/tokens", icon: Ticket },
        { label: "Clinical Visits", href: "/admin/visits", icon: ClipboardList },
        { label: "Emergency Center", href: "/admin/emergency", icon: ShieldAlert, badge: "24/7" },
        { label: "Reports & Analytics", href: "/admin/reports", icon: FileText },
        { label: "Security Audit Logs", href: "/admin/audit-logs", icon: History },
        { label: "Settings & DB", href: "/admin/settings", icon: Settings },
      ];
    }

    if (role === "staff" || role === "doctor") {
      return [
        { label: "Staff Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
        { label: "Walk-in Registration", href: "/staff/register-patient", icon: Users, badge: "New" },
        { label: "Patients Directory", href: "/staff/patients", icon: Users },
        { label: "Live Queue Board", href: "/staff/queue", icon: Ticket, highlight: true },
        { label: "Appointments Desk", href: "/staff/appointments", icon: Calendar },
        { label: "Clinical Consultations", href: "/staff/visits", icon: Stethoscope },
        { label: "Emergency Intake", href: "/staff/emergency", icon: ShieldAlert, badge: "Alert" },
        { label: "Discharge & Checkout", href: "/staff/checkout", icon: ClipboardList },
      ];
    }

    // Patient
    return [
      { label: "My Health Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
      { label: "Book Appointment", href: "/patient/book-appointment", icon: Calendar, highlight: true },
      { label: "My Tokens", href: "/patient/my-tokens", icon: Ticket },
      { label: "Live Queue Tracker", href: "/patient/queue-status", icon: Clock },
      { label: "Appointments", href: "/patient/appointments", icon: Calendar },
      { label: "Medical History", href: "/patient/medical-history", icon: ClipboardList },
      { label: "My Reports (PDF)", href: "/patient/my-reports", icon: FileText },
      { label: "My Profile", href: "/patient/profile", icon: Users },
      { label: "Security", href: "/patient/security", icon: Settings },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 flex-col shrink-0 border-r border-slate-800 justify-between">
        <div className="flex flex-col">
          {/* Logo Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold">
                <div className="relative w-4 h-4 flex items-center justify-center">
                  <div className="absolute w-1 h-3.5 bg-white rounded-xs"></div>
                  <div className="absolute w-3.5 h-1 bg-white rounded-xs"></div>
                </div>
              </div>
              <div>
                <span className="font-extrabold text-white text-base tracking-tight leading-none block">
                  QueueLess <span className="text-blue-400">AI</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  {role.toUpperCase()} PORTAL
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            {navLinks.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-blue-600 text-white font-semibold shadow-xs"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        item.badge === "Alert"
                          ? "bg-red-500 text-white animate-pulse"
                          : "bg-blue-800 text-blue-200"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Footer */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          {/* Database indicator */}
          <div className="px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span className="truncate">{dbStatus?.supabaseConnected ? "Supabase PostgreSQL" : "Local Persistent DB"}</span>
            </div>
            <span
              className={`w-2 h-2 rounded-full ${
                dbStatus?.supabaseConnected ? "bg-emerald-400 animate-pulse" : "bg-blue-400"
              }`}
              title={dbStatus?.mode}
            />
          </div>

          {/* User profile capsule */}
          <div className="px-3 py-2 rounded-lg bg-slate-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {activeUser?.name?.charAt(0) || "U"}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">{activeUser?.name || "Logged In"}</div>
                <div className="text-[10px] text-slate-400 truncate">{activeUser?.uhid || activeUser?.email}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="md:hidden bg-slate-900 text-white p-3.5 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              QL
            </div>
            <span className="font-bold text-sm tracking-tight">QueueLess AI ({role.toUpperCase()})</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 p-3 space-y-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                    isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:bg-slate-800 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Top Operational Status Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 hidden sm:flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-medium">Hospital OPD Status:</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live & Accepting Patients
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">Hours: 08:00 AM – 06:00 PM</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Audio Chime Test Button */}
            <button
              onClick={() => playHospitalChime()}
              className="text-slate-500 hover:text-blue-600 flex items-center gap-1 text-[11px] font-medium bg-slate-50 hover:bg-blue-50 px-2 py-1 rounded border border-slate-200 transition-colors"
              title="Test hospital call chime"
            >
              <Bell className="w-3.5 h-3.5" />
              Test Audio Chime
            </button>
            <Link
              href="/emergency"
              className="text-red-600 hover:text-red-700 flex items-center gap-1 font-bold bg-red-50 px-2.5 py-1 rounded border border-red-200"
            >
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
              Emergency Intake Bay
            </Link>
          </div>
        </div>

        {/* Portal Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
