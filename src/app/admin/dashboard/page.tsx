import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { SupabaseStatusBanner } from "@/components/common/SupabaseStatusBanner";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  Users,
  Ticket,
  Clock,
  ShieldAlert,
  Stethoscope,
  Activity,
  Building2,
  Calendar,
  History,
  Settings,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const stats = await db.getDashboardStats();
  const auditLogs = await db.getAuditLogs();
  const departments = await db.getDepartments();
  const doctors = await db.getDoctors();

  return (
    <div className="space-y-6">
      <SupabaseStatusBanner />

      {/* Admin Executive Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Hospital Executive Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Hospital Operations & Queue Command
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Real-time surveillance of hospital OPD queues, doctors on duty, waiting durations, and database integrity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/doctors">
            <Button size="sm" variant="secondary" className="font-bold text-xs bg-white text-slate-900">
              <Stethoscope className="w-3.5 h-3.5 mr-1" />
              Manage Doctors
            </Button>
          </Link>
          <Link href="/admin/audit-logs">
            <Button size="sm" variant="outline" className="font-bold text-xs text-white border-slate-700 hover:bg-slate-800">
              <History className="w-3.5 h-3.5 mr-1" />
              Audit Logs
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button size="sm" className="font-bold text-xs shadow-md">
              <Settings className="w-3.5 h-3.5 mr-1" />
              Settings & DB
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Total Patients Today */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Patients</span>
          <div className="text-2xl font-black text-slate-900">{stats.totalPatientsToday}</div>
          <span className="text-[10px] text-emerald-600 font-bold">+18% vs yesterday</span>
        </div>

        {/* Active Queue */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 block">Waiting in Queue</span>
          <div className="text-2xl font-black text-amber-600">{stats.activeQueueCount}</div>
          <span className="text-[10px] text-slate-500 font-medium">In waiting bays</span>
        </div>

        {/* Avg Wait Duration */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 block">Avg Wait Time</span>
          <div className="text-2xl font-black text-blue-600">~{stats.avgWaitMinutes} m</div>
          <span className="text-[10px] text-blue-600 font-bold">Within SLA (15m)</span>
        </div>

        {/* Completed Visits */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 block">Completed Today</span>
          <div className="text-2xl font-black text-emerald-600">{stats.completedConsultationsCount}</div>
          <span className="text-[10px] text-slate-500 font-medium">Discharged</span>
        </div>

        {/* Doctors Active */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 block">Doctors On Duty</span>
          <div className="text-2xl font-black text-slate-900">{stats.activeDoctorsCount}</div>
          <span className="text-[10px] text-slate-500 font-medium">Across 6 wings</span>
        </div>

        {/* Emergency Trauma */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 block">Emergency Cases</span>
          <div className="text-2xl font-black text-red-600">{stats.emergencyCasesCount}</div>
          <span className="text-[10px] text-red-600 font-bold">Trauma Priority 1</span>
        </div>
      </div>

      {/* Analytics Charts */}
      <DashboardCharts />

      {/* Recent Security Audit Logs & Department Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Audit Logs */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              Recent Security & Operational Audit Trail
            </h3>
            <Link href="/admin/audit-logs" className="text-xs font-bold text-blue-600 hover:underline">
              View All Logs →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono">{log.action}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 uppercase">
                      {log.actorRole}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">{log.details}</p>
                </div>
                <div className="text-right shrink-0 text-slate-400 text-[11px] font-mono">
                  {formatDateTime(log.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Departments Quick Summary */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              OPD Wings ({departments.length})
            </h3>
            <Link href="/admin/departments" className="text-xs font-bold text-blue-600 hover:underline">
              Manage
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-800">{dept.name}</span>
                  <span className="text-[11px] text-slate-400 block">{dept.floor}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded text-[10px]">
                    {dept.activeDoctorsCount} MDs
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
