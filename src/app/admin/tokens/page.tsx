import React from "react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Ticket, Clock, CheckCircle2, AlertTriangle, Stethoscope } from "lucide-react";
import { getStatusBadgeClass, getPriorityBadgeClass, formatTimeOnly } from "@/lib/utils";

export default async function AdminTokensPage() {
  const tokens = await db.getTokens();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Ticket className="w-6 h-6 text-blue-600" />
            Hospital Tokens Master Ledger ({tokens.length})
          </h1>
          <p className="text-xs text-slate-500">
            Real-time OPD token progression, priority tiers, and queue timestamps.
          </p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-5 py-3">Token #</th>
                  <th className="px-5 py-3">Patient Name</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Doctor & Room</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Timestamps (Gen / Call / Done)</th>
                  <th className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tokens.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-mono font-bold text-blue-700">
                      {t.tokenNumber}
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-900">{t.patientName}</td>
                    <td className="px-5 py-3 text-slate-600">{t.departmentName}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {t.doctorName || "Pending"} ({t.roomNumber || "Desk"})
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${getPriorityBadgeClass(
                          t.priority
                        )}`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[11px] font-mono text-slate-500">
                      {t.type}
                    </td>
                    <td className="px-5 py-3 text-[11px] font-mono text-slate-500">
                      {formatTimeOnly(t.generatedAt)} / {formatTimeOnly(t.calledAt)} / {formatTimeOnly(t.completedAt)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${getStatusBadgeClass(
                          t.status
                        )}`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
