"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  ShieldAlert,
  PhoneCall,
  Activity,
  AlertTriangle,
  HeartPulse,
  Siren,
  Clock,
  CheckCircle2,
  Bell,
  ArrowRight,
} from "lucide-react";
import { playEmergencyAlarm, playHospitalChime } from "@/lib/sound";
import { EmergencyCase } from "@/lib/types";

export default function EmergencyPage() {
  const [formData, setFormData] = useState({
    patientName: "Unidentified Emergency Patient",
    approxAge: "",
    gender: "male",
    triageLevel: "LEVEL_1_RESUSCITATION",
    chiefComplaint: "",
    consciousness: "ALERT",
    arrivalType: "AMBULANCE",
    contactPerson: "",
    contactPhone: "",
    assignedBay: "ER Bay 1",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [issuedCase, setIssuedCase] = useState<EmergencyCase | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeCases, setActiveCases] = useState<EmergencyCase[]>([]);

  const fetchCases = async () => {
    try {
      const res = await fetch("/api/emergency");
      const data = await res.json();
      if (Array.isArray(data)) {
        setActiveCases(data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuickSymptom = (symptom: string, level: string) => {
    setFormData((prev) => ({
      ...prev,
      chiefComplaint: symptom,
      triageLevel: level,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.chiefComplaint) {
      setErrorMessage("Please describe the emergency condition or trauma reason.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Emergency registration failed.");
        setIsLoading(false);
        return;
      }

      setIssuedCase(data.emergencyCase);
      playEmergencyAlarm();
      fetchCases();
    } catch (err) {
      setErrorMessage("Network error during emergency dispatch.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <Navbar />

      {/* Emergency Top Banner */}
      <div className="bg-red-600 text-white px-4 py-3 border-b border-red-700 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-bold">
            <Siren className="w-5 h-5 animate-spin shrink-0" />
            <span>24/7 TRAUMA & ACUTE RESUSCITATION WING • NO AUTHENTICATION REQUIRED</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="tel:108"
              className="bg-white text-red-700 px-2.5 py-1 rounded font-extrabold hover:bg-red-50 flex items-center gap-1.5 text-xs shadow"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Ambulance: 108
            </a>
            <a
              href="tel:+91809114357"
              className="bg-red-800 text-white px-2.5 py-1 rounded font-bold hover:bg-red-700 flex items-center gap-1.5 text-xs border border-red-500"
            >
              BLR: +91 (80) 911-4357
            </a>
            <a
              href="tel:+918162278255"
              className="bg-red-800 text-white px-2.5 py-1 rounded font-bold hover:bg-red-700 flex items-center gap-1.5 text-xs border border-red-500"
            >
              TMK: +91 (816) 227-8255
            </a>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800 text-red-300 text-xs font-bold">
            <HeartPulse className="w-4 h-4 text-red-400" />
            Instant Emergency Triage Intake
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Emergency Walk-In & Trauma Intake
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Anyone (patient, relative, paramedic, or good samaritan) can immediately register a critical patient without creating an account or logging in. A priority <strong>RED EMERGENCY TOKEN</strong> is issued instantaneously.
          </p>
        </div>

        {/* Issued Emergency Ticket Result */}
        {issuedCase && (
          <div className="bg-red-950/90 border-2 border-red-500 rounded-2xl p-6 shadow-2xl text-white space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-red-300">
                  Priority 1 Emergency Token Allocated
                </span>
                <div className="text-4xl sm:text-5xl font-black font-mono text-amber-400 tracking-wider">
                  {issuedCase.tokenNumber}
                </div>
              </div>

              <div className="bg-red-600 px-4 py-2 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider block text-red-100">
                  Assigned ER Bay
                </span>
                <span className="text-lg font-black text-white">{issuedCase.assignedBay}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-red-900/60 rounded-xl text-xs">
              <div>
                <span className="text-red-300 block">Patient Name:</span>
                <span className="font-bold text-white text-sm">{issuedCase.patientName}</span>
              </div>
              <div>
                <span className="text-red-300 block">Triage Level:</span>
                <span className="font-bold text-amber-300 text-sm">
                  {issuedCase.triageLevel.replace("_", " ")}
                </span>
              </div>
              <div>
                <span className="text-red-300 block">Attending Doctor:</span>
                <span className="font-bold text-white text-sm">
                  {issuedCase.doctorName || "Emergency Physician"}
                </span>
              </div>
            </div>

            <p className="text-xs text-red-200">
              Trauma team and nurses have been signaled. Please escort patient directly to <strong>{issuedCase.assignedBay}</strong> on Ground Floor.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIssuedCase(null)}
                className="text-xs font-bold"
              >
                Register Another Emergency Case
              </Button>
              <Link href="/patient/queue-status">
                <Button size="sm" className="bg-white text-red-700 hover:bg-red-50 font-bold text-xs">
                  Monitor Live Status
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form */}
          <div className="lg:col-span-7 bg-slate-800/90 rounded-2xl border border-slate-700 p-6 shadow-xl space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-400" />
              Rapid Patient Triage Intake
            </h2>

            {/* Mobile-Friendly Urgency Level Cards */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Select Urgency Level (Mobile Quick-Choice):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  {
                    id: "CRITICAL_LIFE_THREATENING",
                    level: "LEVEL_1_RESUSCITATION",
                    label: "Critical",
                    desc: "Life-Threatening / Unconscious / Severe Trauma",
                    bg: "bg-red-950/80 border-red-500 text-red-200",
                    badge: "LEVEL 1 • RED",
                    preset: "Critical life-threatening acute trauma / respiratory collapse",
                  },
                  {
                    id: "SERIOUS_URGENT",
                    level: "LEVEL_2_EMERGENT",
                    label: "Serious",
                    desc: "Severe Pain / High Fever / Acute Bleeding",
                    bg: "bg-amber-950/80 border-amber-500 text-amber-200",
                    badge: "LEVEL 2 • ORANGE",
                    preset: "Acute emergent distress requiring attention within 10 minutes",
                  },
                  {
                    id: "OTHER_EMERGENCY",
                    level: "LEVEL_3_URGENT",
                    label: "Other Urgent",
                    desc: "Fracture / Persistent Vomiting / Sprain",
                    bg: "bg-yellow-950/80 border-yellow-500 text-yellow-200",
                    badge: "LEVEL 3 • YELLOW",
                    preset: "Urgent non-resuscitation emergency need",
                  },
                  {
                    id: "CUSTOM",
                    level: "LEVEL_2_EMERGENT",
                    label: "Custom",
                    desc: "Describe Specific Condition Below",
                    bg: "bg-slate-800 border-slate-500 text-slate-200",
                    badge: "MANUAL TRIAGE",
                    preset: "",
                  },
                ].map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        triageLevel: choice.level,
                        chiefComplaint: choice.preset || prev.chiefComplaint,
                      }));
                    }}
                    className={`p-3 rounded-xl border-2 text-left transition-all hover:scale-[1.02] flex flex-col justify-between ${
                      formData.triageLevel === choice.level ? `${choice.bg} ring-2 ring-white/50` : "bg-slate-900 border-slate-700 text-slate-400"
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider block opacity-75">
                        {choice.badge}
                      </span>
                      <span className="text-sm font-black text-white block mt-0.5">{choice.label}</span>
                    </div>
                    <span className="text-[11px] leading-tight block mt-1.5 opacity-80">{choice.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Symptom Chips */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400">
                Quick Select Common Emergency Complaints:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Severe Chest Pain / Heart Attack", level: "LEVEL_1_RESUSCITATION" },
                  { label: "Severe Road Accident / Trauma", level: "LEVEL_1_RESUSCITATION" },
                  { label: "Acute Shortness of Breath", level: "LEVEL_2_EMERGENT" },
                  { label: "High Fever with Seizure", level: "LEVEL_2_EMERGENT" },
                  { label: "Severe Allergic Anaphylaxis", level: "LEVEL_1_RESUSCITATION" },
                ].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => handleQuickSymptom(s.label, s.level)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 transition-colors"
                  >
                    + {s.label}
                  </button>
                ))}
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-900/60 border border-red-500 rounded-lg text-xs text-red-200">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">
                    Patient Name (or John/Jane Doe) *
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    required
                    value={formData.patientName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Approximate Age</label>
                  <input
                    type="number"
                    name="approxAge"
                    value={formData.approxAge}
                    onChange={handleChange}
                    placeholder="e.g. 35"
                    className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Triage Level & Arrival Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Triage Severity Level</label>
                  <select
                    name="triageLevel"
                    value={formData.triageLevel}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="LEVEL_1_RESUSCITATION">Level 1: Resuscitation (Immediate Red)</option>
                    <option value="LEVEL_2_EMERGENT">Level 2: Emergent (Within 10 mins)</option>
                    <option value="LEVEL_3_URGENT">Level 3: Urgent (Within 30 mins)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Consciousness Status</label>
                  <select
                    name="consciousness"
                    value={formData.consciousness}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="ALERT">Alert & Oriented</option>
                    <option value="VOICE_RESPONSIVE">Voice Responsive Only</option>
                    <option value="PAIN_RESPONSIVE">Pain Responsive Only</option>
                    <option value="UNRESPONSIVE">Unresponsive / Comatose</option>
                  </select>
                </div>
              </div>

              {/* Chief Complaint */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  Chief Emergency Complaint / Observed Trauma *
                </label>
                <textarea
                  name="chiefComplaint"
                  required
                  rows={2}
                  value={formData.chiefComplaint}
                  onChange={handleChange}
                  placeholder="Describe patient's condition, injuries, or critical symptoms..."
                  className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Contact Person / Paramedic Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">
                    Accompanying Person / Paramedic
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder="Name or Ambulance Unit"
                    className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Contact Phone</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold shadow-lg shadow-red-600/30 text-base"
                isLoading={isLoading}
              >
                Dispatch Emergency Case & Issue Priority Token
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </div>

          {/* Right ER Bay Status */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Dial Card */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                Hospital Emergency Speed Dials
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-lg flex items-center justify-between border border-slate-700">
                  <div>
                    <span className="font-bold text-white block">Paramedic & Ambulance Dispatch</span>
                    <span className="text-slate-400 text-[11px]">Primary trauma ambulance line</span>
                  </div>
                  <a href="tel:911" className="text-emerald-400 font-bold hover:underline">
                    +1 (800) 911-HELP
                  </a>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg flex items-center justify-between border border-slate-700">
                  <div>
                    <span className="font-bold text-white block">ER Nursing Desk Direct</span>
                    <span className="text-slate-400 text-[11px]">Ground floor resuscitation wing</span>
                  </div>
                  <a href="tel:108" className="text-emerald-400 font-bold hover:underline">
                    Ext 108
                  </a>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg flex items-center justify-between border border-slate-700">
                  <div>
                    <span className="font-bold text-white block">Poison & Toxicology Control</span>
                    <span className="text-slate-400 text-[11px]">24/7 toxic exposure guidance</span>
                  </div>
                  <span className="text-amber-400 font-bold">1-800-222-1222</span>
                </div>
              </div>
            </div>

            {/* Active ER Cases Monitor */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  Active ER Cases ({activeCases.length})
                </h3>
                <span className="text-[10px] text-slate-400">Live Trauma Feed</span>
              </div>

              {activeCases.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No active ER cases at this time. All bays available.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto">
                  {activeCases.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/80 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-amber-400 font-mono">{c.tokenNumber}</span>
                        <span className="text-red-400 font-semibold text-[11px]">{c.assignedBay}</span>
                      </div>
                      <div className="text-white font-medium">{c.patientName}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{c.chiefComplaint}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
