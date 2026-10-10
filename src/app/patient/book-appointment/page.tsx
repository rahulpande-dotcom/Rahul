"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Department, Doctor } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  Calendar,
  Clock,
  Stethoscope,
  Building2,
  Ticket,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const TIME_SLOTS = [
  "08:30 AM",
  "09:15 AM",
  "10:00 AM",
  "10:45 AM",
  "11:30 AM",
  "12:15 PM",
  "02:00 PM",
  "02:45 PM",
  "03:30 PM",
  "04:15 PM",
  "05:00 PM",
];

export default function BookAppointmentPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [timeSlot, setTimeSlot] = useState("10:00 AM");
  const [reason, setReason] = useState("");
  const [autoGenerateToken, setAutoGenerateToken] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState<{ appointmentId: string; tokenId?: string } | null>(null);

  useEffect(() => {
    // Load current user, departments, and doctors
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((d) => {
        if (d.user) setCurrentUser(d.user);
      })
      .catch(() => {});

    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDepartments(data);
          if (data.length > 0) setSelectedDeptId(data[0].id);
        }
      })
      .catch(() => {});

    fetch("/api/doctors")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDoctors(data);
        }
      })
      .catch(() => {});
  }, []);

  const filteredDoctors = doctors.filter((d) => !selectedDeptId || d.departmentId === selectedDeptId);

  useEffect(() => {
    if (filteredDoctors.length > 0 && (!selectedDoctorId || !filteredDoctors.some(d => d.id === selectedDoctorId))) {
      setSelectedDoctorId(filteredDoctors[0].id);
    }
  }, [selectedDeptId, filteredDoctors, selectedDoctorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedDeptId || !selectedDoctorId || !date || !timeSlot) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: currentUser?.id,
          patientName: currentUser?.name || "Patient",
          patientPhone: currentUser?.phone || "",
          patientEmail: currentUser?.email || "",
          departmentId: selectedDeptId,
          doctorId: selectedDoctorId,
          date,
          timeSlot,
          reason: reason || "General OPD Consultation",
          autoGenerateToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to book appointment.");
        setIsLoading(false);
        return;
      }

      setSuccessData({ appointmentId: data.appointment.id, tokenId: data.tokenId });
    } catch (err) {
      setErrorMessage("Network error while booking appointment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          Book OPD Consultation & Digital Token
        </h1>
        <p className="text-xs text-slate-500">
          Select department, consulting doctor, and date. A live queue token will be generated immediately.
        </p>
      </div>

      {successData ? (
        <Card className="border-emerald-200 bg-emerald-50/60 shadow-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-black text-slate-900">
              Appointment & Token Confirmed!
            </h2>

            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your consultation booking has been scheduled successfully. You can monitor your position in the live queue or view your digital token anytime.
            </p>

            <div className="flex items-center justify-center gap-3 pt-3">
              <Button
                onClick={() => router.push("/patient/my-tokens")}
                className="font-bold text-xs"
              >
                <Ticket className="w-3.5 h-3.5 mr-1.5" />
                View My Tokens
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/patient/queue-status")}
                className="font-bold text-xs"
              >
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                Live Queue Tracker
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Department & Doctor Select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    Hospital Department *
                  </label>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code}) - {d.floor}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                    Consulting Doctor *
                  </label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {filteredDoctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} - {doc.specialization} ({doc.roomNumber})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    Selected Time Slot *
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Time Slots Chips */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">Quick Slot Selection:</label>
                <div className="flex flex-wrap gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-all ${
                        timeSlot === slot
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason for Visit */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Symptoms or Reason for Consultation (Optional)
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Chronic knee pain, routine cardiac checkup, fever..."
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* Auto generate token checkbox */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="autoToken"
                  checked={autoGenerateToken}
                  onChange={(e) => setAutoGenerateToken(e.target.checked)}
                  className="rounded border-blue-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                />
                <label htmlFor="autoToken" className="text-slate-700 cursor-pointer">
                  <strong>Issue Digital Queue Token:</strong> Automatically assign a digital queue token number for this consultation so you can track queue position in real time.
                </label>
              </div>

              <Button type="submit" size="lg" className="w-full font-bold shadow-md" isLoading={isLoading}>
                Confirm Appointment & Generate Token
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
