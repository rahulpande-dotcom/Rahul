"use client";

import React, { useState, useEffect } from "react";
import { HospitalSettings } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  Settings,
  Database,
  Building2,
  Clock,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<HospitalSettings | null>(null);
  const [dbStatus, setDbStatus] = useState<{ supabaseConnected: boolean; mode: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
        if (data.databaseStatus) setDbStatus(data.databaseStatus);
      })
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => (prev ? { ...prev, [name]: type === "checkbox" ? checked : value } : null));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          Hospital System Settings & Database Hub
        </h1>
        <p className="text-xs text-slate-500">
          Configure queue parameters, hospital branding, operating hours, and Supabase PostgreSQL linkage.
        </p>
      </div>

      {/* Supabase Connection Status Card */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-900 text-white">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
            <Database className="w-4 h-4 text-blue-400" />
            Database & Supabase Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Active Storage Provider:</span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    dbStatus?.supabaseConnected
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {dbStatus?.mode || "Local Persistent Database Engine"}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {dbStatus?.supabaseConnected
                  ? "Live Supabase PostgreSQL connection established. Row Level Security and triggers are active."
                  : "All patient registrations, tokens, visits, and emergency intakes persist permanently to disk."}
              </p>
            </div>

            <span
              className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                dbStatus?.supabaseConnected ? "bg-emerald-500 animate-pulse" : "bg-blue-500"
              }`}
            />
          </div>

          {!dbStatus?.supabaseConnected && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-blue-950">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                How to Link Your Live Supabase PostgreSQL Instance:
              </div>
              <ol className="list-decimal pl-5 space-y-1 text-slate-700">
                <li>Create a free project at <strong>supabase.com</strong>.</li>
                <li>Run the provided schema in Supabase SQL editor: <code>supabase/schema.sql</code>.</li>
                <li>Add your credentials to <code>.env.local</code>:
                  <div className="font-mono bg-white p-2 rounded border border-blue-200 mt-1 select-all text-[11px]">
                    NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co<br />
                    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
                  </div>
                </li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hospital Profile Settings Form */}
      {settings && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Hospital Parameters & Queue Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Hospital parameters saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Hospital Legal Name</label>
                  <input
                    type="text"
                    name="hospitalName"
                    value={settings.hospitalName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Emergency Hotline</label>
                  <input
                    type="text"
                    name="emergencyHotline"
                    value={settings.emergencyHotline}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-bold text-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">OPD Start Time</label>
                  <input
                    type="text"
                    name="opdStartTime"
                    value={settings.opdStartTime}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">OPD End Time</label>
                  <input
                    type="text"
                    name="opdEndTime"
                    value={settings.opdEndTime}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Default Slot (Mins)</label>
                  <input
                    type="number"
                    name="defaultAvgConsultationMins"
                    value={settings.defaultAvgConsultationMins}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Hospital Physical Address</label>
                <input
                  type="text"
                  name="address"
                  value={settings.address}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" size="md" className="font-bold text-xs" isLoading={isSaving}>
                  Save Configuration
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
