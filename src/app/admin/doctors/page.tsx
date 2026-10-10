import React from "react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Stethoscope, Building2, MapPin, CheckCircle2, DollarSign } from "lucide-react";

export default async function AdminDoctorsPage() {
  const doctors = await db.getDoctors();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-blue-600" />
            Physicians & OPD Consultation Rooms ({doctors.length})
          </h1>
          <p className="text-xs text-slate-500">
            Assigned doctors, room/desk allocation, consultation fee, and active OPD schedules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {doctors.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-blue-300 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {doc.departmentName}
                </span>
                <h3 className="font-bold text-base text-slate-900 pt-1">{doc.name}</h3>
                <p className="text-xs text-slate-500">{doc.specialization}</p>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded">
                  {doc.roomNumber}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Available
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Consultation Fee:</span>
                <span className="font-bold text-slate-900">${doc.consultationFee}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Duty Days:</span>
                <span className="text-slate-700 truncate">{doc.availableDays.slice(0, 3).join(", ")}...</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
