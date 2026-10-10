import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Users, Search, ArrowRight, ShieldCheck, Phone, Mail } from "lucide-react";

export default async function StaffPatientsPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const q = searchParams?.q?.toLowerCase() || "";
  const profiles = await db.getProfiles();
  let patients = profiles.filter((p) => p.role === "patient");

  if (q) {
    patients = patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.uhid && p.uhid.toLowerCase().includes(q)) ||
        (p.phone && p.phone.includes(q))
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Patient Directory & Master Index
          </h1>
          <p className="text-xs text-slate-500">
            Registered patients with permanent Unique Health Identifiers (UHID).
          </p>
        </div>

        <Link href="/staff/register-patient">
          <Button size="sm" className="font-bold text-xs shadow-xs">
            + New Walk-in Patient
          </Button>
        </Link>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <form method="GET" className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search by patient name, UHID, email, or mobile..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <Button type="submit" size="sm" className="font-bold text-xs">
            Search
          </Button>
        </form>
      </div>

      {/* Patients Table */}
      <Card className="border-slate-200 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-5 py-3">UHID / Patient ID</th>
                  <th className="px-5 py-3">Patient Name</th>
                  <th className="px-5 py-3">Contact Details</th>
                  <th className="px-5 py-3">Age / Gender</th>
                  <th className="px-5 py-3">Blood Group</th>
                  <th className="px-5 py-3 text-right">Medical Record</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-mono font-bold text-blue-700">
                      {p.uhid || "QL-NEW"}
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-900">{p.name}</td>
                    <td className="px-5 py-3 text-slate-600">
                      <div>{p.phone || "No phone"}</div>
                      <div className="text-[11px] text-slate-400">{p.email}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {p.age || "—"} Yrs • {p.gender ? p.gender.toUpperCase() : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded font-bold border border-red-200">
                        {p.bloodGroup || "O+"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/staff/patients/${p.id}`}>
                        <Button size="sm" variant="outline" className="text-xs font-bold py-1 px-2.5 h-auto">
                          View Record →
                        </Button>
                      </Link>
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
