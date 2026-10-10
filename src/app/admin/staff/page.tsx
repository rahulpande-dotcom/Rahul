import React from "react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { UserCheck, Mail, Phone, ShieldCheck, Plus } from "lucide-react";

export default async function AdminStaffPage() {
  const profiles = await db.getProfiles();
  const staffMembers = profiles.filter((p) => p.role === "staff" || p.role === "admin");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600" />
            Hospital Staff & Operators ({staffMembers.length})
          </h1>
          <p className="text-xs text-slate-500">
            Administrative and clinical receptionists authorized for OPD token and check-in desks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {staffMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-blue-300 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{member.name}</h3>
                  <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded uppercase">
                    {member.role}
                  </span>
                </div>
              </div>

              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Active Account" />
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{member.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{member.phone || "+1 (555) 019-4822"}</span>
              </div>
              <div className="text-[11px] text-slate-400 pt-1">
                UHID / Staff ID: <span className="font-mono text-slate-700">{member.uhid || "QL-STF-014"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
