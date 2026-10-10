"use client";

import React, { useState, useEffect } from "react";
import { Appointment } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Calendar, Clock, Stethoscope, Ticket, CheckCircle2, Search } from "lucide-react";
import { playHospitalChime } from "@/lib/sound";

export default function StaffAppointmentsDeskPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      if (Array.isArray(data)) setAppointments(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCheckIn = async (apt: Appointment) => {
    try {
      // Issue token and check in
      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentId: apt.departmentId,
          doctorId: apt.doctorId,
          patientName: apt.patientName,
          patientPhone: apt.patientPhone,
          symptoms: apt.reason,
          type: "ONLINE",
        }),
      });
      const data = await res.json();
      if (data.token) {
        playHospitalChime();
        fetchAppointments();
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Appointments Check-In Desk
          </h1>
          <p className="text-xs text-slate-500">
            Verify arriving appointment patients and issue active OPD queue tokens.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Filter Date:</span>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
          />
        </div>
      </div>

      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-5 py-3">Patient Name</th>
                  <th className="px-5 py-3">Doctor & Dept</th>
                  <th className="px-5 py-3">Date & Slot</th>
                  <th className="px-5 py-3">Reason</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Desk Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <div className="font-bold text-slate-900">{apt.patientName}</div>
                      <div className="text-[11px] text-slate-400">{apt.patientPhone}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-800">{apt.doctorName}</div>
                      <div className="text-[11px] text-slate-500">{apt.departmentName}</div>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-700">
                      <div>{apt.date}</div>
                      <div className="text-[11px] text-blue-600 font-semibold">{apt.timeSlot}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{apt.reason}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                          apt.status === "CHECKED_IN"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {apt.status === "CHECKED_IN" ? (
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
                          Checked-In
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleCheckIn(apt)}
                          className="text-xs font-bold py-1 px-3 h-auto"
                        >
                          Check In & Issue Token
                        </Button>
                      )}
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
