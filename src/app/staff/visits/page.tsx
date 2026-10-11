"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PrescriptionItem, VitalSigns, Doctor, Token, AiClinicalSuggestion } from "@/lib/types";
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
  Sparkles,
  ShieldAlert,
  HelpCircle,
  FlaskConical,
  Scissors,
  Check,
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
  const [billingAmount, setBillingAmount] = useState(1500);

  // AI Decision Support State
  const [aiSuggestion, setAiSuggestion] = useState<AiClinicalSuggestion | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiApproved, setAiApproved] = useState(false);

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
          if (docData[0].consultationFee) {
            setBillingAmount(docData[0].consultationFee);
          }
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
      if (doc.consultationFee) {
        setBillingAmount(doc.consultationFee);
      }
    }
  };

  const handleRunAiAssist = async () => {
    if (!symptoms) {
      setAiError("Please enter patient symptoms before running AI Clinical Support.");
      return;
    }
    setIsAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/ai/clinical-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: uhid || "PAT-DEFAULT",
          doctorId: doctorId || "DOC-DEFAULT",
          symptoms,
          vitals,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || "Failed to generate AI clinical recommendations.");
      } else {
        setAiSuggestion(data.suggestion);
        setAiApproved(false);
      }
    } catch {
      setAiError("Network error while contacting AI Clinical Support engine.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApproveAi = async () => {
    if (!aiSuggestion) return;
    try {
      await fetch("/api/ai/clinical-assist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: aiSuggestion.id,
          status: "APPROVED",
          approvedByDoctorName: doctorName,
        }),
      });
      setAiApproved(true);
    } catch {}
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
      <Card className="border-emerald-200 bg-emerald-50/70 shadow-lg text-center p-8 space-y-5">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900">
            Consultation Recorded & Token Completed!
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            The patient&apos;s visit encounter has been saved to the permanent database. Official digitally certified PDF reports are ready for clinical documentation and patient handover.
          </p>
        </div>

        {/* Multi-PDF Download Suite */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200 max-w-lg mx-auto space-y-2 text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Generated Official Medical Documents (PDF):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a
              href={`/api/reports/generate-pdf?type=encounter&visitId=${createdVisitId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-xs font-semibold text-slate-800 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Clinical Encounter Report</span>
            </a>
            <a
              href={`/api/reports/generate-pdf?type=prescription&visitId=${createdVisitId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-xs font-semibold text-slate-800 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Prescription Slip (Rx)</span>
            </a>
            <a
              href={`/api/reports/generate-pdf?type=discharge&visitId=${createdVisitId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-xs font-semibold text-slate-800 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-purple-600" />
              <span>Discharge Summary</span>
            </a>
            <a
              href={`/api/reports/generate-pdf?type=history&patientId=${uhid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-xs font-semibold text-slate-800 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-amber-600" />
              <span>Medical History</span>
            </a>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              setCreatedVisitId(null);
              setPatientName("");
              setSelectedTokenId("");
              setAiSuggestion(null);
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

          {/* AI Clinical Decision Support Assistant Panel */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                    AI Clinical Decision Support (CDSS)
                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full lowercase">
                      assistive only
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Differential diagnosis, red flags, and diagnostic workup recommendations
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRunAiAssist}
                  isLoading={isAiLoading}
                  className="text-xs font-bold bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                  Analyze Symptoms with AI
                </Button>
              </div>
            </div>

            {aiError && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {aiError}
              </div>
            )}

            {aiSuggestion && (
              <div className="space-y-3.5 pt-2 border-t border-indigo-100">
                {/* Regulatory Safety Disclaimer */}
                <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Clinical Safety Protocol: </span>
                    {aiSuggestion.disclaimer}
                  </div>
                </div>

                {/* Red Flags Alert */}
                {(aiSuggestion.redFlagsDetected || aiSuggestion.redFlags || []).length > 0 && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-xs text-rose-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-rose-700 uppercase tracking-wide text-[10px]">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      Critical Clinical Red Flags Detected:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      {(aiSuggestion.redFlagsDetected || aiSuggestion.redFlags || []).map((rf, idx) => (
                        <li key={idx} className="font-medium">{rf}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Differential Diagnoses */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                    Differential Diagnoses:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(aiSuggestion.differentialDiagnoses || aiSuggestion.differentials || []).map((diff, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1 hover:border-indigo-300 transition-all text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-slate-900">{diff.condition}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              diff.likelihood === "HIGH"
                                ? "bg-rose-100 text-rose-700"
                                : diff.likelihood === "MODERATE"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {diff.likelihood}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2">{diff.clinicalRationale}</p>
                        <button
                          type="button"
                          onClick={() => setDiagnosis(diff.condition)}
                          className="text-[10px] text-indigo-600 font-bold hover:underline pt-1 block"
                        >
                          Use as Primary Diagnosis &rarr;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Investigations & Clinical Inquiries */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {(aiSuggestion.suggestedInvestigations || []).length > 0 && (
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                      <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                        <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
                        Suggested Lab / Imaging Workup:
                      </span>
                      <ul className="text-[11px] text-slate-600 space-y-1">
                        {(aiSuggestion.suggestedInvestigations || []).map((inv, idx) => (
                          <li key={idx} className="flex items-center justify-between">
                            <span>• {inv}</span>
                            <button
                              type="button"
                              onClick={() => setDoctorAdvice((prev) => prev ? `${prev}. Order ${inv}` : `Order ${inv}`)}
                              className="text-[10px] text-blue-600 font-semibold hover:underline"
                            >
                              + Add to Advice
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(aiSuggestion.suggestedClinicalQuestions || aiSuggestion.clinicalQuestions || []).length > 0 && (
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                      <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                        Targeted Inquiries:
                      </span>
                      <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                        {(aiSuggestion.suggestedClinicalQuestions || aiSuggestion.clinicalQuestions || []).map((q, idx) => (
                          <li key={idx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Clinician Approval Workflow */}
                <div className="flex items-center justify-between pt-2 border-t border-indigo-100">
                  <div className="text-[11px] text-slate-500">
                    Status: <span className="font-bold uppercase text-slate-800">{aiApproved ? "APPROVED BY PHYSICIAN" : aiSuggestion.status}</span>
                  </div>
                  {!aiApproved ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleApproveAi}
                      className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Approve Clinical Suggestions
                    </Button>
                  ) : (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Physician Review Recorded
                    </span>
                  )}
                </div>
              </div>
            )}
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

          {/* Doctor Advice, Follow-Up Date, and Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Consultation Fee (₹)</label>
              <input
                type="number"
                min={1000}
                max={3000}
                step={50}
                value={billingAmount}
                onChange={(e) => setBillingAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono font-bold"
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
