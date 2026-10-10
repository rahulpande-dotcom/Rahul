"use client";

import React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const HOURLY_DATA = [
  { hour: "08 AM", tokens: 12, waitMins: 6 },
  { hour: "09 AM", tokens: 28, waitMins: 10 },
  { hour: "10 AM", tokens: 45, waitMins: 15 },
  { hour: "11 AM", tokens: 52, waitMins: 18 },
  { hour: "12 PM", tokens: 36, waitMins: 14 },
  { hour: "01 PM", tokens: 20, waitMins: 8 },
  { hour: "02 PM", tokens: 38, waitMins: 12 },
  { hour: "03 PM", tokens: 42, waitMins: 14 },
  { hour: "04 PM", tokens: 30, waitMins: 9 },
  { hour: "05 PM", tokens: 15, waitMins: 5 },
];

const DEPT_DISTRIBUTION = [
  { name: "General Med", value: 38, color: "#2563eb" },
  { name: "Cardiology", value: 24, color: "#0d9488" },
  { name: "Pediatrics", value: 18, color: "#8b5cf6" },
  { name: "Orthopedics", value: 15, color: "#f59e0b" },
  { name: "Neurology", value: 10, color: "#ec4899" },
  { name: "Emergency", value: 12, color: "#ef4444" },
];

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Hourly OPD Traffic Area Chart */}
      <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Hourly OPD Patient Volume & Average Wait Times
            </h3>
            <p className="text-xs text-slate-500">Live influx of tokens checked in across hospital wings</p>
          </div>
          <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
            Today
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={HOURLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#1e293b",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="tokens"
                stroke="#2563eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#tokenGradient)"
                name="Tokens Issued"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Distribution Donut Chart */}
      <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            OPD Load Distribution
          </h3>
          <p className="text-xs text-slate-500">Department percentage of today's total volume</p>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={DEPT_DISTRIBUTION}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {DEPT_DISTRIBUTION.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
          {DEPT_DISTRIBUTION.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-600 truncate">{item.name}</span>
              <span className="font-bold text-slate-900 ml-auto">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
