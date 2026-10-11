import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Users,
  Search,
  ArrowRight,
  ShieldCheck,
  Calendar,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  AlertCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPatientsPage({
  searchParams,
}: {
  searchParams?: { q?: string; page?: string; gender?: string };
}) {
  // Server-side authentication and role enforcement
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    redirect("/login?role=admin");
  }

  const q = searchParams?.q?.trim().toLowerCase() || "";
  const gender = searchParams?.gender?.trim().toLowerCase() || "all";
  const currentPage = Math.max(1, parseInt(searchParams?.page || "1", 10));
  const pageSize = 10;

  // Retrieve profiles from authoritative DB
  const profiles = await db.getProfiles();
  let patients = profiles.filter((p) => p.role === "patient");

  // Apply search query
  if (q) {
    patients = patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.uhid && p.uhid.toLowerCase().includes(q)) ||
        (p.phone && p.phone.includes(q))
    );
  }

  // Apply gender filter
  if (gender !== "all") {
    patients = patients.filter((p) => p.gender?.toLowerCase() === gender);
  }

  // Sort newest registrations first
  patients.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalPatients = patients.length;
  const totalPages = Math.ceil(totalPatients / pageSize) || 1;
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * pageSize;
  const paginatedPatients = patients.slice(startIndex, startIndex + pageSize);

  const realCount = profiles.filter((p) => p.role === "patient" && !p.isDemo).length;
  const demoCount = profiles.filter((p) => p.role === "patient" && p.isDemo).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Registered Patients Master Index ({totalPatients})
          </h1>
          <p className="text-xs text-slate-500">
            Authoritative registry of all enrolled patient accounts, UHID medical IDs, and contact profiles.
            {realCount > 0 && (
              <span className="ml-1 text-emerald-600 font-bold">
                • {realCount} registered user{realCount === 1 ? "" : "s"}
              </span>
            )}
            {demoCount > 0 && (
              <span className="ml-1 text-slate-400 font-medium">
                • {demoCount} demo account{demoCount === 1 ? "" : "s"}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/patients">
            <Button variant="outline" size="sm" className="text-xs font-bold border-slate-200">
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Refresh
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <form method="GET" className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search by patient name, UHID, email, or phone number..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              name="gender"
              defaultValue={gender}
              className="text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <Button type="submit" size="sm" className="font-bold text-xs whitespace-nowrap">
              Filter Records
            </Button>

            {(q || gender !== "all") && (
              <Link href="/admin/patients">
                <Button variant="ghost" size="sm" className="text-xs text-slate-500">
                  Reset
                </Button>
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Patient Table */}
      <Card className="border-slate-200 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          {paginatedPatients.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No Patient Records Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {q || gender !== "all"
                  ? "No registered patients matched your search criteria. Try modifying your filters."
                  : "No registered patient accounts found in the system."}
              </p>
              {(q || gender !== "all") && (
                <Link href="/admin/patients">
                  <Button size="sm" variant="outline" className="text-xs font-bold mt-2">
                    Clear Search Filters
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="px-5 py-3">UHID</th>
                    <th className="px-5 py-3">Patient Display Name</th>
                    <th className="px-5 py-3">Email & Phone</th>
                    <th className="px-5 py-3">Age / Gender</th>
                    <th className="px-5 py-3">Blood Group</th>
                    <th className="px-5 py-3">Registered Date</th>
                    <th className="px-5 py-3">Account Status</th>
                    <th className="px-5 py-3">Emergency Contact</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedPatients.map((p) => {
                    const regDate = p.createdAt
                      ? new Date(p.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—";

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3 font-mono font-bold text-blue-700">
                          {p.uhid || "QL-NEW"}
                        </td>
                        <td className="px-5 py-3 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>{p.name}</span>
                            {p.isDemo && (
                              <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded border border-slate-200">
                                Demo
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          <div>{p.email}</div>
                          <div className="text-[11px] text-slate-400">{p.phone || "No phone"}</div>
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {p.age ? `${p.age} Yrs` : "—"} • {p.gender ? p.gender.toUpperCase() : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded font-bold border border-red-200 text-[11px]">
                            {p.bloodGroup || "O+"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{regDate}</td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <UserCheck className="w-3 h-3" />
                            ACTIVE
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-600">{p.emergencyContact || "—"}</td>
                        <td className="px-5 py-3 text-right">
                          <Link href={`/admin/patients/${p.id}`}>
                            <Button size="sm" variant="outline" className="text-xs font-bold py-1 px-2.5 h-auto">
                              Inspect →
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              <div>
                Showing <span className="font-bold">{startIndex + 1}</span> to{" "}
                <span className="font-bold">{Math.min(startIndex + pageSize, totalPatients)}</span> of{" "}
                <span className="font-bold">{totalPatients}</span> patients
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/patients?q=${encodeURIComponent(q)}&gender=${gender}&page=${validPage - 1}`}
                  className={validPage <= 1 ? "pointer-events-none opacity-40" : ""}
                >
                  <Button size="sm" variant="outline" disabled={validPage <= 1} className="text-xs h-8">
                    <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                    Previous
                  </Button>
                </Link>

                <span className="px-2 font-bold text-slate-800">
                  Page {validPage} of {totalPages}
                </span>

                <Link
                  href={`/admin/patients?q=${encodeURIComponent(q)}&gender=${gender}&page=${validPage + 1}`}
                  className={validPage >= totalPages ? "pointer-events-none opacity-40" : ""}
                >
                  <Button size="sm" variant="outline" disabled={validPage >= totalPages} className="text-xs h-8">
                    Next
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
