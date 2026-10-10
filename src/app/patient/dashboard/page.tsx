import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { SupabaseStatusBanner } from "@/components/common/SupabaseStatusBanner";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { TokenCard } from "@/components/queue/TokenCard";
import {
  Calendar,
  Ticket,
  Clock,
  FileText,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Download,
  PlusCircle,
  Activity,
} from "lucide-react";

export default async function PatientDashboardPage() {
  const user = await getCurrentUser();
  const allTokens = await db.getTokens();
  const allAppointments = await db.getAppointments();
  const allVisits = await db.getVisits();

  // Filter for this patient
  const myTokens = allTokens.filter(
    (t) =>
      (user?.id && t.patientId === user.id) ||
      (user?.name && t.patientName.toLowerCase() === user.name.toLowerCase())
  );
  const activeToken = myTokens.find(
    (t) => t.status === "WAITING" || t.status === "CALLED" || t.status === "IN_CONSULTATION"
  );

  const myAppointments = allAppointments.filter(
    (a) =>
      (user?.id && a.patientId === user.id) ||
      (user?.email && a.patientEmail.toLowerCase() === user.email.toLowerCase())
  );
  const nextAppointment = myAppointments.find((a) => a.status === "CONFIRMED" || a.status === "CHECKED_IN");

  const myVisits = allVisits.filter(
    (v) =>
      (user?.id && v.patientId === user.id) ||
      (user?.uhid && v.uhid === user.uhid) ||
      (user?.name && v.patientName.toLowerCase() === user.name.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <SupabaseStatusBanner />

      {/* Patient Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/30 text-blue-100 text-xs font-semibold backdrop-blur-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
            Unique Health ID: <strong>{user?.uhid || "QL-2026-8819"}</strong>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.name || "Patient"}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Track your OPD tokens in real-time, view estimated consultation wait times, and access digital prescriptions anytime.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <Link href="/patient/book-appointment">
            <Button size="lg" className="w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm shadow-md">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Book Token
            </Button>
          </Link>
          <Link href="/patient/queue-status">
            <Button variant="outline" size="lg" className="w-full sm:w-auto border-blue-300 text-white hover:bg-blue-600/50 font-bold text-sm">
              <Clock className="w-4 h-4 mr-1.5" />
              Live Queue Status
            </Button>
          </Link>
        </div>
      </div>

      {/* 2-Column Grid: Active Token & Next Appointment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Token Tracker Card */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="bg-slate-50/50">
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Ticket className="w-4 h-4 text-blue-600" />
                Active OPD Queue Token
              </CardTitle>
              {activeToken && (
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Live Status
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {activeToken ? (
              <div className="space-y-4">
                <TokenCard token={activeToken} isCurrentPatient={true} />
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                  <span>Symptom / Notes: {activeToken.symptoms || "Standard OPD checkup"}</span>
                  <Link href="/patient/queue-status" className="text-blue-600 font-bold hover:underline">
                    Detailed Screen →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">No Active Token Today</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    You do not have any tokens currently waiting in the OPD queue.
                  </p>
                </div>
                <Link href="/patient/book-appointment">
                  <Button size="sm" className="font-bold">
                    Book an OPD Token Now
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Appointment Card */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="bg-slate-50/50">
            <div className="flex items-center justify-between w-full">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Scheduled Appointment
              </CardTitle>
              <Link href="/patient/appointments" className="text-xs font-bold text-blue-600 hover:underline">
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {nextAppointment ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-500">
                      {nextAppointment.departmentName}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      {nextAppointment.status}
                    </span>
                  </div>

                  <div className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    {nextAppointment.doctorName}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-1 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {nextAppointment.date}
                    </div>
                    <div className="flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {nextAppointment.timeSlot}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  Reason for visit: <em>{nextAppointment.reason}</em>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">No Scheduled Appointments</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    You have no upcoming doctor visits booked.
                  </p>
                </div>
                <Link href="/patient/book-appointment">
                  <Button variant="outline" size="sm" className="font-bold">
                    Schedule Doctor Visit
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Medical Encounters & One-Click PDF Download */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="bg-slate-50/50">
          <div className="flex items-center justify-between w-full">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Recent Clinical Consultations & Prescriptions
            </CardTitle>
            <Link href="/patient/my-reports" className="text-xs font-bold text-blue-600 hover:underline">
              All Reports ({myVisits.length})
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {myVisits.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              No previous clinical consultations on record yet.
            </div>
          ) : (
            <div className="space-y-4">
              {myVisits.slice(0, 3).map((visit) => (
                <div
                  key={visit.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{visit.diagnosis}</span>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {visit.visitNumber}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {visit.doctorName} • {visit.departmentName} • {visit.visitDate}
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium pt-1">
                      {visit.prescriptions.length} Prescribed Medicine{visit.prescriptions.length > 1 ? "s" : ""} (e.g. {visit.prescriptions[0]?.medicineName || "Standard prescription"})
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`/api/reports/generate-pdf?visitId=${visit.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="outline" className="text-xs font-bold flex items-center gap-1.5 text-blue-700 border-blue-200 hover:bg-blue-50">
                        <Download className="w-3.5 h-3.5" />
                        Download PDF Report
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
