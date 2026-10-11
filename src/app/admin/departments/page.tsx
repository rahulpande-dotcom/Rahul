import React from "react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Building2, Clock, Users, Plus, IndianRupee } from "lucide-react";

export default async function AdminDepartmentsPage() {
  const departments = await db.getDepartments();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Hospital OPD Clinical Wings & Specialties ({departments.length})
          </h1>
          <p className="text-xs text-slate-500">
            Clinical specialties across all 20 departments, floor locations, standard fees (INR ₹), and consultation SLA estimates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-blue-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                    {dept.code}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 mt-2">{dept.name}</h3>
                  <span className="text-[11px] text-slate-400 block font-medium">{dept.floor}</span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
                    {dept.activeDoctorsCount} Doctors
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                {dept.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                ~{dept.avgConsultationMinutes} mins / patient
              </span>
              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                Fee: ₹{(dept.standardFee || 1500).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
