import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { SupabaseStatusBanner } from "@/components/common/SupabaseStatusBanner";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  Users,
  Ticket,
  Clock,
  ShieldAlert,
  Stethoscope,
  PlusCircle,
  Activity,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import { LiveQueueBoard } from "@/components/queue/LiveQueueBoard";

export default async function StaffDashboardPage() {
  const user = await getCurrentUser();
  const stats = await db.getDashboardStats();
  const departments = await db.getDepartments();
  const tokens = await db.getTokens();

  const waitingTokens = tokens.filter((t) => t.status === "WAITING");
  const emergencyTokens = tokens.filter(
    (t) => (t.isEmergency || t.priority === "EMERGENCY") && t.status !== "COMPLETED"
  );

  return (
    <div className="space-y-6">
      <SupabaseStatusBanner />

      {/* Staff Operational Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            OPD Reception & Clinical Flow Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Staff Operations Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Logged in as <strong>{user?.name}</strong> ({user?.role.toUpperCase()}). Manage patient check-ins, issue walk-in tokens, call next patients, and record consultations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/staff/register-patient">
            <Button size="lg" className="font-bold text-xs shadow-md">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Register Walk-In
            </Button>
          </Link>
          <Link href="/staff/queue">
            <Button variant="secondary" size="lg" className="font-bold text-xs bg-white text-slate-900">
              <Ticket className="w-4 h-4 mr-1.5" />
              Queue Board
            </Button>
          </Link>
          <Link href="/staff/emergency">
            <Button variant="emergency" size="lg" className="font-bold text-xs">
              <ShieldAlert className="w-4 h-4 mr-1.5" />
              ER Intake
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Waiting in Queue */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Active Queue</span>
            <Ticket className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.activeQueueCount}</div>
          <div className="text-[11px] text-slate-500 font-medium">Patients waiting in OPD</div>
        </div>

        {/* Avg Wait Time */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Avg Wait Time</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">~{stats.avgWaitMinutes} min</div>
          <div className="text-[11px] text-emerald-600 font-medium font-mono">Real-time estimate</div>
        </div>

        {/* Completed Consultations */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Completed Consultations</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.completedConsultationsCount}</div>
          <div className="text-[11px] text-slate-500 font-medium">Discharged today</div>
        </div>

        {/* Emergency Cases */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Emergency Trauma</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-3xl font-black text-red-600">{stats.emergencyCasesCount}</div>
          <div className="text-[11px] text-red-600 font-bold">Priority Level 1-2</div>
        </div>
      </div>

      {/* OPD Live Queue Control Board */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-blue-600" />
            Live Hospital OPD Calling Board
          </h2>
          <Link href="/staff/queue" className="text-xs font-bold text-blue-600 hover:underline">
            Open Full Doctor Call Desk →
          </Link>
        </div>

        <LiveQueueBoard />
      </div>
    </div>
  );
}
