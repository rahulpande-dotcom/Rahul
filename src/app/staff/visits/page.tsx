"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PrescriptionItem, VitalSigns, Doctor, Token } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  Stethoscope,
  Activity,
  Pill,
  Plus,
  Trash2,
  CheckCircle2,
  Download,
  FileText,
  AlertCircle,
  Clock,
} from "lucide-react";

function ClinicalVisitsForm() {
  const searchParams = useSearchParams();
  const paramTokenId = searchParams.get("tokenId");
  const paramPatientName = searchParams.get("patientName");

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);

  const [patientName, setPatientName] = useState(paramPatientName || "Rahul Sharma");
  const [uhid, setUhid] = useState("QL-2026-8819");
  const [selectedTokenId, setSelectedTokenId] = useState(paramTokenId || "");
  const [doctorId, setDoctorId] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [departmentName, setDepartmentName] = useState("General Medicine");
  const [roomNumber, setRoomNumber] = useState("Room 101");

  // Vitals
  const [vitals, setVitals] = useState<VitalSigns>({
    bloodPressure: "120/80 mmHg",
    pulseRate: 72,
    temperature: 98.6,
    spO2: 99,
    weightKg: 70,
  });

  // Clinical Diagnosis & Advice
  const [symptoms, setSymptoms] = useState("Headache, fatigue, elevated temperature");
  const [diagnosis, setDiagnosis] = useState("Acute Viral Infection (ICD-10 B34.9)");
  const [doctorAdvice, setDoctorAdvice] = useState("Adequate fluid intake, bed rest. Follow up if fever exceeds 101°F.");
  const [followUpDate, setFollowUpDate] = useState("");
  const [billingAmount, setBillingAmount] = useState(500);

  // Prescriptions
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    {
      id: "rx-1",
      medicineName: "Paracetamol 650mg",
      dosage: "650mg Tablet",
      frequency: "1-0-1 (After Meals)",
      duration: "3 Days",
      instructions: "Take when body temperature rises above 99°F",
    },
    {
      id: "rx-2",
      medicineName: "Cetirizine 10mg",
      dosage: "10mg Tablet",
      frequency: "0-0-1 (Bedtime)",
      duration: "5 Days",
      instructions: "May cause slight drowsiness",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [createdVisitId, setCreatedVisitId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    Promise.all([fetch("/api/doctors"), fetch("/api/tokens")])
      .then(async ([docRes, tokRes]) => {
        const [docData, tokData] = await Promise.all([docRes.json(), tokRes.json()]);
        if (Array.isArray(docData) && docData.length > 0) {
          setDoctors(docData);
          setDoctorId(docData[0].id);
          setDoctorName(docData[0].name);
          setDepartmentName(docData[0].departmentName);
          setRoomNumber(docData[0].roomNumber);
        }
        if (Array.isArray(tokData)) {
          setTokens(tokData.filter((t: Token) => t.status !== "COMPLETED"));
        }
      })
      .catch(() => {});
  }, []);

  const handleDoctorChange = (docId: string) => {
    const doc = doctors.find((d) => d.id === docId);
    if (doc) {
      setDoctorId(doc.id);
      setDoctorName(doc.name);
      setDepartmentName(doc.departmentName);
      setRoomNumber(doc.roomNumber);
    }
  };

  const handleAddMedicine = () => {
    const newItem: PrescriptionItem = {
      id: `rx-${Date.now()}`,
      medicineName: "",
      dosage: "1 Tablet",
      frequency: "1-0-1",
      duration: "5 Days",
      instructions: "After meals",
    };
    setPrescriptions((prev) => [...prev, newItem]);
  };

  const handleRemoveMedicine = (id: string) => {
    setPrescriptions((prev) => prev.filter((p) => p.id !== id));
  };

  const handlePrescriptionChange = (id: string, field: keyof PrescriptionItem, val: string) => {
    setPrescriptions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!patientName || !diagnosis || !doctorId) {
      setErrorMessage("Patient name, doctor, and clinical diagnosis are required.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: selectedTokenId || undefined,
          tokenNumber: tokens.find((t) => t.id === selectedTokenId)?.tokenNumber || "OPD-WALK",
          patientName,
          uhid,
          doctorId,
          doctorName,
          departmentName,
          roomNumber,
          symptoms,
          diagnosis,
          vitals,
          prescriptions,
          doctorAdvice,
          followUpDate: followUpDate || undefined,
          billingStatus: "PAID",
          billingAmount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to record clinical encounter.");
        setIsLoading(false);
        return;
      }

      setCreatedVisitId(data.visit.id);
    } catch {
      setErrorMessage("Network error while recording visit.");
    } finally {
      setIsLoading(false);
    }
  };

  if (createdVisitId) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/70 shadow-lg text-center p-8 space-y-4">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
        <h2 className="text-xl font-black text-slate-900">
          Consultation Recorded & Token Completed!
        </h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          The patient&apos;s visit encounter has been saved to the permanent database. A digitally certified PDF consultation summary is ready for download.
        </p>

        <div className="flex items-center justify-center gap-3 pt-2">
          <a
            href={`/api/reports/generate-pdf?visitId=${createdVisitId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="md" className="font-bold text-xs flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download PDF Report
            </Button>
          </a>
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              setCreatedVisitId(null);
              setPatientName("");
              setSelectedTokenId("");
            }}
            className="font-bold text-xs"
          >
            Consult Next Patient
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-6 sm:p-8 space-y-6">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient & Doctor Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Patient Name *</label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">UHID / Patient ID</label>
              <input
                type="text"
                value={uhid}
                onChange={(e) => setUhid(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Active Token (Optional)</label>
              <select
                value={selectedTokenId}
                onChange={(e) => {
                  setSelectedTokenId(e.target.value);
                  const tok = tokens.find((t) => t.id === e.target.value);
                  if (tok) setPatientName(tok.patientName);
                }}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">None / Manual Walk-In</option>
                {tokens.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.tokenNumber} - {t.patientName} ({t.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Consulting Doctor Selection */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Attending Physician *</label>
            <select
              value={doctorId}
              onChange={(e) => handleDoctorChange(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
            >
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} • {doc.specialization} ({doc.roomNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Vital Signs Block */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-600" />
              Clinical Vital Signs
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 font-medium">BP (mmHg)</label>
                <input
                  type="text"
                  value={vitals.bloodPressure || ""}
                  onChange={(e) => setVitals((v) => ({ ...v, bloodPressure: e.target.value }))}
                  placeholder="120/80"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 font-medium">Pulse (bpm)</label>
                <input
                  type="number"
                  value={vitals.pulseRate || ""}
                  onChange={(e) => setVitals((v) => ({ ...v, pulseRate: Number(e.target.value) }))}
                  placeholder="72"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 font-medium">Temp (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  value={vitals.temperature || ""}
                  onChange={(e) => setVitals((v) => ({ ...v, temperature: Number(e.target.value) }))}
                  placeholder="98.6"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 font-medium">SpO2 (%)</label>
                <input
                  type="number"
                  value={vitals.spO2 || ""}
                  onChange={(e) => setVitals((v) => ({ ...v, spO2: Number(e.target.value) }))}
                  placeholder="99"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 font-medium">Weight (kg)</label>
                <input
                  type="number"
                  value={vitals.weightKg || ""}
                  onChange={(e) => setVitals((v) => ({ ...v, weightKg: Number(e.target.value) }))}
                  placeholder="70"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Symptoms & Clinical Diagnosis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Reported Symptoms</label>
              <textarea
                rows={2}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Primary Diagnosis *</label>
              <textarea
                rows={2}
                required
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
              />
            </div>
          </div>

          {/* Prescription Items Table Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-emerald-600" />
                Prescribed Medications ({prescriptions.length})
              </h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddMedicine}
                className="text-xs font-bold py-1 px-2.5 h-auto"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Medication
              </Button>
            </div>

            <div className="space-y-2">
              {prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                >
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      required
                      value={rx.medicineName}
                      onChange={(e) => handlePrescriptionChange(rx.id, "medicineName", e.target.value)}
                      placeholder="Medicine Name (e.g. Amoxicillin 500mg)"
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white font-medium"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={rx.dosage}
                      onChange={(e) => handlePrescriptionChange(rx.id, "dosage", e.target.value)}
                      placeholder="Dosage (500mg)"
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={rx.frequency}
                      onChange={(e) => handlePrescriptionChange(rx.id, "frequency", e.target.value)}
                      placeholder="1-0-1"
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={rx.instructions}
                      onChange={(e) => handlePrescriptionChange(rx.id, "instructions", e.target.value)}
                      placeholder="Instructions (after food)"
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(rx.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor Advice & Follow-Up Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700">Doctor Advice & Instructions</label>
              <input
                type="text"
                value={doctorAdvice}
                onChange={(e) => setDoctorAdvice(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Recommended Follow-Up</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full font-bold shadow-md" isLoading={isLoading}>
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Complete Consultation & Generate PDF Report
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ClinicalVisitsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-blue-600" />
          Clinical Consultation & Digital Prescription Console
        </h1>
        <p className="text-xs text-slate-500">
          Record diagnostic vitals, diagnosis, and prescription. Automatically updates token to COMPLETED and generates PDF report.
        </p>
      </div>

      <Suspense fallback={<div className="text-center py-12 text-xs text-slate-400">Loading consultation console...</div>}>
        <ClinicalVisitsForm />
      </Suspense>
    </div>
  );
}
