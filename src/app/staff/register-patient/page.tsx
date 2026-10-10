"use client";

import React, { useState, useEffect } from "react";
import { Department, Doctor, Token } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  Users,
  Ticket,
  Printer,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Building2,
  Clock,
  Sparkles,
} from "lucide-react";
import { playHospitalChime } from "@/lib/sound";

export default function StaffRegisterPatientPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [formData, setFormData] = useState({
    patientName: "",
    patientPhone: "",
    patientAge: "",
    patientGender: "male",
    departmentId: "",
    doctorId: "",
    priority: "NORMAL",
    symptoms: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [issuedToken, setIssuedToken] = useState<Token | null>(null);

  useEffect(() => {
    Promise.all([fetch("/api/departments"), fetch("/api/doctors")])
      .then(async ([dRes, docRes]) => {
        const [dData, docData] = await Promise.all([dRes.json(), docRes.json()]);
        if (Array.isArray(dData)) {
          setDepartments(dData);
          if (dData.length > 0) {
            setFormData((prev) => ({ ...prev, departmentId: dData[0].id }));
          }
        }
        if (Array.isArray(docData)) setDoctors(docData);
      })
      .catch(() => {});
  }, []);

  const filteredDoctors = doctors.filter(
    (d) => !formData.departmentId || d.departmentId === formData.departmentId
  );

  useEffect(() => {
    if (filteredDoctors.length > 0) {
      setFormData((prev) => ({ ...prev, doctorId: filteredDoctors[0].id }));
    }
  }, [formData.departmentId, filteredDoctors]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.patientName || !formData.departmentId) {
      setErrorMessage("Patient name and department are required.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          type: "WALK_IN",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to register walk-in patient.");
        setIsLoading(false);
        return;
      }

      setIssuedToken(data.token);
      playHospitalChime();
    } catch {
      setErrorMessage("Network error during token registration.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setIssuedToken(null);
    setFormData((prev) => ({
      ...prev,
      patientName: "",
      patientPhone: "",
      patientAge: "",
      symptoms: "",
      priority: "NORMAL",
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          Walk-In Patient Registration & Token Counter
        </h1>
        <p className="text-xs text-slate-500">
          Reception desk fast-entry tool for physical walk-in patients. Generates immediate token slip.
        </p>
      </div>

      {issuedToken ? (
        /* Printable Token Slip Card */
        <div className="bg-white rounded-2xl border-2 border-blue-500 p-8 shadow-xl space-y-6 text-center max-w-lg mx-auto">
          <div className="border-b border-dashed border-slate-300 pb-4 space-y-1">
            <h2 className="text-base font-extrabold uppercase tracking-widest text-slate-800">
              QUEUELESS AI SMART HOSPITAL
            </h2>
            <p className="text-[11px] text-slate-500">OPD Walk-In Token Slip</p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
              {issuedToken.departmentName}
            </span>
            <div className="text-5xl font-black font-mono text-blue-700 tracking-wider">
              {issuedToken.tokenNumber}
            </div>
            <div className="text-sm font-bold text-slate-800">{issuedToken.patientName}</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">Consulting Doctor:</span>
              <span className="font-bold text-slate-800">{issuedToken.doctorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Room / Counter:</span>
              <span className="font-bold text-blue-600">{issuedToken.roomNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Queue Position:</span>
              <span className="font-bold text-slate-800">#{issuedToken.queuePosition}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estimated Wait:</span>
              <span className="font-bold text-emerald-600">~{issuedToken.estimatedWaitMinutes} minutes</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            Please watch the digital OPD monitors in the waiting area. Audio chime will announce your token.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2 print:hidden">
            <Button onClick={handlePrint} variant="outline" size="sm" className="font-bold text-xs">
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print Token Slip
            </Button>
            <Button onClick={handleReset} size="sm" className="font-bold text-xs">
              Register Next Patient
            </Button>
          </div>
        </div>
      ) : (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Patient Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Patient Full Name *</label>
                  <input
                    type="text"
                    name="patientName"
                    required
                    value={formData.patientName}
                    onChange={handleChange}
                    placeholder="e.g. Alice Walker"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    name="patientPhone"
                    value={formData.patientPhone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Age, Gender & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Age</label>
                  <input
                    type="number"
                    name="patientAge"
                    value={formData.patientAge}
                    onChange={handleChange}
                    placeholder="42"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Gender</label>
                  <select
                    name="patientGender"
                    value={formData.patientGender}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Queue Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-semibold"
                  >
                    <option value="NORMAL">Normal Priority</option>
                    <option value="SENIOR_CITIZEN">Senior Citizen (Priority Lane)</option>
                    <option value="EMERGENCY">Emergency (Immediate Red)</option>
                  </select>
                </div>
              </div>

              {/* Department & Doctor Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    Target Department *
                  </label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code}) - {d.floor}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                    Consulting Doctor
                  </label>
                  <select
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {filteredDoctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} ({doc.roomNumber})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Symptoms */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Chief Complaint / Observed Symptoms
                </label>
                <textarea
                  name="symptoms"
                  rows={2}
                  value={formData.symptoms}
                  onChange={handleChange}
                  placeholder="e.g. Acute abdominal cramps, fever, routine dressing..."
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <Button type="submit" size="lg" className="w-full font-bold shadow-md" isLoading={isLoading}>
                <Ticket className="w-4 h-4 mr-1.5" />
                Issue Walk-In Token & Add to Live Queue
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
