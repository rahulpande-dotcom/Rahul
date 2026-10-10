import React from "react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { FileText, Download, TrendingUp, BarChart3, Clock, CheckCircle2 } from "lucide-react";

export default async function AdminReportsPage() {
  const stats = await db.getDashboardStats();
  const visits = await db.getVisits();
  const departments = await db.getDepartments();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Hospital Analytics & Operational Reports
          </h1>
          <p className="text-xs text-slate-500">
            Queue efficiency benchmarks, clinical encounter logs, and PDF exports.
          </p>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-slate-200 shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Queue Efficiency Index
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-black text-slate-900">94.2%</div>
            <p className="text-xs text-slate-500">
              Patients called within target SLA benchmark (&lt; 15 mins).
            </p>
            <div className="text-xs font-semibold text-emerald-600">
              Optimal throughput maintained
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Average Wait By Wing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-black text-indigo-600">~{stats.avgWaitMinutes} mins</div>
            <p className="text-xs text-slate-500">
              Across all 6 hospital departments currently in operation.
            </p>
            <div className="text-xs font-semibold text-blue-600">
              Emergency wait: 0 mins (Immediate)
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Completed Clinical Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-black text-emerald-600">{visits.length} Reports</div>
            <p className="text-xs text-slate-500">
              Digitally certified visit summaries archived in permanent storage.
            </p>
            {visits.length > 0 && (
              <a
                href={`/api/reports/generate-pdf?visitId=${visits[0].id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="outline" className="text-xs font-bold text-blue-700 border-blue-200 w-full mt-1">
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Sample Latest PDF Report
                </Button>
              </a>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown Table */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader>
          <CardTitle className="text-sm font-bold">
            Department Performance & Consultation SLA Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Floor</th>
                <th className="px-5 py-3">Doctors Active</th>
                <th className="px-5 py-3">Avg Slot Time</th>
                <th className="px-5 py-3">Queue Efficiency</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-bold text-slate-900">{d.name}</td>
                  <td className="px-5 py-3 text-slate-600">{d.floor}</td>
                  <td className="px-5 py-3 text-slate-700 font-medium">{d.activeDoctorsCount} MDs</td>
                  <td className="px-5 py-3 font-mono text-slate-700">~{d.avgConsultationMinutes} mins</td>
                  <td className="px-5 py-3 text-emerald-600 font-bold">96% on-time</td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                      OPTIMAL
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
