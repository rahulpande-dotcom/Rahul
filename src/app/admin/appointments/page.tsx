import React from "react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Calendar, Stethoscope, Clock, CheckCircle2 } from "lucide-react";

export default async function AdminAppointmentsPage() {
  const appointments = await db.getAppointments();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Hospital Master Appointments ({appointments.length})
          </h1>
          <p className="text-xs text-slate-500">
            Hospital-wide scheduling log across all medical departments.
          </p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-5 py-3">Patient Name</th>
                  <th className="px-5 py-3">Doctor</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Date & Slot</th>
                  <th className="px-5 py-3">Reason</th>
                  <th className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <div className="font-bold text-slate-900">{apt.patientName}</div>
                      <div className="text-[11px] text-slate-400">{apt.patientEmail}</div>
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-800">{apt.doctorName}</td>
                    <td className="px-5 py-3 text-slate-600">{apt.departmentName}</td>
                    <td className="px-5 py-3">
                      <div className="font-medium text-slate-900">{apt.date}</div>
                      <div className="text-[11px] text-blue-600 font-semibold">{apt.timeSlot}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-600 max-w-xs truncate">{apt.reason}</td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                          apt.status === "CHECKED_IN"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {apt.status}
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
