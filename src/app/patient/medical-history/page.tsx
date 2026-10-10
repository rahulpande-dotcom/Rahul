import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  ClipboardList,
  Activity,
  Download,
  Calendar,
  Pill,
  Heart,
  Stethoscope,
} from "lucide-react";

export default async function MedicalHistoryPage() {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-blue-600" />
            Electronic Medical History (EHR)
          </h1>
          <p className="text-xs text-slate-500">
            Chronological log of clinical encounters, vital sign measurements, and prescriptions.
          </p>
        </div>

        <Link href="/patient/my-reports">
          <Button variant="outline" size="sm" className="font-bold text-xs">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Download PDF Records
          </Button>
        </Link>
      </div>

      {myVisits.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="p-12 text-center space-y-2">
            <Activity className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No Historical Clinical Encounters</h3>
            <p className="text-xs text-slate-400">
              Your consultation notes and prescriptions will appear here once recorded by your doctor.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {myVisits.map((visit) => (
            <Card key={visit.id} className="border-slate-200 shadow-xs overflow-hidden">
              {/* Visit Header */}
              <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-slate-900">{visit.diagnosis}</span>
                    <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {visit.visitNumber}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {visit.doctorName} • {visit.departmentName} ({visit.roomNumber})
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {visit.visitDate}
                  </span>
                  <a
                    href={`/api/reports/generate-pdf?visitId=${visit.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="outline" className="text-xs font-bold text-blue-700 border-blue-200 hover:bg-blue-50">
                      <Download className="w-3.5 h-3.5 mr-1" />
                      PDF Report
                    </Button>
                  </a>
                </div>
              </div>

              <CardContent className="p-6 space-y-5">
                {/* Vitals Box */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-600" />
                    Recorded Vital Signs
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Blood Pressure</span>
                      <span className="font-bold text-slate-800">{visit.vitals.bloodPressure || "120/80 mmHg"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Pulse Rate</span>
                      <span className="font-bold text-slate-800">{visit.vitals.pulseRate || 72} bpm</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Temperature</span>
                      <span className="font-bold text-slate-800">{visit.vitals.temperature || 98.6}°F</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Blood Oxygen (SpO2)</span>
                      <span className="font-bold text-slate-800">{visit.vitals.spO2 || 99}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Weight</span>
                      <span className="font-bold text-slate-800">{visit.vitals.weightKg || 70} kg</span>
                    </div>
                  </div>
                </div>

                {/* Prescriptions Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-emerald-600" />
                    Prescribed Medications ({visit.prescriptions.length})
                  </h4>

                  {visit.prescriptions.length === 0 ? (
                    <div className="text-xs text-slate-400 italic">No medications prescribed.</div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                          <tr>
                            <th className="px-4 py-2">Medicine Name</th>
                            <th className="px-4 py-2">Dosage</th>
                            <th className="px-4 py-2">Frequency</th>
                            <th className="px-4 py-2">Duration</th>
                            <th className="px-4 py-2">Instructions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {visit.prescriptions.map((rx) => (
                            <tr key={rx.id} className="hover:bg-slate-50/50">
                              <td className="px-4 py-2.5 font-bold text-slate-900">{rx.medicineName}</td>
                              <td className="px-4 py-2.5 text-slate-700">{rx.dosage}</td>
                              <td className="px-4 py-2.5 text-slate-700">{rx.frequency}</td>
                              <td className="px-4 py-2.5 text-slate-700">{rx.duration}</td>
                              <td className="px-4 py-2.5 text-slate-500 italic">{rx.instructions || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Doctor Advice */}
                {visit.doctorAdvice && (
                  <div className="text-xs text-slate-600 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                    <strong className="text-blue-900">Physician Advice:</strong> {visit.doctorAdvice}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
