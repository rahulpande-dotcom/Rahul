import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { User, ClipboardList, Ticket, Download, ArrowLeft, ShieldCheck } from "lucide-react";

export default async function AdminPatientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const patient = await db.getProfileById(params.id);
  if (!patient) notFound();

  const allVisits = await db.getVisits();
  const allTokens = await db.getTokens();

  const patientVisits = allVisits.filter(
    (v) => v.patientId === patient.id || v.uhid === patient.uhid || v.patientName.toLowerCase() === patient.name.toLowerCase()
  );
  const patientTokens = allTokens.filter(
    (t) => t.patientId === patient.id || t.patientName.toLowerCase() === patient.name.toLowerCase()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/patients">
          <Button variant="ghost" size="sm" className="text-xs">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Patient Directory
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-700 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
            {patient.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">{patient.name}</h1>
              <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded border border-blue-200">
                {patient.uhid || "QL-NEW"}
              </span>
            </div>
            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
              <span>{patient.email}</span>
              <span>•</span>
              <span>{patient.phone || "No phone"}</span>
              <span>•</span>
              <span>{patient.age || 32} Yrs ({patient.gender || "M"})</span>
              <span>•</span>
              <span className="font-bold text-red-600">Blood: {patient.bloodGroup || "O+"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clinical Encounters */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-emerald-600" />
              Clinical Encounter Records ({patientVisits.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {patientVisits.length === 0 ? (
              <div className="text-xs text-slate-400 py-6 text-center">No clinical visits recorded yet.</div>
            ) : (
              <div className="space-y-3">
                {patientVisits.map((v) => (
                  <div
                    key={v.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{v.diagnosis}</div>
                      <div className="text-slate-500 text-[11px]">
                        {v.doctorName} • {v.visitDate}
                      </div>
                    </div>
                    <a
                      href={`/api/reports/generate-pdf?visitId=${v.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="outline" className="text-xs font-bold py-1 px-2.5 h-auto">
                        <Download className="w-3.5 h-3.5 mr-1" /> PDF Report
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tokens & Queue Records */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Ticket className="w-4 h-4 text-blue-600" />
              Token History ({patientTokens.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {patientTokens.length === 0 ? (
              <div className="text-xs text-slate-400 py-6 text-center">No tokens recorded.</div>
            ) : (
              <div className="space-y-3">
                {patientTokens.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-blue-700">{t.tokenNumber}</div>
                      <div className="text-slate-500 text-[11px]">{t.departmentName} • {t.doctorName}</div>
                    </div>
                    <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-slate-200 text-slate-700 uppercase">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
