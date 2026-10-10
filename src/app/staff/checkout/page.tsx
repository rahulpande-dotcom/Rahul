import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ClipboardList, Download, CheckCircle2, Clock, Printer, DollarSign } from "lucide-react";
import { formatTimeOnly } from "@/lib/utils";

export default async function StaffCheckoutPage() {
  const visits = await db.getVisits();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-blue-600" />
          Discharge & Billing Checkout Desk
        </h1>
        <p className="text-xs text-slate-500">
          Verify patient consultation timestamps, billing payment status, and print discharge summaries.
        </p>
      </div>

      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-5 py-3">Visit & Token #</th>
                  <th className="px-5 py-3">Patient Name & UHID</th>
                  <th className="px-5 py-3">Attending Doctor</th>
                  <th className="px-5 py-3">Clinical Diagnosis</th>
                  <th className="px-5 py-3">Timestamps (In → Consult → Out)</th>
                  <th className="px-5 py-3">Billing</th>
                  <th className="px-5 py-3 text-right">PDF Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <div className="font-bold text-slate-900">{v.visitNumber}</div>
                      <div className="font-mono text-blue-600 text-[11px]">{v.tokenNumber}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-bold text-slate-900">{v.patientName}</div>
                      <div className="font-mono text-slate-400 text-[11px]">{v.uhid}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-700 font-medium">
                      {v.doctorName}
                    </td>
                    <td className="px-5 py-3 text-slate-600 max-w-xs truncate">
                      {v.diagnosis}
                    </td>
                    <td className="px-5 py-3 text-slate-500 font-mono text-[11px]">
                      {formatTimeOnly(v.checkInTimestamp)} → {formatTimeOnly(v.consultationTimestamp)} → {formatTimeOnly(v.checkoutTimestamp)}
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px]">
                        ${v.billingAmount} {v.billingStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <a
                        href={`/api/reports/generate-pdf?visitId=${v.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="outline" className="text-xs font-bold py-1 px-2.5 h-auto text-blue-700 border-blue-200">
                          <Download className="w-3.5 h-3.5 mr-1" />
                          PDF Report
                        </Button>
                      </a>
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
