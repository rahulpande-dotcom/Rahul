import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Calendar, Stethoscope, Clock, PlusCircle, CheckCircle2 } from "lucide-react";

export default async function AppointmentsPage() {
  const user = await getCurrentUser();
  const allAppointments = await db.getAppointments();

  const myAppointments = allAppointments.filter(
    (a) =>
      (user?.id && a.patientId === user.id) ||
      (user?.email && a.patientEmail.toLowerCase() === user.email.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            My Doctor Appointments
          </h1>
          <p className="text-xs text-slate-500">
            View upcoming scheduled visits and historical consultations.
          </p>
        </div>

        <Link href="/patient/book-appointment">
          <Button size="sm" className="font-bold text-xs shadow-xs">
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
            Book New Appointment
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-6">
          {myAppointments.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-700">No Appointments Found</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You have not booked any appointments yet.
              </p>
              <Link href="/patient/book-appointment">
                <Button size="sm" className="font-bold text-xs">
                  Schedule Consultation
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-base text-slate-900">
                        {apt.doctorName}
                      </span>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                          apt.status === "CHECKED_IN"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : apt.status === "CONFIRMED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                      <span>{apt.departmentName}</span>
                      <span>•</span>
                      <span>Reason: {apt.reason}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        {apt.date}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        {apt.timeSlot}
                      </div>
                    </div>
                  </div>

                  {apt.tokenId && (
                    <Link href="/patient/queue-status">
                      <Button size="sm" variant="outline" className="text-xs font-bold text-blue-700 border-blue-200 hover:bg-blue-50">
                        View Queue Status →
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
