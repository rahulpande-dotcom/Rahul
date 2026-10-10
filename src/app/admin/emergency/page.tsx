import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ShieldAlert, Siren, PhoneCall, Activity, ArrowRight } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default async function AdminEmergencyPage() {
  const cases = await db.getEmergencyCases();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-600" />
            Emergency Room & Trauma Response Ledger ({cases.length})
          </h1>
          <p className="text-xs text-slate-500">
            Audit logs of emergency walk-ins, triage categorizations, and trauma bay assignments.
          </p>
        </div>

        <Link href="/emergency">
          <Button size="sm" className="bg-red-600 hover:bg-red-700 font-bold text-xs shadow-md">
            + Open Public ER Intake
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-5 py-3">Token #</th>
                  <th className="px-5 py-3">Patient Name</th>
                  <th className="px-5 py-3">Triage Level</th>
                  <th className="px-5 py-3">Chief Trauma Complaint</th>
                  <th className="px-5 py-3">Consciousness</th>
                  <th className="px-5 py-3">Assigned Bay</th>
                  <th className="px-5 py-3">Registered Time</th>
                  <th className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-mono font-bold text-red-700">
                      {c.tokenNumber}
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-900">{c.patientName}</td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-bold text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded uppercase">
                        {c.triageLevel.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-700 max-w-xs truncate">{c.chiefComplaint}</td>
                    <td className="px-5 py-3 text-slate-600 font-medium">{c.consciousness}</td>
                    <td className="px-5 py-3 font-bold text-slate-800">{c.assignedBay}</td>
                    <td className="px-5 py-3 text-slate-500 font-mono text-[11px]">
                      {formatDateTime(c.registeredAt)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded text-[10px] uppercase">
                        {c.status}
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
