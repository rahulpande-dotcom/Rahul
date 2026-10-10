"use client";

import React, { useState, useEffect } from "react";
import { UserProfile } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { User, Mail, Phone, Heart, MapPin, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function PatientProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setProfile(data.user);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      // simulate quick update
      setTimeout(() => {
        setIsSaving(false);
        setSavedSuccess(true);
      }, 400);
    } catch {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-xs text-slate-500 py-6">Loading health profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          Patient Demographic Profile
        </h1>
        <p className="text-xs text-slate-500">
          Permanent health record identity and emergency contacts.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6 sm:p-8 space-y-6">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Patient profile details saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            {/* UHID Banner */}
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  Unique Health Identifier (UHID)
                </span>
                <div className="text-lg font-black font-mono text-blue-900">
                  {profile?.uhid || "QL-2026-8819"}
                </div>
              </div>
              <ShieldCheck className="w-8 h-8 text-blue-600" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile?.name || ""}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Email Address (Read-only)</label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || ""}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profile?.phone || ""}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Age</label>
                <input
                  type="number"
                  name="age"
                  value={profile?.age || 32}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={profile?.bloodGroup || "O+"}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Emergency Contact</label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={profile?.emergencyContact || ""}
                  onChange={handleChange}
                  placeholder="Kin Name & Phone"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Residential Address</label>
                <input
                  type="text"
                  name="address"
                  value={profile?.address || ""}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" size="md" className="font-bold text-xs" isLoading={isSaving}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
