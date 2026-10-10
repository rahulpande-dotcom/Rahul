import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { FileText, Download, ShieldCheck, Calendar, Stethoscope, Printer } from "lucide-react";

export default async function MyReportsPage() {
  const user = await getCurrentUser();
  const allVisits = await db.getVisits();

  const myVisits = allVisits.filter(
    (v) =>
      (user?.id && v.patientId === user.id) ||
      (user?.uhid && v.uhid === user.uhid) ||
      (user?.name && v.patientName.toLowerCase() === user.name.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          One-Click Patient Medical Reports (PDF)
        </h1>
        <p className="text-xs text-slate-500">
          Official, digitally verified clinical consultation summaries generated with pdf-lib.
        </p>
      </div>

      {myVisits.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="p-12 text-center text-xs text-slate-500 space-y-2">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="font-bold text-slate-700">No Consultation Reports Available</div>
            <p className="text-slate-400">Reports are created automatically when your doctor completes a consultation.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myVisits.map((visit) => (
            <Card key={visit.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                      {visit.visitNumber}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 pt-1">
                      {visit.diagnosis}
                    </h3>
                  </div>

                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 border-y border-slate-100 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Consulting Doctor:</span>
                    <span className="font-semibold text-slate-800">{visit.doctorName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-semibold text-slate-800">{visit.departmentName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Encounter Date:</span>
                    <span className="font-semibold text-slate-800">{visit.visitDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Prescriptions:</span>
                    <span className="font-semibold text-slate-800">{visit.prescriptions.length} Meds</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <a
                    href={`/api/reports/generate-pdf?visitId=${visit.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button size="md" className="w-full font-bold text-xs flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Download Official PDF Report
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
